export function listUsers(client) {
  return client.user.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
}

export function getUserById(client, id) {
  return client.user.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
}

export function findUserByEmailOrUsername(client, email, username) {
  return client.user.findFirst({
    where: {
      isDeleted: false,
      OR: [{ email }, { username }]
    }
  });
}

export function findRolesByNames(client, names) {
  return client.role.findMany({
    where: {
      name: { in: names },
      isDeleted: false
    }
  });
}

export function createUser(client, data) {
  return client.user.create({
    data,
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}
