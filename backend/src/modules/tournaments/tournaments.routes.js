import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { listTournamentStandingsController } from "../standings/standings.controller.js";
import { tournamentStandingsSchema } from "../standings/standings.schemas.js";
import {
  createTournamentController,
  deleteTournamentController,
  generateTournamentFixtureController,
  getTournamentDisciplineController,
  getTournamentFixtureController,
  getTournamentSanctionsController,
  getTournamentScorersController,
  getTournamentController,
  listTournamentsController,
  updateTournamentController
} from "./tournaments.controller.js";
import {
  createTournamentSchema,
  listTournamentsSchema,
  tournamentFixtureListSchema,
  tournamentFixtureSchema,
  tournamentIdSchema,
  tournamentSanctionsSchema,
  updateTournamentSchema
} from "./tournaments.schemas.js";

export const tournamentsRouter = Router();

tournamentsRouter.use(authRequired);
tournamentsRouter.get("/", validate(listTournamentsSchema), asyncHandler(listTournamentsController));
tournamentsRouter.get("/:id/fixture", validate(tournamentFixtureListSchema), asyncHandler(getTournamentFixtureController));
tournamentsRouter.get("/:id/standings", validate(tournamentStandingsSchema), asyncHandler(listTournamentStandingsController));
tournamentsRouter.get("/:id/scorers", validate(tournamentIdSchema), asyncHandler(getTournamentScorersController));
tournamentsRouter.get("/:id/discipline", validate(tournamentIdSchema), asyncHandler(getTournamentDisciplineController));
tournamentsRouter.get("/:id/sanctions", validate(tournamentSanctionsSchema), asyncHandler(getTournamentSanctionsController));
tournamentsRouter.post(
  "/:id/fixture/generate",
  requireRole(ROLES.ADMIN),
  validate(tournamentFixtureSchema),
  asyncHandler(generateTournamentFixtureController)
);
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
