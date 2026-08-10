import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { toAuditJson } from "../../shared/utils/audit.js";
import {
  countTournamentMatches,
  countTournamentMatchesByStatus,
  createAuditLog,
  createMatch,
  createTournament,
  findFieldById,
  findTournamentByCode,
  findTournamentById,
  listFixtureRounds,
  listDiscipline,
  listNextMatches,
  listRecentResults,
  listSanctions,
  listScorers,
  listStandings,
  listTournamentTeams,
  listTournaments,
  upsertRound,
  upsertStanding,
  upsertTeamStatistic,
  updateTournament
} from "./tournaments.repository.js";
import { generateRoundRobinRounds } from "./fixture.generator.js";
import { sortStandingsRows } from "../standings/standings.service.js";

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function sanitizeCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildMatchCode(tournament, roundNumber, matchNumber) {
  const tournamentCode = sanitizeCode(tournament.code || tournament.id.slice(0, 8));
  const roundCode = String(roundNumber).padStart(2, "0");
  const matchCode = String(matchNumber).padStart(2, "0");

  return `FIX-${tournamentCode}-${roundCode}-${matchCode}`;
}

async function buildTournamentSummary(client, tournamentId) {
  const [totalMatches, playedMatches, nextMatches] = await Promise.all([
    countTournamentMatches(client, tournamentId),
    countTournamentMatchesByStatus(client, tournamentId, "FINALIZADO"),
    listNextMatches(client, tournamentId)
  ]);

  return {
    totalMatches,
    playedMatches,
    pendingMatches: Math.max(totalMatches - playedMatches, 0),
    nextMatches
  };
}

export async function listTournamentsService(filters) {
  return listTournaments(prisma, filters);
}

export async function getTournamentService(id) {
  const tournament = await findTournamentById(prisma, id);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  const summary = await buildTournamentSummary(prisma, id);

  return {
    ...tournament,
    summary
  };
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

export async function getTournamentFixtureService(id, filters = {}) {
  const tournament = await findTournamentById(prisma, id);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  const rounds = await listFixtureRounds(prisma, id, filters);

  return {
    tournament,
    rounds
  };
}

export async function generateTournamentFixtureService(id, payload, req) {
  return prisma.$transaction(async (tx) => {
    const tournament = await findTournamentById(tx, id);

    if (!tournament) {
      throw new AppError("Torneo no encontrado", 404);
    }

    if (payload.format !== "LEAGUE") {
      throw new AppError("Formato no soportado", 400, "El MVP solo soporta todos contra todos");
    }

    const existingMatches = await countTournamentMatches(tx, id);

    if (existingMatches > 0) {
      throw new AppError("Fixture existente", 409, "El campeonato ya tiene partidos y no se generara un duplicado");
    }

    if (payload.fieldId) {
      const field = await findFieldById(tx, payload.fieldId);

      if (!field) {
        throw new AppError("Cancha no encontrada", 404);
      }
    }

    const teams = await listTournamentTeams(tx, id);

    if (teams.length < 2) {
      throw new AppError("Equipos insuficientes", 400, "Se requieren al menos dos equipos para generar fixture");
    }

    const roundTrip = payload.roundTrip ?? tournament.roundTrip;
    const generatedRounds = generateRoundRobinRounds(
      teams.map((team) => team.id),
      { roundTrip }
    );
    const createdRounds = [];
    let createdMatches = 0;

    await updateTournament(tx, id, {
      format: payload.format,
      roundTrip,
      updatedBy: req.user.id
    });

    for (const team of teams) {
      await upsertStanding(tx, id, team.id);
      await upsertTeamStatistic(tx, id, team.id);
    }

    for (const [roundIndex, matches] of generatedRounds.entries()) {
      const roundNumber = roundIndex + 1;
      const round = await upsertRound(tx, {
        tournamentId: id,
        name: `Fecha ${roundNumber}`,
        number: roundNumber,
        createdBy: req.user.id,
        updatedBy: req.user.id
      });

      createdRounds.push(round);

      for (const [matchIndex, match] of matches.entries()) {
        await createMatch(tx, {
          code: buildMatchCode(tournament, roundNumber, matchIndex + 1),
          tournamentId: id,
          roundId: round.id,
          fieldId: payload.fieldId || null,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          status: "PROGRAMADO",
          createdBy: req.user.id
        });
        createdMatches += 1;
      }
    }

    await createAuditLog(tx, {
      tableName: "matches",
      recordId: id,
      action: "CREATE",
      newValues: {
        tournamentId: id,
        format: payload.format,
        roundTrip,
        rounds: createdRounds.length,
        matches: createdMatches
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return {
      tournamentId: id,
      format: payload.format,
      roundTrip,
      roundsCreated: createdRounds.length,
      matchesCreated: createdMatches
    };
  });
}

export async function getTournamentScorersService(id) {
  const tournament = await findTournamentById(prisma, id);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  const scorers = await listScorers(prisma, id);

  return {
    tournament,
    scorers: scorers.map((row, index) => ({
      position: index + 1,
      ...row
    }))
  };
}

export async function getTournamentDisciplineService(id) {
  const tournament = await findTournamentById(prisma, id);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  const [discipline, sanctions] = await Promise.all([listDiscipline(prisma, id), listSanctions(prisma, id, { status: "ACTIVA" })]);
  const activeSanctionsByPlayer = sanctions.reduce((summary, sanction) => {
    if (!sanction.playerId) {
      return summary;
    }

    return {
      ...summary,
      [sanction.playerId]: (summary[sanction.playerId] || 0) + 1
    };
  }, {});

  return {
    tournament,
    discipline: discipline.map((row) => ({
      ...row,
      activeSanctions: activeSanctionsByPlayer[row.playerId] || 0
    }))
  };
}

export async function getTournamentSanctionsService(id, filters = {}) {
  const tournament = await findTournamentById(prisma, id);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  const sanctions = await listSanctions(prisma, id, filters);

  return {
    tournament,
    sanctions
  };
}

export async function getPublicTournamentService(id) {
  const tournament = await findTournamentById(prisma, id);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  const [standings, nextMatches, recentResults, scorers] = await Promise.all([
    listStandings(prisma, id),
    listNextMatches(prisma, id, 8),
    listRecentResults(prisma, id, 6),
    listScorers(prisma, id)
  ]);

  return {
    tournament: {
      id: tournament.id,
      code: tournament.code,
      name: tournament.name,
      description: tournament.description,
      status: tournament.status,
      startDate: tournament.startDate,
      endDate: tournament.endDate
    },
    standings: sortStandingsRows(standings, tournament.tiebreakers).map((row, index) => ({
      position: index + 1,
      ...row
    })),
    nextMatches,
    recentResults,
    scorers: scorers.map((row, index) => ({
      position: index + 1,
      ...row
    }))
  };
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
