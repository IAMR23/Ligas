import { ok } from "../../shared/responses/apiResponse.js";
import { createRoleService, listRolesService } from "./roles.service.js";

export async function listRolesController(_req, res) {
  const roles = await listRolesService();

  return ok(res, {
    message: "Roles obtenidos correctamente",
    data: { roles }
  });
}

export async function createRoleController(req, res) {
  const role = await createRoleService(req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Rol creado correctamente",
    data: { role }
  });
}
