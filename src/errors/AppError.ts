// errors/AppError.ts
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly data?: any;
    isCustomError = true;

    constructor(message: string, statusCode = 500, data?: any) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.data = data;

        Error.captureStackTrace(this);
    }
}
