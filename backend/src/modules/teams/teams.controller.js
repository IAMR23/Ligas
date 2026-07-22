import { ok } from "../../shared/responses/apiResponse.js";
import { createTeamService, deleteTeamService, getTeamService, listTeamsService, updateTeamService } from "./teams.service.js";

export async function listTeamsController(req, res) {
  const teams = await listTeamsService(req.validated.query);

  return ok(res, {
    message: "Equipos obtenidos correctamente",
    data: { teams }
  });
}

export async function getTeamController(req, res) {
  const team = await getTeamService(req.validated.params.id);

  return ok(res, {
    message: "Equipo obtenido correctamente",
    data: { team }
  });
}

export async function createTeamController(req, res) {
  const team = await createTeamService(req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Equipo creado correctamente",
    data: { team }
  });
}

export async function updateTeamController(req, res) {
  const team = await updateTeamService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    message: "Equipo actualizado correctamente",
    data: { team }
  });
}

export async function deleteTeamController(req, res) {
  await deleteTeamService(req.validated.params.id, req);

  return ok(res, {
    message: "Equipo eliminado correctamente"
  });
}
