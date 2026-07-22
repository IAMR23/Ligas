import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createTeamController,
  deleteTeamController,
  getTeamController,
  listTeamsController,
  updateTeamController
} from "./teams.controller.js";
import { createTeamSchema, listTeamsSchema, teamIdSchema, updateTeamSchema } from "./teams.schemas.js";

export const teamsRouter = Router();

teamsRouter.use(authRequired);
teamsRouter.get("/", validate(listTeamsSchema), asyncHandler(listTeamsController));
teamsRouter.get("/:id", validate(teamIdSchema), asyncHandler(getTeamController));
teamsRouter.post("/", requireRole(ROLES.ADMIN), validate(createTeamSchema), asyncHandler(createTeamController));
teamsRouter.put("/:id", requireRole(ROLES.ADMIN), validate(updateTeamSchema), asyncHandler(updateTeamController));
teamsRouter.delete("/:id", requireRole(ROLES.ADMIN), validate(teamIdSchema), asyncHandler(deleteTeamController));
