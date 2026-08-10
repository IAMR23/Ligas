import { ok } from "../../shared/responses/apiResponse.js";
import {
  createTournamentService,
  deleteTournamentService,
  generateTournamentFixtureService,
  getPublicTournamentService,
  getTournamentDisciplineService,
  getTournamentFixtureService,
  getTournamentSanctionsService,
  getTournamentScorersService,
  getTournamentService,
  listTournamentsService,
  updateTournamentService
} from "./tournaments.service.js";

export async function listTournamentsController(req, res) {
  const result = await listTournamentsService(req.validated.query);

  return ok(res, {
    message: "Torneos obtenidos correctamente",
    data: { tournaments: result.items, pagination: result.pagination }
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

export async function getTournamentFixtureController(req, res) {
  const fixture = await getTournamentFixtureService(req.validated.params.id, req.validated.query);

  return ok(res, {
    message: "Fixture obtenido correctamente",
    data: fixture
  });
}

export async function generateTournamentFixtureController(req, res) {
  const fixture = await generateTournamentFixtureService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Fixture generado correctamente",
    data: { fixture }
  });
}

export async function getTournamentScorersController(req, res) {
  const result = await getTournamentScorersService(req.validated.params.id);

  return ok(res, {
    message: "Goleadores obtenidos correctamente",
    data: result
  });
}

export async function getTournamentDisciplineController(req, res) {
  const result = await getTournamentDisciplineService(req.validated.params.id);

  return ok(res, {
    message: "Disciplina obtenida correctamente",
    data: result
  });
}

export async function getTournamentSanctionsController(req, res) {
  const result = await getTournamentSanctionsService(req.validated.params.id, req.validated.query);

  return ok(res, {
    message: "Sanciones obtenidas correctamente",
    data: result
  });
}

export async function getPublicTournamentController(req, res) {
  const result = await getPublicTournamentService(req.validated.params.id);

  return ok(res, {
    message: "Campeonato publico obtenido correctamente",
    data: result
  });
}
