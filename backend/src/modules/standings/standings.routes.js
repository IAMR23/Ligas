import { Router } from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { listTournamentStandingsController } from "./standings.controller.js";
import { listStandingsSchema } from "./standings.schemas.js";

export const standingsRouter = Router();

standingsRouter.use(authRequired);
standingsRouter.get("/", validate(listStandingsSchema), asyncHandler(listTournamentStandingsController));
