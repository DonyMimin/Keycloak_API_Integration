// userErrors.ts
import { AuthErrorKey } from './authErrorsKeys';
import { ErrorCode } from '../../types/ErrorTypes';

export const AUTH_ERRORS: Record<AuthErrorKey, ErrorCode> = {
    [AuthErrorKey.INVALID_CREDENTIALS]: {
        message: 'Invalid Credentials',
        code: 401,
    },
    [AuthErrorKey.SAME_PASSWORD]: {
        message: 'Your new password must be different from your current password.',
        code: 409,
    },
    [AuthErrorKey.WRONG_PASSWORD]: {
        message: 'Current password is incorrect',
        code: 409,
    },
    [AuthErrorKey.USER_DEACTIVATED]: {
        message: 'User has been deactivated',
        code: 401,
    },
    [AuthErrorKey.ROLE_DEACTIVATED]: {
        message: 'Role has been deactivated',
        code: 401,
    },
};
