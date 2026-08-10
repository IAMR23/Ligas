import { ok } from "../../shared/responses/apiResponse.js";
import { listTournamentStandingsService } from "./standings.service.js";

export async function listTournamentStandingsController(req, res) {
  const result = await listTournamentStandingsService(req.validated.params.id || req.validated.query.tournamentId);

  return ok(res, {
    message: "Tabla de posiciones obtenida correctamente",
    data: result
  });
}
