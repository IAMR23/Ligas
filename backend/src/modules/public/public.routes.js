import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { getPublicTournamentController } from "../tournaments/tournaments.controller.js";
import { tournamentIdSchema } from "../tournaments/tournaments.schemas.js";

export const publicRouter = Router();

publicRouter.get("/tournaments/:id", validate(tournamentIdSchema), asyncHandler(getPublicTournamentController));
