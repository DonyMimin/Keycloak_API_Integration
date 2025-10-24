// userErrors.ts
import { RoleErrorKey } from './roleErrorsKeys';
import { ErrorCode } from '../../types/ErrorTypes';

export const ROLE_ERRORS: Record<RoleErrorKey, ErrorCode> = {
    [RoleErrorKey.ROLE_NOT_FOUND]: {
        message: 'Role not found',
        code: 404,
    },
    [RoleErrorKey.ROLE_ALREADY_EXISTS]: {
        message: 'Role already exists',
        code: 400,
    },
    [RoleErrorKey.ROLE_ASSIGN_FAILED]: {
        message: 'Failed to assign role',
        code: 500,
    },
};
