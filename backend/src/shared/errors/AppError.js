export class AppError extends Error {
  constructor(message, statusCode = 500, detail = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.detail = detail;
  }
}
