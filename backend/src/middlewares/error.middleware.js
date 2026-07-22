import crypto from "crypto";
import { fail } from "../shared/responses/apiResponse.js";

export function notFoundHandler(req, _res, next) {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, req, res, _next) {
  const traceId = req.traceId || crypto.randomUUID();
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error({ traceId, error });
  }

  return fail(res, {
    statusCode,
    message: error.message || "No se pudo completar la operacion",
    detail: error.detail || (statusCode >= 500 ? "Error interno del servidor" : null),
    traceId
  });
}
