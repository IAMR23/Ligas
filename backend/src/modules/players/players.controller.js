import { ok } from "../../shared/responses/apiResponse.js";
import {
  assignPlayerTeamService,
  createPlayerService,
  deletePlayerService,
  getPlayerService,
  listPlayersService,
  updatePlayerService
} from "./players.service.js";

export async function listPlayersController(req, res) {
  const players = await listPlayersService(req.validated.query);

  return ok(res, {
    message: "Jugadores obtenidos correctamente",
    data: { players }
  });
}

export async function getPlayerController(req, res) {
  const player = await getPlayerService(req.validated.params.id);

  return ok(res, {
    message: "Jugador obtenido correctamente",
    data: { player }
  });
}

export async function createPlayerController(req, res) {
  const player = await createPlayerService(req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Jugador creado correctamente",
    data: { player }
  });
}

export async function updatePlayerController(req, res) {
  const player = await updatePlayerService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    message: "Jugador actualizado correctamente",
    data: { player }
  });
}

export async function deletePlayerController(req, res) {
  await deletePlayerService(req.validated.params.id, req);

  return ok(res, {
    message: "Jugador eliminado correctamente"
  });
}

export async function assignPlayerTeamController(req, res) {
  const player = await assignPlayerTeamService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    message: "Jugador asignado al equipo correctamente",
    data: { player }
  });
}
