import { PaginationQueryParams } from '../types/PaginationQueryParams';
import { throwError } from '@errors/throwError';
import { GeneralErrorKey } from '@errors/general/generalErrorsKeys';
import { UserErrorKey } from '@errors/user/userErrorsKeys';
import { assignRoleToUser, getCachedAdminToken, keycloakRequest } from '@helpers/keycloak';
import { createUserKeycloak, disableUserKeycloak, enableUserKeycloak, fetchUserByIdKeycloak, fetchUsersKeycloak, generateSecretKey, updateUserKeycloak, updateUserPasswordKeycloak } from '@models/keycloak/user_keycloak';
import { deleteRoleUser, fetchRealmsRolesUser } from '@models/keycloak/role_keycloak';
import { sendEmail } from '@helpers/email';
import { createUserModel } from '@models/User';
import { Transaction } from '@helpers/transaction';
import { resolvePagination } from '@helpers/paginationUtils';
import { RoleErrorKey } from '@errors/role/roleErrorsKeys';

export const fetchUser = async (params: PaginationQueryParams, status: any) => {
  try {
    const validSortFields = ["username", "email", "firstName", "createdTimestamp"] as const;
    const { size, skip, sort_by } = resolvePagination(
      params,
      [...validSortFields],
      "createdTimestamp"
    );

    // --- FILTER & SEARCH HANDLER ---
    const queryParams: Record<string, any> = {
      first: skip,
      max: size,
    };
    if (params.search) {
      queryParams.search = params.search;
    }
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
    const filteredQueryParams: Record<string, any> = {};
    if (params.search) filteredQueryParams.search = params.search;
    if (status === "enabled") filteredQueryParams.enabled = true;
    if (status === "disabled") filteredQueryParams.enabled = false;
    const filteredUsers = await fetchUsersKeycloak(token, filteredQueryParams);
    const filtered = Array.isArray(filteredUsers) ? filteredUsers.length : 0;

    // --- SORT ---
    let sortedData = data;
    if (sort_by && Object.keys(sort_by).length > 0) {
        sortedData = data.sort((a: any, b: any) => {
            for (const field of Object.keys(sort_by)) {
                const direction = sort_by[field as keyof typeof sort_by];
                const aVal = a[field];
                const bVal = b[field];
                if (aVal !== bVal) {
                    // If both are numbers, sort numerically
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return direction === 'desc' ? bVal - aVal : aVal - bVal;
                    }
                    // Otherwise, sort as strings
                    return direction === 'desc'
                        ? String(bVal).localeCompare(String(aVal))
                        : String(aVal).localeCompare(String(bVal));
                }
            }
            return 0;
        });
    }

    // Get role user
    const usersWithRoles = await Promise.all(
        sortedData.map(async (user: any) => {
            const roleUsers = await fetchRealmsRolesUser(user.id, token);
            if (!roleUsers) {
                throwError(RoleErrorKey.ROLE_NOT_FOUND, "Role not found");
            }

            let roleNames = Object.values(roleUsers)
                .filter(r => r && typeof r === 'object' && 'name' in r)
                .map((r: any) => r.name);
            
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
        if (!user) {
            throwError(UserErrorKey.USER_NOT_FOUND, "User not found");
        }

        let roleUsers = await fetchRealmsRolesUser(id, token);
        if (!roleUsers) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Roles not found on user");
        }

        return {
            ...user,
            roles: roleUsers.map((r: any) => r.name),
        };
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

        // Buat user baru di Keycloak
        const createResult = await createUserKeycloak(token, {
            username,
            email,
            name,
            status,
            password,
            creator
        });
        console.log("Create User Result:", createResult);
        if (createResult?.error) {
            throwError(GeneralErrorKey.STATUS_FAILED_DEPENDENCY, createResult.errorMessage);
        }

        // Get user yang baru dibuat
        const [userData] = await fetchUsersKeycloak(token, { username });
        if (!userData) {
            throwError(UserErrorKey.USER_NOT_FOUND, "Failed to retrieve created user");
        }

        // Create User on DB local
        const result = await Transaction(async (tx) => {
            const UserTx = createUserModel(tx)
            const result = await UserTx.create({
                data: {
                    mu_reference_key: userData.id,
                },
            });
            return result;
        });
        if (!result) throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);

        // Assign role to user
        await assignRoleToUser(userData.id, role_id, token);

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

        return userData;
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
        const updatedUser = await updateUserKeycloak(token, userId, dataToUpdate);
        if (updatedUser?.errorMessage) {
            throwError(GeneralErrorKey.STATUS_FAILED_DEPENDENCY, updatedUser.errorMessage);
        }

        // Update password if it's changed and valid
        if (password && password.trim() !== "" && password === confirm_password) {
            await updateUserPasswordKeycloak(token, userId, password, false);
        }

        if (role_id){
            // Delete existing roles
            const deletedRole = await deleteRoleUser(userId, token);
            if (deletedRole?.errorMessage) {
                throwError(GeneralErrorKey.STATUS_FAILED_DEPENDENCY, deletedRole.errorMessage);
            }

            // Assign role to user
            const assignedRole = await assignRoleToUser(userId, role_id, token);
            if (assignedRole?.errorMessage) {
                throwError(GeneralErrorKey.STATUS_FAILED_DEPENDENCY, assignedRole.errorMessage);
            }
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
        const result = await disableUserKeycloak(token, userId, updater);
        if (result?.errorMessage) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, result.errorMessage);
        }

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

        // Get existing user data
        const existingUser = await keycloakRequest<any>("GET", `/users/${userId}`, token);
        if (!existingUser) {
            throwError(UserErrorKey.USER_NOT_FOUND, "User not found");
        }

        // Activate user
        const result = await enableUserKeycloak(token, userId, updater);
        if (result?.errorMessage) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, result.errorMessage);
        }

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
        if (data?.errorMessage) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, data.errorMessage);
        }

        return data;
    } catch (err: any) {
        if (err?.isCustomError) throw err;

        console.error("Generate client secret error:", err.response?.data || err.message);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};