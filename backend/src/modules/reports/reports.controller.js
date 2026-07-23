import path from "path";
import { ok } from "../../shared/responses/apiResponse.js";
import { REPORT_FORMATS } from "./reports.constants.js";
import { exportReportService, listReportsService } from "./reports.service.js";

export async function listReportsController(req, res) {
  const reports = await listReportsService(req.validated.query);

  return ok(res, {
    message: "Reportes obtenidos correctamente",
    data: { reports }
  });
}

export async function exportPdfController(req, res) {
  const result = await exportReportService(req.validated.params.code, req.validated.query, REPORT_FORMATS.PDF, req);

  res.download(result.filePath, path.basename(result.filePath));
}

export async function exportExcelController(req, res) {
  const result = await exportReportService(req.validated.params.code, req.validated.query, REPORT_FORMATS.EXCEL, req);

  res.download(result.filePath, path.basename(result.filePath));
}
