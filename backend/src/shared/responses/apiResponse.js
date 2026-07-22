export function ok(res, { message = "Operacion realizada correctamente", data = {}, statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function fail(res, { message = "No se pudo completar la operacion", detail = null, traceId, statusCode = 500 } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    detail,
    traceId
  });
}
