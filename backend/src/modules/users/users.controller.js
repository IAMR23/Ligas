import { ok } from "../../shared/responses/apiResponse.js";
import { createUserService, getUserService, listUsersService } from "./users.service.js";

export async function listUsersController(_req, res) {
  const users = await listUsersService();

  return ok(res, {
    message: "Usuarios obtenidos correctamente",
    data: { users }
  });
}

export async function getUserController(req, res) {
  const user = await getUserService(req.validated.params.id);

  return ok(res, {
    message: "Usuario obtenido correctamente",
    data: { user }
  });
}

export async function createUserController(req, res) {
  const user = await createUserService(req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Usuario creado correctamente",
    data: { user }
  });
}
