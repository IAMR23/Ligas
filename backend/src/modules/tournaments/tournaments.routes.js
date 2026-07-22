import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createTournamentController,
  deleteTournamentController,
  getTournamentController,
  listTournamentsController,
  updateTournamentController
} from "./tournaments.controller.js";
import {
  createTournamentSchema,
  listTournamentsSchema,
  tournamentIdSchema,
  updateTournamentSchema
} from "./tournaments.schemas.js";

export const tournamentsRouter = Router();

tournamentsRouter.use(authRequired);
tournamentsRouter.get("/", validate(listTournamentsSchema), asyncHandler(listTournamentsController));
tournamentsRouter.get("/:id", validate(tournamentIdSchema), asyncHandler(getTournamentController));
tournamentsRouter.post(
  "/",
  requireRole(ROLES.ADMIN),
  validate(createTournamentSchema),
  asyncHandler(createTournamentController)
);
tournamentsRouter.put(
  "/:id",
  requireRole(ROLES.ADMIN),
  validate(updateTournamentSchema),
  asyncHandler(updateTournamentController)
);
tournamentsRouter.delete(
  "/:id",
  requireRole(ROLES.ADMIN),
  validate(tournamentIdSchema),
  asyncHandler(deleteTournamentController)
);
