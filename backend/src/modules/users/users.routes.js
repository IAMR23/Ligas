import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { createUserController, getUserController, listUsersController } from "./users.controller.js";
import { createUserSchema, userIdSchema } from "./users.schemas.js";

export const usersRouter = Router();

usersRouter.use(authRequired, requireRole(ROLES.SUPER_USUARIO));
usersRouter.get("/", asyncHandler(listUsersController));
usersRouter.post("/", validate(createUserSchema), asyncHandler(createUserController));
usersRouter.get("/:id", validate(userIdSchema), asyncHandler(getUserController));
