import { PaginationQueryParams } from '../types/PaginationQueryParams';
import { throwError } from '@errors/throwError';
import { GeneralErrorKey } from '@errors/general/generalErrorsKeys';
import { UserErrorKey } from '@errors/user/userErrorsKeys';
import { getCachedAdminToken, keycloakRequest } from '@helpers/keycloak';
import { checkSameUsernameKeycloak, createUserKeycloak, disableUserKeycloak, enableUserKeycloak, fetchUserByIdKeycloak, fetchUsersKeycloak, generateSecretKey, updateUserKeycloak, updateUserPasswordKeycloak } from '@models/keycloak/user_keycloak';
import { assignRoleToUser, deleteRoleUser, fetchRealmsRolesUser } from '@models/keycloak/role_keycloak';
import { sendEmail } from '@helpers/email';

export const fetchUser = async (params: PaginationQueryParams, status: any) => {
  try {
    const { page, size, search, sort, order } = params;
    const first = (page - 1) * size;
    const max = size;

    // --- SORT HANDLER ---
    // Handle case: sort bisa string ('username') atau object ({ username: 'asc' })
    let sortField = typeof sort === "string" ? sort : Object.keys(sort || {})[0];
    let sortOrder = order || (sort && (sort as any)[sortField]) || "asc";

    // Valid fields yang bisa disort Keycloak
    const validSortFields = ["username", "email", "firstName", "lastName", "createdTimestamp"];
    if (!validSortFields.includes(sortField)) {
        sortField = "username"; // fallback
        sortOrder = "asc";
    }

    // --- FILTER & SEARCH HANDLER ---
    const queryParams: Record<string, any> = {
        first,
        max,
    };

    if (search) {
        queryParams.search = search;
    }

    // Filter by status (enabled/disabled)
    if (status === "enabled") queryParams.enabled = true;
    if (status === "disabled") queryParams.enabled = false;

    // Get Token
    const token = await getCachedAdminToken();
    if (!token) {
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
    }

    // --- REQUEST DATA USERS ---
    const data = await fetchUsersKeycloak(token, queryParams);

    // --- TOTAL COUNT HANDLER ---
    const allUsers = await fetchUsersKeycloak(token, { briefRepresentation: true });
    const total = Array.isArray(allUsers) ? allUsers.length : 0;

    // --- FILTERED COUNT HANDLER ---
    const filtered = Array.isArray(data) ? data.length : 0;

    // --- SORT ---
    const sortedData = data.sort((a: any, b: any) => {
        const aVal = a[sortField] || "";
        const bVal = b[sortField] || "";
        return sortOrder === "desc"
            ? bVal.localeCompare(aVal)
            : aVal.localeCompare(bVal);
    });

    const usersWithRoles = await Promise.all(
        sortedData.map(async (user: any) => {
            const roleUsers = await fetchRealmsRolesUser(user.id, token);
            const roleNames = Array.isArray(roleUsers) ? roleUsers.map((r: any) => r.name) : [];
            return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            enabled: user.enabled,
            createdTimestamp: user.createdTimestamp,
            roles: roleNames,
            };
        })
    );

    return {
        recordsTotal: total,
        recordsFiltered: filtered,
        data: usersWithRoles,
    };
  } catch (err: any) {
    if (err?.isCustomError) {
        throw err;
    }

    console.log(err);
    throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
  }
};

export const fetchUserById = async (id : string) => {
    try {
        // Get Token
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
        }

        const user = await fetchUserByIdKeycloak(token, id);
        return user;
    } catch (err : any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR)
    }
};

export const createUser = async (data: any, creator : string) => {
    try {
        const { username, name, email, password, confirm_password, status, role_id } = data;

        // Check password match
        if (password !== confirm_password && password.trim() !== '') {
            throwError(UserErrorKey.PASSWORDS_DO_NOT_MATCH);
        }

        // Get Token
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
        }

        // Cek UNIQE by username
        const existing = await checkSameUsernameKeycloak(token, username);
        if (Array.isArray(existing) && existing.length > 0) {
            throwError(UserErrorKey.USER_ALREADY_EXISTS);
        }

        // Buat user baru di Keycloak
        await createUserKeycloak(token, {
            username,
            email,
            name,
            status,
            password,
            creator
        });

        // Get user yang baru dibuat
        const [createdUser] = await fetchUsersKeycloak(token, { username });
        if (!createdUser?.id) {
            throwError(UserErrorKey.USER_NOT_FOUND, "Failed to retrieve created user");
        }

        // Assign role to user
        await assignRoleToUser(createdUser.id, role_id, token);

        // Send email
        sendEmail( email,
            'Welcome to User and Role Management Platform Keycloak',
            `
                <div style="font-family: Arial, sans-serif; color: #222;">
                    <h2>Welcome, ${name}!</h2>
                    <p>Your account has been created on <b>User and Role Management Platform Keycloak</b>.</p>
                    <p>To get started, please <a href="${process.env.LOGIN_URL}" style="color: #007bff;">log in here</a> using your registered email.</p>
                    <p>After logging in, you will receive a verification email. Please check your inbox and follow the instructions to verify your email address.</p>
                    <br>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best regards,<br>Ifabula Team</p>
                </div>
            `,
            true
        );

        return createdUser;
    } catch (err : any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR)
    }
};

export const updateUser = async (userId: string, data: any, updater: string) => {
    try {
        const { name, email, status, password, confirm_password, role_id } = data;

        // Get Token
        const token = await getCachedAdminToken();
        if (!token) throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");

        // Check user existing
        const currentUser = await fetchUserByIdKeycloak(token, userId);
        if (!currentUser) throwError(UserErrorKey.USER_NOT_FOUND);

        // Data to be updated
        const dataToUpdate: Record<string, any> = {
            firstName: name,
            enabled: status === "1",
            email: email,
            attributes: {
                updated_by: updater,
            },
        };

        // Update user Keycloak
        await updateUserKeycloak(token, userId, dataToUpdate);

        // Update password if it's changed and valid
        if (password && password.trim() !== "" && password === confirm_password) {
            await updateUserPasswordKeycloak(token, userId, password, false);
        }

        if (role_id){
            // Delete existing roles
            await deleteRoleUser(userId, token);

            // Assign role to user
            await assignRoleToUser(userId, role_id, token);
        }

        return dataToUpdate;
    } catch (err: any) {
        if (err?.isCustomError) throw err;

        console.error("Update user error:", err.response?.data || err.message);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};

export const deactivateUser = async (userId: string, updater: string) => {
    try {
        const token = await getCachedAdminToken();
        if (!token) {
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain admin token");
        }

        // Get existing user data
        const existingUser = await fetchUserByIdKeycloak(token, userId);
        if (!existingUser) {
            throwError(UserErrorKey.USER_NOT_FOUND, "User not found");
        }

        // Deactivate user
        await disableUserKeycloak(token, userId);

        return;
    } catch (err: any) {
        if (err?.isCustomError) throw err;

        console.error("Update user error:", err.response?.data || err.message);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};

export const activateUser = async (userId: string, updater: string) => {
    try {
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain admin token");
        }

        // 
        // Get existing user data
        const existingUser = await keycloakRequest<any>("GET", `/users/${userId}`, token);
        if (!existingUser) {
            throwError(UserErrorKey.USER_NOT_FOUND, "User not found");
        }

        // Activate user
        await enableUserKeycloak(token, userId);

        return;
    } catch (err: any) {
        if (err?.isCustomError) throw err;

        console.error("Update user error:", err.response?.data || err.message);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};

export const generateClientSecret = async (id: string) => {
    try {
        const token = await getCachedAdminToken(); // pakai cache token
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, 'Failed to obtain token');
        }

        const data = await generateSecretKey(token, id);

        return data;
    } catch (err: any) {
        if (err?.isCustomError) throw err;

        console.error("Generate client secret error:", err.response?.data || err.message);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};