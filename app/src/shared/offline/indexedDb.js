import Dexie from "dexie";

export const db = new Dexie("liga_futbol_mvp");

db.version(1).stores({
  local_matches: "id, tournamentId, status, updatedAt",
  local_teams: "id, tournamentId, updatedAt",
  local_players: "id, teamId, updatedAt",
  local_match_events: "id, matchId, clientEventId, type, createdAt",
  local_vocalia: "id, matchId, updatedAt",
  sync_queue: "++id, endpoint, method, status, attempts, createdAt, lastAttemptAt"
});
