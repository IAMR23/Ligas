const BYE = null;

function rotateTeams(teams) {
  return [teams[0], teams.at(-1), ...teams.slice(1, -1)];
}

function normalizeTeamIds(teamIds) {
  const uniqueIds = [...new Set(teamIds)];

  if (uniqueIds.length !== teamIds.length) {
    throw new Error("No se puede generar fixture con equipos duplicados");
  }

  if (uniqueIds.length < 2) {
    throw new Error("Se requieren al menos dos equipos");
  }

  return uniqueIds.length % 2 === 0 ? uniqueIds : [...uniqueIds, BYE];
}

export function generateRoundRobinRounds(teamIds, { roundTrip = false } = {}) {
  const normalizedTeams = normalizeTeamIds(teamIds);
  const rounds = [];
  let rotation = [...normalizedTeams];
  const matchesPerRound = normalizedTeams.length / 2;
  const totalRounds = normalizedTeams.length - 1;

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const matches = [];

    for (let index = 0; index < matchesPerRound; index += 1) {
      const left = rotation[index];
      const right = rotation[normalizedTeams.length - 1 - index];

      if (left === BYE || right === BYE) {
        continue;
      }

      const shouldFlip = roundIndex % 2 === 1;
      const homeTeamId = shouldFlip ? right : left;
      const awayTeamId = shouldFlip ? left : right;

      matches.push({ homeTeamId, awayTeamId });
    }

    rounds.push(matches);
    rotation = rotateTeams(rotation);
  }

  if (!roundTrip) {
    return rounds;
  }

  const secondLeg = rounds.map((matches) =>
    matches.map((match) => ({
      homeTeamId: match.awayTeamId,
      awayTeamId: match.homeTeamId
    }))
  );

  return [...rounds, ...secondLeg];
}
