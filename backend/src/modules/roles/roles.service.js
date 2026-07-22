import { prisma } from "../../database/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { createAuditLog, createRole, findRoleByName, listRoles } from "./roles.repository.js";

export async function listRolesService() {
  return listRoles(prisma);
}

export async function createRoleService(payload, req) {
  return prisma.$transaction(async (tx) => {
    const name = payload.name.toUpperCase();
    const existingRole = await findRoleByName(tx, name);

    if (existingRole) {
      throw new AppError("Rol ya existe", 409);
    }

    const role = await createRole(tx, {
      name,
      description: payload.description,
      createdBy: req.user.id
    });

    await createAuditLog(tx, {
      tableName: "roles",
      recordId: role.id,
      action: "CREATE",
      newValues: role,
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      traceId: req.traceId
    });

    return role;
  });
}
