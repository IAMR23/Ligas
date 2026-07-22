import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { toAuditJson } from "../../shared/utils/audit.js";
import {
  createAuditLog,
  createTournament,
  findTournamentByCode,
  findTournamentById,
  listTournaments,
  updateTournament
} from "./tournaments.repository.js";

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

export async function listTournamentsService(filters) {
  return listTournaments(prisma, filters);
}

export async function getTournamentService(id) {
  const tournament = await findTournamentById(prisma, id);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  return tournament;
}

export async function createTournamentService(payload, req) {
  return prisma.$transaction(async (tx) => {
    const code = payload.code.toUpperCase();
    const existingTournament = await findTournamentByCode(tx, code);

    if (existingTournament) {
      throw new AppError("Torneo ya existe", 409, "El codigo del torneo ya esta registrado");
    }

    const tournament = await createTournament(tx, {
      ...payload,
      code,
      status: payload.status || "BORRADOR",
      createdBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "tournaments",
      recordId: tournament.id,
      action: "CREATE",
      newValues: toAuditJson(tournament),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return tournament;
  });
}

export async function updateTournamentService(id, payload, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findTournamentById(tx, id);

    if (!current) {
      throw new AppError("Torneo no encontrado", 404);
    }

    const data = cleanPayload({
      ...payload,
      code: payload.code?.toUpperCase(),
      updatedBy: req.user.id
    });

    if (data.code && data.code !== current.code) {
      const codeOwner = await findTournamentByCode(tx, data.code);

      if (codeOwner) {
        throw new AppError("Codigo de torneo ya existe", 409);
      }
    }

    const tournament = await updateTournament(tx, id, data);

    await createAuditLog(tx, {
      tableName: "tournaments",
      recordId: tournament.id,
      action: "UPDATE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(tournament),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return tournament;
  });
}

export async function deleteTournamentService(id, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findTournamentById(tx, id);

    if (!current) {
      throw new AppError("Torneo no encontrado", 404);
    }

    const tournament = await updateTournament(tx, id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "tournaments",
      recordId: tournament.id,
      action: "DELETE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(tournament),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return tournament;
  });
}
