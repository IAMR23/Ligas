import { ok } from "../../shared/responses/apiResponse.js";
import { listFieldsService } from "./fields.service.js";

export async function listFieldsController(req, res) {
  const fields = await listFieldsService(req.validated.query);

  return ok(res, {
    message: "Canchas obtenidas correctamente",
    data: { fields }
  });
}
