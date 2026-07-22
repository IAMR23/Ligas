import bcrypt from "bcrypt";
import { prisma } from "../../database/prisma.js";
import { ROLES } from "../../config/constants.js";
import { AppError } from "../../shared/errors/AppError.js";
import {
  createAuditLog,
  createUser,
  findRolesByNames,
  findUserByEmailOrUsername,
  getUserById,
  listUsers
} from "./users.repository.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    isActive: user.isActive,
    roles: user.roles.map((userRole) => userRole.role.name),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function listUsersService() {
  const users = await listUsers(prisma);
  return users.map(sanitizeUser);
}

export async function getUserService(id) {
  const user = await getUserById(prisma, id);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  return sanitizeUser(user);
}

export async function createUserService(payload, req) {
  return prisma.$transaction(async (tx) => {
    const existingUser = await findUserByEmailOrUsername(tx, payload.email, payload.username);

    if (existingUser) {
      throw new AppError("Usuario ya existe", 409, "El correo o usuario ya esta registrado");
    }

    const requestedRoles = payload.roles?.length ? payload.roles : [ROLES.PUBLICO];
    const roles = await findRolesByNames(tx, requestedRoles);

    if (roles.length !== requestedRoles.length) {
      throw new AppError("Roles invalidos", 400, "Uno o mas roles solicitados no existen");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await createUser(tx, {
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      passwordHash,
      createdBy: req.user.id,
      roles: {
        create: roles.map((role) => ({ roleId: role.id }))
      }
    });

    const sanitized = sanitizeUser(user);

    await createAuditLog(tx, {
      tableName: "users",
      recordId: user.id,
      action: "CREATE",
      newValues: sanitized,
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return sanitized;
  });
}
