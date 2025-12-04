export declare class ApiError extends Error {
    statusCode: number;
    message: string;
    details?: Record<string, any> | undefined;
    constructor(statusCode: number, message: string, details?: Record<string, any> | undefined);
}
export declare class ValidationError extends ApiError {
    constructor(details: Record<string, any>);
}
export declare class UnauthorizedError extends ApiError {
    constructor(message?: string);
}
export declare class ForbiddenError extends ApiError {
    constructor(message?: string);
}
export declare class NotFoundError extends ApiError {
    constructor(resource: string);
}
export declare class ConflictError extends ApiError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map