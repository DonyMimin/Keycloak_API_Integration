// userErrors.ts
import { ErrorCode } from '../../types/ErrorTypes';
import { GeneralErrorKey } from './generalErrorsKeys';

export const GENERAL_ERRORS: Record<GeneralErrorKey, ErrorCode> = {
    [GeneralErrorKey.INTERNAL_SERVER_ERROR]: {
        message: 'Internal Server Error',
        code: 500,
    },
    [GeneralErrorKey.FORBIDDEN]: {
        message: 'Forbidden',
        code: 401,
    },
    [GeneralErrorKey.BAD_REQUEST]: {
        message: 'Bad Request',
        code: 400,
    },
    [GeneralErrorKey.BAD_REQUEST_VALIDATION]: {
        message: '',
        code: 400,
    },
    [GeneralErrorKey.ACCESS_DENIED]: {
        message: 'Access Denied',
        code: 403,
    }
};
