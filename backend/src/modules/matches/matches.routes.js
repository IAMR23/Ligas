import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createMatchController,
  deleteMatchController,
  finishMatchController,
  getMatchController,
  listMatchesController,
  startMatchController,
  updateMatchController
} from "./matches.controller.js";
import {
  createMatchSchema,
  finishMatchSchema,
  listMatchesSchema,
  matchIdSchema,
  startMatchSchema,
  updateMatchSchema
} from "./matches.schemas.js";

export const matchesRouter = Router();

matchesRouter.use(authRequired);
matchesRouter.get("/", validate(listMatchesSchema), asyncHandler(listMatchesController));
matchesRouter.get("/:id", validate(matchIdSchema), asyncHandler(getMatchController));
matchesRouter.post("/", requireRole(ROLES.ADMIN), validate(createMatchSchema), asyncHandler(createMatchController));
matchesRouter.put("/:id", requireRole(ROLES.ADMIN), validate(updateMatchSchema), asyncHandler(updateMatchController));
matchesRouter.delete("/:id", requireRole(ROLES.ADMIN), validate(matchIdSchema), asyncHandler(deleteMatchController));
matchesRouter.post("/:id/start", requireRole(ROLES.ADMIN, ROLES.ARBITRO), validate(startMatchSchema), asyncHandler(startMatchController));
matchesRouter.post("/:id/finish", requireRole(ROLES.ADMIN, ROLES.ARBITRO), validate(finishMatchSchema), asyncHandler(finishMatchController));
