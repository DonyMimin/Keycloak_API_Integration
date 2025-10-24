// userErrors.ts
import { UserErrorKey } from './userErrorsKeys';
import { ErrorCode } from '../../types/ErrorTypes';

export const USER_ERRORS: Record<UserErrorKey, ErrorCode> = {
    [UserErrorKey.USER_NOT_FOUND]: {
        message: 'User not found',
        code: 404,
    },
    [UserErrorKey.USER_ALREADY_EXISTS]: {
        message: 'User already exists',
        code: 400,
    },
    [UserErrorKey.PASSWORDS_DO_NOT_MATCH]: {
        message: 'Passwords do not match',
        code: 400,
    },
    [UserErrorKey.EMAIL_ALREADY_EXISTS]: {
        message: 'Email already exists',
        code: 400,
    },
};
