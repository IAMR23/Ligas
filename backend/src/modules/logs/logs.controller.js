import { ok } from "../../shared/responses/apiResponse.js";
import { listAuditLogsService, listErrorLogsService, listLoginLogsService, listSyncLogsService } from "./logs.service.js";

export async function listAuditLogsController(req, res) {
  const data = await listAuditLogsService(req.validated.query);

  return ok(res, {
    message: "Logs de auditoria obtenidos correctamente",
    data
  });
}

export async function listLoginLogsController(req, res) {
  const data = await listLoginLogsService(req.validated.query);

  return ok(res, {
    message: "Logs de ingreso obtenidos correctamente",
    data
  });
}

export async function listSyncLogsController(req, res) {
  const data = await listSyncLogsService(req.validated.query);

  return ok(res, {
    message: "Logs de sincronizacion obtenidos correctamente",
    data
  });
}

export async function listErrorLogsController(req, res) {
  const data = await listErrorLogsService(req.validated.query);

  return ok(res, {
    message: "Logs de errores obtenidos correctamente",
    data
  });
}
