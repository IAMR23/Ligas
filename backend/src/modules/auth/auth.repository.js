export function findUserByIdentifier(client, identifier) {
  return client.user.findFirst({
    where: {
      isDeleted: false,
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }]
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

export function findUserByEmail(client, email) {
  return client.user.findFirst({
    where: {
      email,
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

export function findUserById(client, id) {
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

export function updateUser(client, where, data) {
  return client.user.update({
    where,
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

export function findRoleByName(client, name) {
  return client.role.findUnique({
    where: { name }
  });
}

export function createRefreshToken(client, data) {
  return client.refreshToken.create({ data });
}

export function findRefreshTokenByHash(client, tokenHash) {
  return client.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      }
    }
  });
}

export function revokeRefreshToken(client, id) {
  return client.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() }
  });
}

export function createPasswordResetToken(client, data) {
  return client.passwordResetToken.create({ data });
}

export function findPasswordResetTokenByHash(client, tokenHash) {
  return client.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      }
    }
  });
}

export function markPasswordResetTokenUsed(client, id) {
  return client.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() }
  });
}

export function createLoginLog(client, data) {
  return client.userLoginLog.create({ data });
}

export function createAuditLog(client, data) {
  return client.auditLog.create({ data });
}
