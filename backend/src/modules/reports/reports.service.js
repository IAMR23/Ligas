import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { env } from "../../config/env.js";
import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { toAuditJson } from "../../shared/utils/audit.js";
import { REPORT_CODES, REPORT_FORMATS } from "./reports.constants.js";
import {
  createAuditLog,
  createReportExecution,
  findReportByCode,
  getAuditLogsReport,
  getLoginLogsReport,
  getMatchesReport,
  getPlayerStatisticsReport,
  getRefereeingReport,
  getSanctionsReport,
  getStandingsReport,
  getTeamStatisticsReport,
  getVocaliasReport,
  listReports
} from "./reports.repository.js";

function ensureReportsDir() {
  fs.mkdirSync(env.reportsStoragePath, { recursive: true });
}

function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 19).replace("T", " ");
}

function getExportPath(reportCode, format) {
  ensureReportsDir();
  const extension = format === REPORT_FORMATS.PDF ? "pdf" : "xlsx";
  const fileName = `${safeFileName(reportCode)}-${Date.now()}.${extension}`;
  return path.join(env.reportsStoragePath, fileName);
}

function normalizeFilters(filters = {}) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

function rowsFromMatches(records) {
  return records.map((match) => ({
    torneo: match.tournament?.name,
    codigo: match.code,
    local: match.homeTeam?.name,
    visitante: match.awayTeam?.name,
    marcador: `${match.homeScore}-${match.awayScore}`,
    estado: match.status,
    cancha: match.field?.name,
    fecha: formatDate(match.scheduledAt)
  }));
}

function rowsFromPlayerStats(records, mode) {
  return records.map((stat) => ({
    torneo: stat.tournament?.name,
    jugador: stat.player?.fullName,
    equipo: stat.team?.name,
    goles: stat.goals,
    autogoles: stat.ownGoals,
    amarillas: stat.yellowCards,
    rojas: stat.redCards,
    partidos: stat.matchesPlayed,
    tipo: mode
  }));
}

function rowsFromTeamStats(records) {
  return records.map((stat) => ({
    torneo: stat.tournament?.name,
    equipo: stat.team?.name,
    partidos: stat.matchesPlayed,
    golesFavor: stat.goalsFor,
    golesContra: stat.goalsAgainst,
    amarillas: stat.yellowCards,
    rojas: stat.redCards,
    vallasCero: stat.cleanSheets
  }));
}

function rowsFromSanctions(records) {
  return records.map((sanction) => ({
    torneo: sanction.tournament?.name,
    partido: sanction.match?.code,
    jugador: sanction.player?.fullName,
    equipo: sanction.team?.name,
    tipo: sanction.type,
    estado: sanction.status,
    partidos: sanction.games,
    motivo: sanction.reason,
    fecha: formatDate(sanction.createdAt)
  }));
}

function rowsFromStandings(records) {
  return records.map((standing) => ({
    torneo: standing.tournament?.name,
    equipo: standing.team?.name,
    puntos: standing.points,
    jugados: standing.played,
    ganados: standing.won,
    empatados: standing.drawn,
    perdidos: standing.lost,
    golesFavor: standing.goalsFor,
    golesContra: standing.goalsAgainst,
    diferencia: standing.goalDiff
  }));
}

function rowsFromVocalias(records) {
  return records.map((vocalia) => ({
    torneo: vocalia.match?.tournament?.name,
    partido: vocalia.match?.code,
    local: vocalia.match?.homeTeam?.name,
    visitante: vocalia.match?.awayTeam?.name,
    estado: vocalia.status,
    abierta: formatDate(vocalia.openedAt),
    cerrada: formatDate(vocalia.closedAt),
    notas: vocalia.notes
  }));
}

function rowsFromRefereeing(records) {
  return records.map((assignment) => ({
    torneo: assignment.match?.tournament?.name,
    partido: assignment.match?.code,
    local: assignment.match?.homeTeam?.name,
    visitante: assignment.match?.awayTeam?.name,
    arbitro: assignment.referee?.fullName,
    rol: assignment.role,
    fecha: formatDate(assignment.createdAt)
  }));
}

function rowsFromLoginLogs(records) {
  return records.map((log) => ({
    usuario: log.username,
    correo: log.email,
    exito: log.success ? "SI" : "NO",
    motivo: log.failureReason,
    ip: log.ipAddress,
    plataforma: log.platform,
    fecha: formatDate(log.createdAt)
  }));
}

function rowsFromAuditLogs(records) {
  return records.map((log) => ({
    tabla: log.tableName,
    registro: log.recordId,
    accion: log.action,
    usuarioId: log.userId,
    ip: log.ipAddress,
    traceId: log.traceId,
    fecha: formatDate(log.createdAt)
  }));
}

async function getReportRows(reportCode, filters) {
  switch (reportCode) {
    case REPORT_CODES.MATCHES_BY_TOURNAMENT:
      return rowsFromMatches(await getMatchesReport(prisma, filters));
    case REPORT_CODES.GOALS_BY_PLAYER:
      return rowsFromPlayerStats(await getPlayerStatisticsReport(prisma, filters), "GOLES_JUGADOR");
    case REPORT_CODES.GOALS_BY_TEAM:
      return rowsFromTeamStats(await getTeamStatisticsReport(prisma, filters));
    case REPORT_CODES.CARDS:
      return rowsFromPlayerStats(await getPlayerStatisticsReport(prisma, filters), "TARJETAS");
    case REPORT_CODES.SANCTIONS:
      return rowsFromSanctions(await getSanctionsReport(prisma, filters));
    case REPORT_CODES.STANDINGS:
      return rowsFromStandings(await getStandingsReport(prisma, filters));
    case REPORT_CODES.VOCALIAS:
      return rowsFromVocalias(await getVocaliasReport(prisma, filters));
    case REPORT_CODES.REFEREEING:
      return rowsFromRefereeing(await getRefereeingReport(prisma, filters));
    case REPORT_CODES.LOGIN_LOGS:
      return rowsFromLoginLogs(await getLoginLogsReport(prisma, filters));
    case REPORT_CODES.AUDIT:
      return rowsFromAuditLogs(await getAuditLogsReport(prisma, filters));
    default:
      throw new AppError("Reporte no soportado", 400, `Codigo no implementado: ${reportCode}`);
  }
}

function getColumns(rows) {
  if (!rows.length) {
    return ["mensaje"];
  }

  return Object.keys(rows[0]);
}

function normalizeRows(rows) {
  if (rows.length) {
    return rows;
  }

  return [{ mensaje: "Sin datos para los filtros seleccionados" }];
}

async function writePdf({ title, rows, filePath }) {
  const normalizedRows = normalizeRows(rows);
  const columns = getColumns(normalizedRows);
  const doc = new PDFDocument({ margin: 36, size: "A4" });
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);
  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown();
  doc.fontSize(9).fillColor("#444").text(`Generado: ${formatDate(new Date())}`);
  doc.moveDown();

  normalizedRows.forEach((row, index) => {
    doc.fillColor("#111").fontSize(11).text(`${index + 1}. ${title}`);
    columns.forEach((column) => {
      doc.fontSize(9).fillColor("#333").text(`${column}: ${row[column] ?? ""}`);
    });
    doc.moveDown(0.7);

    if (doc.y > 740) {
      doc.addPage();
    }
  });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

async function writeExcel({ title, rows, filePath }) {
  const normalizedRows = normalizeRows(rows);
  const columns = getColumns(normalizedRows);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.slice(0, 31));

  worksheet.columns = columns.map((column) => ({
    header: column,
    key: column,
    width: Math.max(column.length + 4, 18)
  }));
  worksheet.addRows(normalizedRows);
  worksheet.getRow(1).font = { bold: true };
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length }
  };

  await workbook.xlsx.writeFile(filePath);
}

async function registerReportExecution({ report, format, filters, filePath, req }) {
  return prisma.$transaction(async (tx) => {
    const execution = await createReportExecution(tx, {
      reportId: report.id,
      userId: req.user.id,
      format,
      filters: toAuditJson(filters),
      filePath,
      success: true
    });

    await createAuditLog(tx, {
      tableName: "report_executions",
      recordId: execution.id,
      action: format === REPORT_FORMATS.PDF ? "EXPORT_PDF" : "EXPORT_EXCEL",
      newValues: toAuditJson({
        reportCode: report.code,
        reportName: report.name,
        filePath,
        filters
      }),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return execution;
  });
}

export async function listReportsService(filters) {
  return listReports(prisma, filters);
}

export async function exportReportService(code, filters, format, req) {
  const reportCode = code.toUpperCase();
  const report = await findReportByCode(prisma, reportCode);

  if (!report) {
    throw new AppError("Reporte no encontrado", 404);
  }

  const normalizedFilters = normalizeFilters(filters);
  const rows = await getReportRows(reportCode, normalizedFilters);
  const filePath = getExportPath(reportCode, format);

  if (format === REPORT_FORMATS.PDF) {
    await writePdf({ title: report.name, rows, filePath });
  } else {
    await writeExcel({ title: report.name, rows, filePath });
  }

  const execution = await registerReportExecution({
    report,
    format,
    filters: normalizedFilters,
    filePath,
    req
  });

  return {
    report,
    execution,
    filePath,
    fileName: path.basename(filePath)
  };
}
