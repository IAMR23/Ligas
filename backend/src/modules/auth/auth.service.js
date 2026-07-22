import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../database/prisma.js";
import { ROLES } from "../../config/constants.js";
import { AppError } from "../../shared/errors/AppError.js";
import {
  createRefreshToken as createRefreshTokenValue,
  getRefreshTokenExpiresAt,
  hashToken,
  signAccessToken
} from "../../shared/utils/token.js";
import {
  createAuditLog,
  createLoginLog,
  createPasswordResetToken,
  createRefreshToken,
  createUser,
  findPasswordResetTokenByHash,
  findRefreshTokenByHash,
  findRoleByName,
  findUserByEmail,
  findUserById,
  findUserByIdentifier,
  markPasswordResetTokenUsed,
  revokeRefreshToken,
  updateUser
} from "./auth.repository.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    roles: user.roles.map((userRole) => userRole.role.name)
  };
}

function getRequestMeta(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    traceId: req.traceId
  };
}

async function issueTokens(client, user, req) {
  const refreshToken = createRefreshTokenValue();
  const tokenHash = hashToken(refreshToken);

  await createRefreshToken(client, {
    userId: user.id,
    tokenHash,
    expiresAt: getRefreshTokenExpiresAt(),
    createdBy: user.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return {
    accessToken: signAccessToken(user),
    refreshToken
  };
}

export async function register(payload, req) {
  return prisma.$transaction(async (tx) => {
    const existingUser = await findUserByIdentifier(tx, payload.email);

    if (existingUser || (await findUserByIdentifier(tx, payload.username))) {
      throw new AppError("Usuario ya existe", 409, "El correo o usuario ya esta registrado");
    }

    const publicRole = await findRoleByName(tx, ROLES.PUBLICO);

    if (!publicRole) {
      throw new AppError("Rol PUBLICO no configurado", 500, "Ejecute el seed inicial de roles");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await createUser(tx, {
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      passwordHash,
      roles: {
        create: {
          roleId: publicRole.id
        }
      }
    });

    await createAuditLog(tx, {
      tableName: "users",
      recordId: user.id,
      action: "CREATE",
      newValues: sanitizeUser(user),
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    const tokens = await issueTokens(tx, user, req);

    return {
      user: sanitizeUser(user),
      ...tokens
    };
  });
}

export async function login(payload, req) {
  const meta = getRequestMeta(req);

  return prisma.$transaction(async (tx) => {
    const user = await findUserByIdentifier(tx, payload.identifier);
    const loginLogBase = {
      userId: user?.id,
      username: user?.username || payload.identifier,
      email: user?.email || (payload.identifier.includes("@") ? payload.identifier.toLowerCase() : null),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      deviceId: payload.deviceId,
      platform: payload.platform
    };

    if (!user) {
      await createLoginLog(tx, {
        ...loginLogBase,
        success: false,
        failureReason: "USUARIO_INEXISTENTE"
      });
      throw new AppError("Credenciales invalidas", 401, "Usuario inexistente");
    }

    if (!user.isActive) {
      await createLoginLog(tx, {
        ...loginLogBase,
        success: false,
        failureReason: "USUARIO_INACTIVO"
      });
      throw new AppError("Usuario inactivo", 403, "Contacte al administrador");
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

    if (!passwordMatches) {
      await createLoginLog(tx, {
        ...loginLogBase,
        success: false,
        failureReason: "CONTRASENA_INCORRECTA"
      });
      throw new AppError("Credenciales invalidas", 401, "Contrasena incorrecta");
    }

    await createLoginLog(tx, {
      ...loginLogBase,
      success: true,
      failureReason: null
    });

    await updateUser(tx, { id: user.id }, { lastLoginAt: new Date() });

    await createAuditLog(tx, {
      tableName: "users",
      recordId: user.id,
      action: "LOGIN",
      newValues: { username: user.username, email: user.email },
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      traceId: meta.traceId
    });

    const tokens = await issueTokens(tx, user, req);

    return {
      user: sanitizeUser(user),
      ...tokens
    };
  });
}

export async function refreshToken(payload, req) {
  return prisma.$transaction(async (tx) => {
    const tokenHash = hashToken(payload.refreshToken);
    const storedToken = await findRefreshTokenByHash(tx, tokenHash);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      throw new AppError("Refresh token no valido", 401, "El token fue revocado, expiro o no existe");
    }

    if (!storedToken.user.isActive || storedToken.user.isDeleted) {
      throw new AppError("Usuario inactivo", 403, "No se puede renovar la sesion");
    }

    await revokeRefreshToken(tx, storedToken.id);
    const tokens = await issueTokens(tx, storedToken.user, req);

    return {
      user: sanitizeUser(storedToken.user),
      ...tokens
    };
  });
}

export async function logout(payload, req) {
  return prisma.$transaction(async (tx) => {
    const tokenHash = hashToken(payload.refreshToken);
    const storedToken = await findRefreshTokenByHash(tx, tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await revokeRefreshToken(tx, storedToken.id);
    }

    await createAuditLog(tx, {
      tableName: "refresh_tokens",
      recordId: storedToken?.id,
      action: "LOGOUT",
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return {};
  });
}

export async function forgotPassword(payload, req) {
  return prisma.$transaction(async (tx) => {
    const user = await findUserByEmail(tx, payload.email);

    if (!user) {
      return { resetToken: null };
    }

    const resetToken = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await createPasswordResetToken(tx, {
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt
    });

    await createAuditLog(tx, {
      tableName: "password_reset_tokens",
      action: "CREATE",
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return {
      resetToken,
      expiresAt
    };
  });
}

export async function resetPassword(payload, req) {
  return prisma.$transaction(async (tx) => {
    const storedToken = await findPasswordResetTokenByHash(tx, hashToken(payload.token));

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt <= new Date()) {
      throw new AppError("Token de recuperacion no valido", 401, "El token fue usado, expiro o no existe");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    await updateUser(tx, { id: storedToken.userId }, { passwordHash });
    await markPasswordResetTokenUsed(tx, storedToken.id);

    await createAuditLog(tx, {
      tableName: "users",
      recordId: storedToken.userId,
      action: "UPDATE",
      newValues: { passwordUpdated: true },
      userId: storedToken.userId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return {};
  });
}

export async function getSession(userId) {
  const user = await findUserById(prisma, userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  return sanitizeUser(user);
}
