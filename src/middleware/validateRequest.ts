import { GeneralErrorKey } from '@errors/general/generalErrorsKeys';
import { throwError } from '@errors/throwError';
import { NextFunction, Request, Response } from 'express';
import type { Schema } from 'joi'; //use import type to avoid all joi load to runtime

export const validateRequest = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationResult = schema.validate(req.body, { abortEarly: false });

        if (validationResult.error) {
            const errors = validationResult.error.details.map((detail) => detail.message);
            console.log(errors);
            return next(throwError(GeneralErrorKey.BAD_REQUEST));
        }

        next();
    };
};

// fucntion to validate request body and get detail information field response
export const validateRequestDetail = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationResult = schema.validate(req.body, { abortEarly: false });

        if (validationResult.error) {
            const firstError = validationResult.error.details[0].message.replace(/"/g, '');
            return next(throwError(GeneralErrorKey.BAD_REQUEST_VALIDATION, { message: firstError }));
        }

        next();
    };
};