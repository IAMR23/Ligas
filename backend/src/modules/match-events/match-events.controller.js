import { ok } from "../../shared/responses/apiResponse.js";
import {
  createCardEventService,
  createGenericMatchEventService,
  createGoalEventService,
  createSubstitutionEventService,
  listMatchEventsService
} from "./match-events.service.js";

export async function listMatchEventsController(req, res) {
  const events = await listMatchEventsService(req.validated.params.id, req.validated.query);

  return ok(res, {
    message: "Eventos del partido obtenidos correctamente",
    data: { events }
  });
}

export async function createMatchEventController(req, res) {
  const event = await createGenericMatchEventService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Evento registrado correctamente",
    data: { event }
  });
}

export async function createGoalEventController(req, res) {
  const result = await createGoalEventService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Gol registrado correctamente",
    data: result
  });
}

export async function createCardEventController(req, res) {
  const event = await createCardEventService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Tarjeta registrada correctamente",
    data: { event }
  });
}

export async function createSubstitutionEventController(req, res) {
  const event = await createSubstitutionEventService(req.validated.params.id, req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: "Sustitucion registrada correctamente",
    data: { event }
  });
}
