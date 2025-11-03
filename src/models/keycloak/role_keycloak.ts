import { RoleErrorKey } from "@errors/role/roleErrorsKeys";
import { throwError } from "@errors/throwError";
import { keycloakRequest } from "@helpers/keycloak";

export const fetchAllRoleUser = async (userId: string, token: string) => {
    const roles = await keycloakRequest("GET", `/users/${userId}/role-mappings`, token);
    
    if (roles?.errorMessage) {
        return { error: true, ...roles };
    }
    
    return roles;
};

export const fetchRealmsRolesUser = async (userId: string, token: string) => {
    const roles = await keycloakRequest("GET", `/users/${userId}/role-mappings/realm`, token);
    roles.errorMessage = "test";
    if (roles?.errorMessage) {
        return { error: true, ...roles };
    }
    
    return roles;
};

export const fetchClientRolesUser = async (userId: string, clientId: string, token: string) => {
    const roles = await keycloakRequest("GET", `/users/${userId}/role-mappings/clients/${clientId}`, token);
    
    if (roles?.errorMessage) {
        return { error: true, ...roles };
    }
    
    return roles;
};

// Fetch all roles from Keycloak (realm roles)
export const fetchRoles = async (token: string, params: any = {}) => {
    // Keycloak's /roles endpoint for realm-level roles
    const query = params ? { params } : undefined;
    const roles = await keycloakRequest("GET", `/roles`, token, query);
    
    if (roles?.errorMessage) {
        return { error: true, ...roles };
    }
    
    return roles;
};

export const fetchRolesByID = async (roleId: string, token: string) => {
    const role = await keycloakRequest("GET", `/roles-by-id/${roleId}`, token);
    
    if (role?.errorMessage) {
        return { error: true, ...role };
    }
    
    return role;
};

export const createRoleKeycloak = async (token: string, data: any) => {
    const result = await keycloakRequest("POST", `/roles`, token, {
        data: {
            name: data.name,
            description: data.description,
            attributes: {
                created_by: [data.creator],
            },
        },
    });
    
    if (result?.errorMessage) {
        return { error: true, ...result };
    }
    
    return result;
};

export const updateRoleKeycloak = async (roleId: string, token: string, dataToUpdate: any) => {
    const result = await keycloakRequest("PUT", `/roles-by-id/${roleId}`, token, {
        data: dataToUpdate,
    });
    
    if (result?.errorMessage) {
        return { error: true, ...result };
    }
    
    return result;
}

export const insertRoleRealmUser = async (userId: string, role_id: string, role_name: string, token: string) => {
    // Realm-level role (recommended)
    const role = await keycloakRequest("POST", `/users/${userId}/role-mappings/realm`, token, {
        data: [{ id: role_id, name: role_name }],
    });
    
    if (role?.errorMessage) {
        return { error: true, ...role };
    }
    
    return role;
}

export const insertRoleClientUser = async (userId: string, role_id: string, role_name: string, role_containerId: string, token: string) => {
    // Client-level role (assuming role.containerId is the client ID)
    const role = await keycloakRequest("POST", `/users/${userId}/role-mappings/clients/${role_containerId}`, token, {
        data: [{ id: role_id, name: role_name }],
    });
    
    if (role?.errorMessage) {
        return { error: true, ...role };
    }
    
    return role;
}

export const deleteRoleUser = async (userId: string, token: string) => {
    const existingUserRoles = await fetchAllRoleUser(userId, token);
    if (!existingUserRoles) {
        throwError(RoleErrorKey.ROLE_NOT_FOUND, "No roles found for user");
    }
    
    if (existingUserRoles?.errorMessage) {
        return { error: true, ...existingUserRoles };
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
        return { error: true, errorMessage: "Failed to remove roles from user"};
    }
};