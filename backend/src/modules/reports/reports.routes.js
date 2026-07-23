import { Router } from "express";
import { ROLES } from "../../config/constants.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { exportExcelController, exportPdfController, listReportsController } from "./reports.controller.js";
import { exportReportSchema, listReportsSchema } from "./reports.schemas.js";

export const reportsRouter = Router();

reportsRouter.use(authRequired);
reportsRouter.get("/", validate(listReportsSchema), asyncHandler(listReportsController));
reportsRouter.get(
  "/:code/pdf",
  requireRole(ROLES.ADMIN),
  validate(exportReportSchema),
  asyncHandler(exportPdfController)
);
reportsRouter.get(
  "/:code/excel",
  requireRole(ROLES.ADMIN),
  validate(exportReportSchema),
  asyncHandler(exportExcelController)
);
