import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { DEFAULT_TIEBREAKERS } from "./standings.constants.js";
import { findTournamentById, listStandingsByTournament } from "./standings.repository.js";

function getTiebreakers(tournament) {
  return Array.isArray(tournament.tiebreakers) && tournament.tiebreakers.length
    ? tournament.tiebreakers
    : DEFAULT_TIEBREAKERS;
}

function compareByTiebreaker(a, b, tiebreaker) {
  if (tiebreaker === "GOAL_DIFF") {
    return b.goalDiff - a.goalDiff;
  }

  if (tiebreaker === "GOALS_FOR") {
    return b.goalsFor - a.goalsFor;
  }

  return 0;
}

export function sortStandingsRows(rows, tiebreakers = DEFAULT_TIEBREAKERS) {
  return [...rows].sort((a, b) => {
    const pointsDiff = b.points - a.points;

    if (pointsDiff !== 0) {
      return pointsDiff;
    }

    for (const tiebreaker of tiebreakers) {
      const result = compareByTiebreaker(a, b, tiebreaker);

      if (result !== 0) {
        return result;
      }
    }

    return (a.team?.name || "").localeCompare(b.team?.name || "");
  });
}

export async function listTournamentStandingsService(tournamentId) {
  const tournament = await findTournamentById(prisma, tournamentId);

  if (!tournament) {
    throw new AppError("Torneo no encontrado", 404);
  }

  const rows = await listStandingsByTournament(prisma, tournamentId);
  const standings = sortStandingsRows(rows, getTiebreakers(tournament)).map((row, index) => ({
    position: index + 1,
    ...row
  }));

  return {
    tournament,
    standings
  };
}
