import { Router } from "express";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  refreshTokenController,
  registerController,
  resetPasswordController
} from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema
} from "./auth.schemas.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(registerController));
authRouter.post("/login", validate(loginSchema), asyncHandler(loginController));
authRouter.post("/refresh-token", validate(refreshTokenSchema), asyncHandler(refreshTokenController));
authRouter.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPasswordController));
authRouter.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPasswordController));
authRouter.post("/logout", authRequired, validate(refreshTokenSchema), asyncHandler(logoutController));
authRouter.get("/me", authRequired, asyncHandler(meController));
