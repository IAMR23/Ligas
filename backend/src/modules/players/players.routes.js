import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  assignPlayerTeamController,
  createPlayerController,
  deletePlayerController,
  getPlayerController,
  listPlayersController,
  updatePlayerController
} from "./players.controller.js";
import {
  assignPlayerTeamSchema,
  createPlayerSchema,
  listPlayersSchema,
  playerIdSchema,
  updatePlayerSchema
} from "./players.schemas.js";

export const playersRouter = Router();

playersRouter.use(authRequired);
playersRouter.get("/", validate(listPlayersSchema), asyncHandler(listPlayersController));
playersRouter.get("/:id", validate(playerIdSchema), asyncHandler(getPlayerController));
playersRouter.post("/", requireRole(ROLES.ADMIN), validate(createPlayerSchema), asyncHandler(createPlayerController));
playersRouter.post(
  "/:id/teams",
  requireRole(ROLES.ADMIN),
  validate(assignPlayerTeamSchema),
  asyncHandler(assignPlayerTeamController)
);
playersRouter.put("/:id", requireRole(ROLES.ADMIN), validate(updatePlayerSchema), asyncHandler(updatePlayerController));
playersRouter.delete("/:id", requireRole(ROLES.ADMIN), validate(playerIdSchema), asyncHandler(deletePlayerController));
