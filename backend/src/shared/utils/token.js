import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { REFRESH_TOKEN_BYTES } from "../../config/constants.js";

export function signAccessToken(user) {
  const roles = user.roles?.map((userRole) => userRole.role.name) || user.roles || [];

  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles
    },
    env.jwtSecret,
    { expiresIn: `${env.jwtExpiresMinutes}m` }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function createRefreshToken() {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresDays);
  return expiresAt;
}
