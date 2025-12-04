export class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
        this.name = 'ApiError';
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
export class ValidationError extends ApiError {
    constructor(details) {
        super(400, 'Validation failed', details);
        this.name = 'ValidationError';
    }
}
export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
        this.name = 'UnauthorizedError';
    }
}
export class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}
export class NotFoundError extends ApiError {
    constructor(resource) {
        super(404, `${resource} not found`);
        this.name = 'NotFoundError';
    }
}
export class ConflictError extends ApiError {
    constructor(message) {
        super(409, message);
        this.name = 'ConflictError';
    }
}
//# sourceMappingURL=errors.js.map