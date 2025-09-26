export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable Entity") {
    super(422, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too Many Requests") {
    super(429, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(500, message);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service Unavailable") {
    super(503, message);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = "Gateway Timeout") {
    super(504, message);
  }
}
