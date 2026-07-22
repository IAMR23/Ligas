import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { createRoleController, listRolesController } from "./roles.controller.js";
import { createRoleSchema } from "./roles.schemas.js";

export const rolesRouter = Router();

rolesRouter.use(authRequired, requireRole(ROLES.SUPER_USUARIO));
rolesRouter.get("/", asyncHandler(listRolesController));
rolesRouter.post("/", validate(createRoleSchema), asyncHandler(createRoleController));
