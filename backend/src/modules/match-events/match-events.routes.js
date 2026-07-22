import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createCardEventController,
  createGoalEventController,
  createMatchEventController,
  createSubstitutionEventController,
  listMatchEventsController
} from "./match-events.controller.js";
import {
  createCardEventSchema,
  createGoalEventSchema,
  createMatchEventSchema,
  createSubstitutionEventSchema,
  listMatchEventsSchema
} from "./match-events.schemas.js";

export const matchEventsRouter = Router({ mergeParams: true });

matchEventsRouter.use(authRequired);
matchEventsRouter.get("/", validate(listMatchEventsSchema), asyncHandler(listMatchEventsController));
matchEventsRouter.post(
  "/",
  requireRole(ROLES.ADMIN, ROLES.ARBITRO, ROLES.VOCAL),
  validate(createMatchEventSchema),
  asyncHandler(createMatchEventController)
);
matchEventsRouter.post(
  "/goal",
  requireRole(ROLES.ADMIN, ROLES.ARBITRO),
  validate(createGoalEventSchema),
  asyncHandler(createGoalEventController)
);
matchEventsRouter.post(
  "/card",
  requireRole(ROLES.ADMIN, ROLES.ARBITRO),
  validate(createCardEventSchema),
  asyncHandler(createCardEventController)
);
matchEventsRouter.post(
  "/substitution",
  requireRole(ROLES.ADMIN, ROLES.ARBITRO),
  validate(createSubstitutionEventSchema),
  asyncHandler(createSubstitutionEventController)
);
