import { RoleErrorKey } from "@errors/role/roleErrorsKeys";
import { throwError } from "@errors/throwError";
import { keycloakRequest } from "@helpers/keycloak";

export const fetchAllRoleUser = async (userId: string, token: string) => {
    const roles = await keycloakRequest("GET", `/users/${userId}/role-mappings`, token);
    return roles;
};

export const fetchRealmsRolesUser = async (userId: string, token: string) => {
    const roles = await keycloakRequest("GET", `/users/${userId}/role-mappings/realms`, token);
    return roles;
};

export const fetchClientRolesUser = async (userId: string, clientId: string, token: string) => {
    const roles = await keycloakRequest("GET", `/users/${userId}/role-mappings/clients/${clientId}`, token);
    return roles;
};

// Fetch all roles from Keycloak (realm roles)
export const fetchRoles = async (token: string, params: any = {}) => {
    // Keycloak's /roles endpoint for realm-level roles
    const query = params ? { params } : undefined;
    const roles = await keycloakRequest("GET", `/roles`, token, query);
    return roles;
};

export const fetchRolesByID = async (roleId: string, token: string) => {
    const role = await keycloakRequest("GET", `/roles-by-id/${roleId}`, token);
    return role;
};

export const createRoleKeycloak = async (token: string, data: any) => {
    await keycloakRequest("POST", `/roles`, token, {
        data: {
            name: data.name,
            description: data.description,
            attributes: {
                created_by: [data.creator],
            },
        },
    });
};

export const updateRoleKeycloak = async (roleId: string, token: string, dataToUpdate: any) => {
    await keycloakRequest("PUT", `/roles-by-id/${roleId}`, token, {
        data: dataToUpdate,
    });
}

export const assignRoleToUser = async (userId: string, roleId: string, token: string) => {
    // Get role details
    const role = await keycloakRequest("GET", `/roles-by-id/${roleId}`, token);
    if (!role) {
        throwError(RoleErrorKey.ROLE_NOT_FOUND, "Role not found");
    }
    try {
        if (role.clientRole === false) {
            // Realm-level role (recommended)
            await keycloakRequest("POST", `/users/${userId}/role-mappings/realm`, token, {
                data: [{ id: role.id, name: role.name }],
            });
        } else {
            // Client-level role (assuming role.containerId is the client ID)
            await keycloakRequest("POST", `/users/${userId}/role-mappings/clients/${role.containerId}`, token, {
                data: [{ id: role.id, name: role.name }],
            });
        }
        console.log(`Successfully assigned role '${role.name}' to user ${userId}`);
        return role;
    } catch (err) {
        console.error(`Failed to assign role to user ${userId}:`, (err as Error)?.message);
        throwError(RoleErrorKey.ROLE_ASSIGN_FAILED, "Failed to assign role to user");
    }
};

export const deleteRoleUser = async (userId: string, token: string) => {
    const existingUserRoles = await fetchAllRoleUser(userId, token);
    if (!existingUserRoles) {
        throwError(RoleErrorKey.ROLE_NOT_FOUND, "No roles found for user");
    }

    console.log("Existing User Roles:", existingUserRoles);

    try {
        // Delete Realm Roles
        if (Array.isArray(existingUserRoles.realmMappings) && existingUserRoles.realmMappings.length > 0) {
            await keycloakRequest("DELETE", `/users/${userId}/role-mappings/realm`, token, {
                data: existingUserRoles.realmMappings,
            });
            console.log(`Removed ${existingUserRoles.realmMappings.length} realm role(s) from user ${userId}`);
        }

        // Delete Client Roles
        if (existingUserRoles.clientMappings && Object.keys(existingUserRoles.clientMappings).length > 0) {
            type ClientData = { id: string; mappings?: any[] };
            for (const [clientName, clientDataRaw] of Object.entries(existingUserRoles.clientMappings)) {
                const clientData = clientDataRaw as ClientData;
                if ((clientData?.mappings ?? [])?.length > 0) {
                    await keycloakRequest(
                        "DELETE",
                        `/users/${userId}/role-mappings/clients/${clientData.id}`,
                        token,
                        { data: clientData.mappings ?? [] }
                    );
                    console.log(`Removed ${(clientData.mappings ?? []).length} client role(s) from '${clientName}'`);
                }
            }
        }

        return { message: `All roles removed from user ${userId}` };
    } catch (err: any) {
        console.error(`Failed to remove roles from user ${userId}:`, err.response?.data || err.message);
        throwError(RoleErrorKey.ROLE_ASSIGN_FAILED, "Failed to remove role(s) from user");
    }
};