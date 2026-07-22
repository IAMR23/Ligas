export function listRoles(client) {
  return client.role.findMany({
    where: { isDeleted: false },
    orderBy: { name: "asc" }
  });
}

export function findRoleByName(client, name) {
  return client.role.findUnique({
    where: { name }
  });
}

export function createRole(client, data) {
  return client.role.create({ data });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}
