export function findTournamentById(client, id) {
  return client.tournament.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });
}

export function listStandingsByTournament(client, tournamentId) {
  return client.standing.findMany({
    where: {
      tournamentId
    },
    include: {
      team: true
    }
  });
}
