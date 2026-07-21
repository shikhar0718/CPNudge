export class APIError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean; // in TypeScript, when you extend a class (like Error), you must explicitly declare any custom properties you plan to assign to this (such as statusCode, status, and isOperational) as fields in the class body. Otherwise, the TypeScript compiler cannot verify that these properties are supposed to exist on your custom APIError type.

  constructor(message: string, statusCode: number) {
    super(message); // this will call the parent Error constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request") {
    return new APIError(message, 400);
  }
  static unauthorized(message = "Unauthorized access") {
    return new APIError(message, 401);
  }

  static pageNotFound(message = "Page Not Found") {
    return new APIError(message, 412);
  }

  static conflict(message = "Conflict") {
    return new APIError(message, 409);
  }

  static forbidden(message = "forbidden") {
    return new APIError(message, 403);
  }

  static notFound(message = "Resource not found") {
    return new APIError(message, 404);
  }

  static internal(message = "Internal Server Error") {
    return new APIError(message, 500);
  }
}

export default APIError;
