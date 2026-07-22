import { AUTH_MESSAGES } from "./auth.constants.js";
import { ok } from "../../shared/responses/apiResponse.js";
import {
  forgotPassword,
  getSession,
  login,
  logout,
  refreshToken,
  register,
  resetPassword
} from "./auth.service.js";

export async function registerController(req, res) {
  const data = await register(req.validated.body, req);

  return ok(res, {
    statusCode: 201,
    message: AUTH_MESSAGES.REGISTERED,
    data
  });
}

export async function loginController(req, res) {
  const data = await login(req.validated.body, req);

  return ok(res, {
    message: AUTH_MESSAGES.LOGGED_IN,
    data
  });
}

export async function refreshTokenController(req, res) {
  const data = await refreshToken(req.validated.body, req);

  return ok(res, {
    message: AUTH_MESSAGES.TOKEN_REFRESHED,
    data
  });
}

export async function logoutController(req, res) {
  await logout(req.validated.body, req);

  return ok(res, {
    message: AUTH_MESSAGES.LOGGED_OUT
  });
}

export async function forgotPasswordController(req, res) {
  const data = await forgotPassword(req.validated.body, req);

  return ok(res, {
    message: AUTH_MESSAGES.PASSWORD_RESET_REQUESTED,
    data
  });
}

export async function resetPasswordController(req, res) {
  await resetPassword(req.validated.body, req);

  return ok(res, {
    message: AUTH_MESSAGES.PASSWORD_RESET
  });
}

export async function meController(req, res) {
  const user = await getSession(req.user.id);

  return ok(res, {
    message: "Sesion activa",
    data: { user }
  });
}
