// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@errors/AppError';
import { errorResponse } from '@helpers/responseFormatter';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json(
            errorResponse({
                success: false,
                message: err.message,
                data: err.data,
            })
        );
    } else {
        console.error('Unhandled Error:', err); // optional logging
        res.status(500).json(
            errorResponse({
                success: false,
                message: 'Internal Server Error',
            })
        );
    }
}
