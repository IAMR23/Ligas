import { Router } from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { listFieldsController } from "./fields.controller.js";
import { listFieldsSchema } from "./fields.schemas.js";

export const fieldsRouter = Router();

fieldsRouter.use(authRequired);
fieldsRouter.get("/", validate(listFieldsSchema), asyncHandler(listFieldsController));
