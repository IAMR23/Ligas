import crypto from "crypto";

export function attachTraceId(req, res, next) {
  req.traceId = req.headers["x-trace-id"] || crypto.randomUUID();
  res.setHeader("x-trace-id", req.traceId);
  next();
}
