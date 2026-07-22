import { ok } from "../../shared/responses/apiResponse.js";
import {
  createTournamentService,
  deleteTournamentService,
  getTournamentService,
  listTournamentsService,
  updateTournamentService
} from "./tournaments.service.js";

export async function listTournamentsController(req, res) {
  const tournaments = await listTournamentsService(req.validated.query);

  return ok(res, {
    message: "Torneos obtenidos correctamente",
    data: { tournaments }
  });
}

export async function getTournamentController(req, res) {
  const tournament = await getTournamentService(req.validated.params.id);

  return ok(res, {
    message: "Torneo obtenido correctamente",
    data: { tournament }
  });
}

export async function createTournamentController(req, res) {
  const tournament = await createTournamentService(req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Torneo creado correctamente",
    data: { tournament }
  });
}

export async function updateTournamentController(req, res) {
  const tournament = await updateTournamentService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    message: "Torneo actualizado correctamente",
    data: { tournament }
  });
}

export async function deleteTournamentController(req, res) {
  await deleteTournamentService(req.validated.params.id, req);

  return ok(res, {
    message: "Torneo eliminado correctamente"
  });
}
