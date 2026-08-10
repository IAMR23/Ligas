import { ok } from "../../shared/responses/apiResponse.js";
import {
  createMatchService,
  deleteMatchService,
  finishMatchService,
  getMatchService,
  listMatchesService,
  startMatchService,
  updateMatchService
} from "./matches.service.js";

export async function listMatchesController(req, res) {
  const result = await listMatchesService(req.validated.query);

  return ok(res, {
    message: "Partidos obtenidos correctamente",
    data: { matches: result.items, pagination: result.pagination }
  });
}

export async function getMatchController(req, res) {
  const match = await getMatchService(req.validated.params.id);

  return ok(res, {
    message: "Partido obtenido correctamente",
    data: { match }
  });
}

export async function createMatchController(req, res) {
  const match = await createMatchService(req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Partido creado correctamente",
    data: { match }
  });
}

export async function updateMatchController(req, res) {
  const match = await updateMatchService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    message: "Partido actualizado correctamente",
    data: { match }
  });
}

export async function deleteMatchController(req, res) {
  await deleteMatchService(req.validated.params.id, req);

  return ok(res, {
    message: "Partido eliminado correctamente"
  });
}

export async function startMatchController(req, res) {
  const match = await startMatchService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    message: "Partido iniciado correctamente",
    data: { match }
  });
}

export async function finishMatchController(req, res) {
  const match = await finishMatchService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    message: "Partido finalizado correctamente",
    data: { match }
  });
}
