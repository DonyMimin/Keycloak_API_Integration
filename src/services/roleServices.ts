import { PaginationQueryParams } from '../types/PaginationQueryParams';
import { throwError } from '@errors/throwError';
import { GeneralErrorKey } from '@errors/general/generalErrorsKeys';
import { RoleErrorKey } from '@errors/role/roleErrorsKeys';
import { getCachedAdminToken } from '@helpers/keycloak';
import { createRoleKeycloak, fetchRoles, fetchRolesByID, updateRoleKeycloak } from '@models/keycloak/role_keycloak';
import { resolvePagination } from '@helpers/paginationUtils';

export const fetchRole = async (params : PaginationQueryParams) => {
    try {
        const validSortFields = ["name", "description"] as const;
        const { size, skip, sort_by } = resolvePagination(
            params,
            [...validSortFields],
            "name"
        );

        // --- FILTER & SEARCH HANDLER ---
        const queryParams: Record<string, any> = {
            first: skip,
            max: size,
        };
        if (params.search) {
            queryParams.search = params.search;
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
        const filteredQueryParams: Record<string, any> = {};
        if (params.search) filteredQueryParams.search = params.search;
        const filteredRoles = await fetchRoles(token, filteredQueryParams);
        const filtered = Array.isArray(filteredRoles) ? filteredRoles.length : 0;

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
        const role = await fetchRolesByID(roleId, token);
        if (!role) throwError(RoleErrorKey.ROLE_NOT_FOUND, "Role not found");

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
        if (!roles) throwError(RoleErrorKey.ROLE_NOT_FOUND, "No roles found");

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

        // Create role in Keycloak
        const payload = {
            name: data.name,
            description: data.description,
            creator
        };

        const result = await createRoleKeycloak(token, payload);
        if (result?.errorMessage) {
            throwError(GeneralErrorKey.STATUS_FAILED_DEPENDENCY, result.errorMessage);
        }

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

        const result = await updateRoleKeycloak(roleId, token, payload);
        if (result?.errorMessage) {
            throwError(GeneralErrorKey.STATUS_FAILED_DEPENDENCY, result.errorMessage);
        }

        return;
    } catch (err: any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};