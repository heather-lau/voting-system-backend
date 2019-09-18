class BaseError extends Error {
  constructor(message = 'Unknown server error.', status = 500, code = 'UNKNOWN_SERVER_ERROR') {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.status = status || 500
    this.code = code
  }
}

class ResourceNotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'RESOURCE_NOT_FOUND')
  }
}

class BadRequestError extends BaseError {
  constructor(message = 'Bad Request.') {
    super(message, 400, 'BAD_REQUEST')
  }
}

export {
  BaseError,
  ResourceNotFoundError,
  BadRequestError
}