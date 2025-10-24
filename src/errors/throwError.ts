import { AppError } from './AppError';
import { ERROR_CODES, ErrorKey } from './index';

export function throwError(key: ErrorKey, data?: any): never {
    const { message, code } = ERROR_CODES[key];
    const errorMessage = data?.message || message;
    
    // Jika data hanya berisi message, jangan kirim data ke AppError
    if (data && Object.keys(data).length === 1 && data.message) {
        throw new AppError(errorMessage, code);
    }
    throw new AppError(errorMessage, code, data);
}
