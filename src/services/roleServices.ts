import { PaginationQueryParams } from '../types/PaginationQueryParams';
import { throwError } from '@errors/throwError';
import { GeneralErrorKey } from '@errors/general/generalErrorsKeys';
import { RoleErrorKey } from '@errors/role/roleErrorsKeys';
import { getCachedAdminToken, keycloakRequest } from '@helpers/keycloak';
import { createRoleKeycloak, fetchRoles, fetchRolesByID, updateRoleKeycloak } from '@models/keycloak/role_keycloak';

export const fetchRole = async (params : PaginationQueryParams) => {
    try {
        const { page, size, search, sort, order } = params;
        const first = (page - 1) * size;
        const max = size;

        // --- SORT HANDLER ---
        let sortField = typeof sort === "string" ? sort : Object.keys(sort || {})[0];
        let sortOrder = order || (sort && (sort as any)[sortField]) || "asc";

        // Valid fields for Keycloak roles
        const validSortFields = ["name", "description"]; // adjust as needed
        if (!validSortFields.includes(sortField)) {
            sortField = "name";
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

        // Get Token
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
        }

        // --- REQUEST DATA ROLES FROM KEYCLOAK ---
        const data = await fetchRoles(token, queryParams);

        // --- TOTAL COUNT HANDLER ---
        const allRoles = await fetchRoles(token, { briefRepresentation: true });
        const total = Array.isArray(allRoles) ? allRoles.length : 0;

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

        return {
            recordsTotal: total,
            recordsFiltered: filtered,
            data: sortedData,
        };
    } catch (err: any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};

export const fetchRoleById = async (roleId: string) => {
    try {
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
        }

        // Fetch role by id from Keycloak
        const role = await keycloakRequest("GET", `/roles-by-id/${roleId}`, token);
        if (!role) throwError(RoleErrorKey.ROLE_NOT_FOUND);

        return role;
    } catch (err: any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};

export const fetchRoleList = async () => {
    try {
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
        }

        // Fetch all roles from Keycloak
        const roles = await fetchRoles(token, {});
        if (!roles) throwError(RoleErrorKey.ROLE_NOT_FOUND);

        // Return only id and name for list
        return roles.map((role: any) => ({ id: role.id, name: role.name }));
    } catch (err: any) {
        if (err?.isCustomError) {
            throw err;
        }
        
        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};

export const createRole = async (data: any, creator: string) => {
    try {
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
        }

        // Check if role already exists by name
        const existingRoles = await fetchRoles(token, { search: data.mr_name });
        if (Array.isArray(existingRoles) && existingRoles.some((r: any) => r.name === data.mr_name)) {
            throwError(RoleErrorKey.ROLE_ALREADY_EXISTS);
        }
        console.log("Existing Roles:", existingRoles);
        // Create role in Keycloak
        const payload = {
            name: data.name,
            description: data.description,
            creator
        };
        console.log("Create Role Payload:", payload);
        await createRoleKeycloak(token, payload);

        return;
    } catch (err: any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};

export const updateRole = async (roleId: string, data: any, updater: string) => {
    try {
        const { name, description } = data;

        // Get Token
        const token = await getCachedAdminToken();
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, "Failed to obtain token");
        }

        // Get Role Data by ID
        const roleData = await fetchRolesByID(roleId, token);
        if (!roleData) {
            throwError(RoleErrorKey.ROLE_NOT_FOUND, "Role not found");
        }

        // Update role in Keycloak
        const payload = {
            id: roleData.id,
            name: name || roleData.name,
            description: description || roleData.description,
            composite: roleData.composite || false,
            clientRole: roleData.clientRole || false,
            containerId: roleData.containerId,
            attributes: {
                ...roleData.attributes,
                updated_by: [updater],
            },
        };

        await updateRoleKeycloak(roleId, token, payload);


        return;
    } catch (err: any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};