import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { toAuditJson } from "../../shared/utils/audit.js";
import {
  createAuditLog,
  createTeam,
  findCategoryById,
  findTeamByCode,
  findTeamById,
  findTournamentById,
  listTeams,
  updateTeam,
  upsertStanding,
  upsertTeamStatistic
} from "./teams.repository.js";

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

async function assertTournamentAndCategory(tx, tournamentId, categoryId) {
  const tournament = await findTournamentById(tx, tournamentId);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  if (categoryId) {
    const category = await findCategoryById(tx, categoryId);

    if (!category || category.tournamentId !== tournamentId) {
      throw new AppError("Categoria no valida", 400, "La categoria no existe o no pertenece al torneo");
    }
  }
}

export async function listTeamsService(filters) {
  return listTeams(prisma, filters);
}

export async function getTeamService(id) {
  const team = await findTeamById(prisma, id);

  if (!team) {
    throw new AppError("Equipo no encontrado", 404);
  }

  return team;
}

export async function createTeamService(payload, req) {
  return prisma.$transaction(async (tx) => {
    const code = payload.code.toUpperCase();
    await assertTournamentAndCategory(tx, payload.tournamentId, payload.categoryId);

    const existingTeam = await findTeamByCode(tx, code);

    if (existingTeam) {
      throw new AppError("Equipo ya existe", 409, "El codigo del equipo ya esta registrado");
    }

    const team = await createTeam(tx, {
      ...payload,
      code,
      createdBy: req.user.id
    });

    await upsertStanding(tx, team.tournamentId, team.id);
    await upsertTeamStatistic(tx, team.tournamentId, team.id);

    await createAuditLog(tx, {
      tableName: "teams",
      recordId: team.id,
      action: "CREATE",
      newValues: toAuditJson(team),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return team;
  });
}

export async function updateTeamService(id, payload, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findTeamById(tx, id);

    if (!current) {
      throw new AppError("Equipo no encontrado", 404);
    }

    const nextTournamentId = payload.tournamentId || current.tournamentId;
    const nextCategoryId = payload.categoryId === undefined ? current.categoryId : payload.categoryId;

    await assertTournamentAndCategory(tx, nextTournamentId, nextCategoryId);

    const data = cleanPayload({
      ...payload,
      code: payload.code?.toUpperCase(),
      updatedBy: req.user.id
    });

    if (data.code && data.code !== current.code) {
      const codeOwner = await findTeamByCode(tx, data.code);

      if (codeOwner) {
        throw new AppError("Codigo de equipo ya existe", 409);
      }
    }

    const team = await updateTeam(tx, id, data);
    await upsertStanding(tx, team.tournamentId, team.id);
    await upsertTeamStatistic(tx, team.tournamentId, team.id);

    await createAuditLog(tx, {
      tableName: "teams",
      recordId: team.id,
      action: "UPDATE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(team),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return team;
  });
}

export async function deleteTeamService(id, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findTeamById(tx, id);

    if (!current) {
      throw new AppError("Equipo no encontrado", 404);
    }

    const team = await updateTeam(tx, id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "teams",
      recordId: team.id,
      action: "DELETE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(team),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return team;
  });
}
