import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  listAuditLogsController,
  listErrorLogsController,
  listLoginLogsController,
  listSyncLogsController
} from "./logs.controller.js";
import { logsQuerySchema } from "./logs.schemas.js";

export const logsRouter = Router();

logsRouter.use(authRequired, requireRole(ROLES.SUPER_USUARIO));
logsRouter.get("/audit", validate(logsQuerySchema), asyncHandler(listAuditLogsController));
logsRouter.get("/login", validate(logsQuerySchema), asyncHandler(listLoginLogsController));
logsRouter.get("/sync", validate(logsQuerySchema), asyncHandler(listSyncLogsController));
logsRouter.get("/errors", validate(logsQuerySchema), asyncHandler(listErrorLogsController));
