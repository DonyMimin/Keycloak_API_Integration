import { AUTH_ERRORS } from './auth/authErrors';
import { AuthErrorKey } from './auth/authErrorsKeys';
import { GENERAL_ERRORS } from './general/generalErrors';
import { GeneralErrorKey } from './general/generalErrorsKeys';
import { ROLE_ERRORS } from './role/roleErrors';
import { RoleErrorKey } from './role/roleErrorsKeys';
import { USER_ERRORS } from './user/userErrors';
import { UserErrorKey } from './user/userErrorsKeys';

export const ERROR_CODES = {
    ...USER_ERRORS,
    ...GENERAL_ERRORS,
    ...ROLE_ERRORS,
    ...AUTH_ERRORS,
};

export type ErrorKey = UserErrorKey | GeneralErrorKey | RoleErrorKey | AuthErrorKey;