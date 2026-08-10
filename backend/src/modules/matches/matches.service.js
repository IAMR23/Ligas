import crypto from "crypto";
import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { toAuditJson } from "../../shared/utils/audit.js";
import {
  createAuditLog,
  createMatch,
  createMatchEvent,
  finishMatchIfInPlay,
  findFieldById,
  findMatchByCode,
  findMatchById,
  findMatchEventByClientId,
  findRoundById,
  findTeamById,
  findTournamentById,
  listFinalizedMatchesByTournament,
  listMatches,
  listTournamentTeams,
  setStanding,
  setTeamMatchStatistic,
  updateMatch,
  upsertStanding,
  upsertTeamStatistic
} from "./matches.repository.js";

const DEFAULT_TOURNAMENT_RULES = {
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0
};

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function buildClientEventId(prefix, matchId) {
  return `${prefix}-${matchId}-${crypto.randomUUID()}`;
}

async function assertMatchReferences(tx, payload, current = null) {
  const tournamentId = payload.tournamentId || current?.tournamentId;
  const homeTeamId = payload.homeTeamId || current?.homeTeamId;
  const awayTeamId = payload.awayTeamId || current?.awayTeamId;
  const roundId = payload.roundId === undefined ? current?.roundId : payload.roundId;
  const fieldId = payload.fieldId === undefined ? current?.fieldId : payload.fieldId;

  const tournament = await findTournamentById(tx, tournamentId);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  if (homeTeamId === awayTeamId) {
    throw new AppError("Equipos invalidos", 400, "El equipo local y visitante deben ser diferentes");
  }

  const homeTeam = await findTeamById(tx, homeTeamId);
  const awayTeam = await findTeamById(tx, awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new AppError("Equipo no encontrado", 404);
  }

  if (homeTeam.tournamentId !== tournamentId || awayTeam.tournamentId !== tournamentId) {
    throw new AppError("Equipos invalidos", 400, "Los equipos deben pertenecer al torneo del partido");
  }

  if (roundId) {
    const round = await findRoundById(tx, roundId);

    if (!round || round.tournamentId !== tournamentId) {
      throw new AppError("Fecha no valida", 400, "La fecha no existe o no pertenece al torneo");
    }
  }

  if (fieldId) {
    const field = await findFieldById(tx, fieldId);

    if (!field) {
      throw new AppError("Cancha no encontrada", 404);
    }
  }

  return { tournamentId, homeTeamId, awayTeamId, roundId, fieldId };
}

function getTournamentRules(tournament) {
  return {
    ...DEFAULT_TOURNAMENT_RULES,
    pointsWin: tournament?.pointsWin ?? DEFAULT_TOURNAMENT_RULES.pointsWin,
    pointsDraw: tournament?.pointsDraw ?? DEFAULT_TOURNAMENT_RULES.pointsDraw,
    pointsLoss: tournament?.pointsLoss ?? DEFAULT_TOURNAMENT_RULES.pointsLoss
  };
}

export function getStandingResult(goalsFor, goalsAgainst, rules = DEFAULT_TOURNAMENT_RULES) {
  if (goalsFor > goalsAgainst) {
    return { won: 1, drawn: 0, lost: 0, points: rules.pointsWin, goalsFor, goalsAgainst };
  }

  if (goalsFor === goalsAgainst) {
    return { won: 0, drawn: 1, lost: 0, points: rules.pointsDraw, goalsFor, goalsAgainst };
  }

  return { won: 0, drawn: 0, lost: 1, points: rules.pointsLoss, goalsFor, goalsAgainst };
}

function emptyStandingRow() {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0
  };
}

function applyStandingResult(row, result) {
  row.played += 1;
  row.won += result.won;
  row.drawn += result.drawn;
  row.lost += result.lost;
  row.goalsFor += result.goalsFor;
  row.goalsAgainst += result.goalsAgainst;
  row.goalDiff += result.goalsFor - result.goalsAgainst;
  row.points += result.points;
}

function emptyTeamMatchStatistic() {
  return {
    matchesPlayed: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0
  };
}

function applyTeamMatchStatistic(row, goalsFor, goalsAgainst) {
  row.matchesPlayed += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.cleanSheets += goalsAgainst === 0 ? 1 : 0;
}

export async function recalculateTournamentStandingsAndTeamStats(tx, tournament) {
  const teams = await listTournamentTeams(tx, tournament.id);
  const matches = await listFinalizedMatchesByTournament(tx, tournament.id);
  const rules = getTournamentRules(tournament);
  const standings = new Map();
  const teamStatistics = new Map();

  for (const team of teams) {
    standings.set(team.id, emptyStandingRow());
    teamStatistics.set(team.id, emptyTeamMatchStatistic());
  }

  for (const match of matches) {
    const homeStanding = standings.get(match.homeTeamId);
    const awayStanding = standings.get(match.awayTeamId);
    const homeStatistic = teamStatistics.get(match.homeTeamId);
    const awayStatistic = teamStatistics.get(match.awayTeamId);

    if (!homeStanding || !awayStanding || !homeStatistic || !awayStatistic) {
      continue;
    }

    applyStandingResult(homeStanding, getStandingResult(match.homeScore, match.awayScore, rules));
    applyStandingResult(awayStanding, getStandingResult(match.awayScore, match.homeScore, rules));
    applyTeamMatchStatistic(homeStatistic, match.homeScore, match.awayScore);
    applyTeamMatchStatistic(awayStatistic, match.awayScore, match.homeScore);
  }

  for (const [teamId, row] of standings.entries()) {
    await setStanding(tx, tournament.id, teamId, row);
  }

  for (const [teamId, row] of teamStatistics.entries()) {
    await setTeamMatchStatistic(tx, tournament.id, teamId, row);
  }
}

export async function listMatchesService(filters) {
  return listMatches(prisma, filters);
}

export async function getMatchService(id) {
  const match = await findMatchById(prisma, id);

  if (!match) {
    throw new AppError("Partido no encontrado", 404);
  }

  return match;
}

export async function createMatchService(payload, req) {
  return prisma.$transaction(async (tx) => {
    const code = payload.code.toUpperCase();
    await assertMatchReferences(tx, payload);

    const existingMatch = await findMatchByCode(tx, code);

    if (existingMatch) {
      throw new AppError("Partido ya existe", 409, "El codigo del partido ya esta registrado");
    }

    const match = await createMatch(tx, {
      ...payload,
      code,
      status: "PROGRAMADO",
      createdBy: req.user.id
    });

    await upsertStanding(tx, match.tournamentId, match.homeTeamId);
    await upsertStanding(tx, match.tournamentId, match.awayTeamId);
    await upsertTeamStatistic(tx, match.tournamentId, match.homeTeamId);
    await upsertTeamStatistic(tx, match.tournamentId, match.awayTeamId);

    await createAuditLog(tx, {
      tableName: "matches",
      recordId: match.id,
      action: "CREATE",
      newValues: toAuditJson(match),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return match;
  });
}

export async function updateMatchService(id, payload, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findMatchById(tx, id);

    if (!current) {
      throw new AppError("Partido no encontrado", 404);
    }

    if (current.status === "FINALIZADO") {
      throw new AppError("Partido finalizado", 409, "No se puede editar un partido finalizado desde este modulo");
    }

    await assertMatchReferences(tx, payload, current);

    const data = cleanPayload({
      ...payload,
      code: payload.code?.toUpperCase(),
      updatedBy: req.user.id
    });

    if (data.code && data.code !== current.code) {
      const codeOwner = await findMatchByCode(tx, data.code);

      if (codeOwner) {
        throw new AppError("Codigo de partido ya existe", 409);
      }
    }

    const match = await updateMatch(tx, id, data);

    await upsertStanding(tx, match.tournamentId, match.homeTeamId);
    await upsertStanding(tx, match.tournamentId, match.awayTeamId);
    await upsertTeamStatistic(tx, match.tournamentId, match.homeTeamId);
    await upsertTeamStatistic(tx, match.tournamentId, match.awayTeamId);

    await createAuditLog(tx, {
      tableName: "matches",
      recordId: match.id,
      action: "UPDATE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(match),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return match;
  });
}

export async function deleteMatchService(id, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findMatchById(tx, id);

    if (!current) {
      throw new AppError("Partido no encontrado", 404);
    }

    if (current.status === "EN_JUEGO") {
      throw new AppError("Partido en juego", 409, "No se puede eliminar un partido en juego");
    }

    const match = await updateMatch(tx, id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "matches",
      recordId: match.id,
      action: "DELETE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(match),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return match;
  });
}

export async function startMatchService(id, payload, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findMatchById(tx, id);

    if (!current) {
      throw new AppError("Partido no encontrado", 404);
    }

    if (current.status !== "PROGRAMADO") {
      throw new AppError("No se puede iniciar el partido", 409, "El partido debe estar PROGRAMADO");
    }

    const clientEventId = payload.clientEventId || buildClientEventId("PARTIDO_INICIADO", id);

    if (await findMatchEventByClientId(tx, clientEventId)) {
      throw new AppError("Evento duplicado", 409, "El clientEventId ya existe");
    }

    const match = await updateMatch(tx, id, {
      status: "EN_JUEGO",
      startedAt: new Date(),
      updatedBy: req.user.id
    });

    await createMatchEvent(tx, {
      matchId: id,
      clientEventId,
      type: "PARTIDO_INICIADO",
      createdBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "matches",
      recordId: match.id,
      action: "UPDATE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(match),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return match;
  });
}

export async function finishMatchService(id, payload, req) {
  return prisma.$transaction(async (tx) => {
    const current = await findMatchById(tx, id);

    if (!current) {
      throw new AppError("Partido no encontrado", 404);
    }

    if (current.status !== "EN_JUEGO") {
      throw new AppError("No se puede finalizar el partido", 409, "El partido debe estar EN_JUEGO");
    }

    const clientEventId = payload.clientEventId || buildClientEventId("PARTIDO_FINALIZADO", id);

    if (await findMatchEventByClientId(tx, clientEventId)) {
      throw new AppError("Evento duplicado", 409, "El clientEventId ya existe");
    }

    const homeScore = payload.homeScore ?? current.homeScore;
    const awayScore = payload.awayScore ?? current.awayScore;

    await upsertStanding(tx, current.tournamentId, current.homeTeamId);
    await upsertStanding(tx, current.tournamentId, current.awayTeamId);
    await upsertTeamStatistic(tx, current.tournamentId, current.homeTeamId);
    await upsertTeamStatistic(tx, current.tournamentId, current.awayTeamId);

    const finishResult = await finishMatchIfInPlay(tx, id, {
      status: "FINALIZADO",
      finishedAt: new Date(),
      homeScore,
      awayScore,
      updatedBy: req.user.id
    });

    if (finishResult.count !== 1) {
      throw new AppError("No se puede finalizar el partido", 409, "El partido ya no esta EN_JUEGO");
    }

    const match = await findMatchById(tx, id);

    await createMatchEvent(tx, {
      matchId: id,
      clientEventId,
      type: "PARTIDO_FINALIZADO",
      payload: { homeScore, awayScore },
      createdBy: req.user.id
    });

    await recalculateTournamentStandingsAndTeamStats(tx, match.tournament);

    await createAuditLog(tx, {
      tableName: "matches",
      recordId: match.id,
      action: "UPDATE",
      oldValues: toAuditJson(current),
      newValues: toAuditJson(match),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return match;
  });
}
