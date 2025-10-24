// utils/responseFormatter.ts
interface ErrorResponse {
    success?: false;
    message: string;
    data?: any;
}

interface SuccessResponse<T = any> {
    success?: true;
    message: string;
    data?: T;
}

export function errorResponse({ message, data }: ErrorResponse): ErrorResponse {
    return { success: false, message, data };
}

export function successResponse<T>({ message, data }: SuccessResponse<T>): SuccessResponse<T> {
    return { success: true, message, data };
}
