import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roles = [
  "SUPER_USUARIO",
  "ADMIN",
  "ARBITRO",
  "VOCAL",
  "DELEGADO",
  "JUGADOR",
  "PUBLICO"
];

const permissions = [
  "DASHBOARD_READ",
  "TOURNAMENTS_MANAGE",
  "TEAMS_MANAGE",
  "PLAYERS_MANAGE",
  "MATCHES_MANAGE",
  "MATCH_EVENTS_MANAGE",
  "REFEREES_MANAGE",
  "VOCALIA_MANAGE",
  "SANCTIONS_MANAGE",
  "STANDINGS_READ",
  "REPORTS_READ",
  "REPORTS_EXPORT",
  "LOGS_READ",
  "AUDIT_READ",
  "USERS_MANAGE",
  "ROLES_MANAGE",
  "SYNC_CONFLICTS_MANAGE"
];

const reports = [
  ["MATCHES_BY_TOURNAMENT", "Partidos por torneo"],
  ["GOALS_BY_PLAYER", "Goles por jugador"],
  ["GOALS_BY_TEAM", "Goles por equipo"],
  ["CARDS", "Tarjetas"],
  ["SANCTIONS", "Sanciones"],
  ["STANDINGS", "Tabla de posiciones"],
  ["VOCALIAS", "Vocalias"],
  ["REFEREEING", "Arbitraje"],
  ["LOGIN_LOGS", "Logs de ingreso"],
  ["AUDIT", "Auditoria"]
];

const demoPlayers = [
  ["Halcones Norte", "HN-001", "Carlos Mendoza", 10],
  ["Halcones Norte", "HN-002", "Miguel Perez", 7],
  ["Halcones Norte", "HN-003", "Andres Ruiz", 1],
  ["Tigres Sur", "TS-001", "Luis Zambrano", 9],
  ["Tigres Sur", "TS-002", "Jorge Vera", 11],
  ["Tigres Sur", "TS-003", "Diego Castro", 1]
];

async function upsertUser({ fullName, username, email, password, roleName }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      username,
      passwordHash,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null
    },
    create: {
      fullName,
      username,
      email,
      passwordHash,
      isActive: true
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id
    }
  });

  return user;
}

async function seedSecurity() {
  const roleRecords = new Map();

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {
        isSystem: true,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      create: {
        name: roleName,
        description: `Rol inicial ${roleName}`,
        isSystem: true
      }
    });

    roleRecords.set(roleName, role);
  }

  const permissionRecords = [];

  for (const code of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: {},
      create: {
        code,
        description: `Permiso ${code}`
      }
    });

    permissionRecords.push(permission);
  }

  const superRole = roleRecords.get("SUPER_USUARIO");

  for (const permission of permissionRecords) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: superRole.id,
        permissionId: permission.id
      }
    });
  }

  const superUser = await upsertUser({
    fullName: "Super Usuario",
    username: process.env.SUPER_USER_USERNAME || "superadmin",
    email: process.env.SUPER_USER_EMAIL || "superadmin@ligafutbol.com",
    password: process.env.SUPER_USER_PASSWORD || "ChangeMe123",
    roleName: "SUPER_USUARIO"
  });

  const refereeUser = await upsertUser({
    fullName: "Arbitro Demo",
    username: "arbitro.demo",
    email: "arbitro.demo@ligafutbol.com",
    password: "ChangeMe123",
    roleName: "ARBITRO"
  });

  const vocalUser = await upsertUser({
    fullName: "Vocal Demo",
    username: "vocal.demo",
    email: "vocal.demo@ligafutbol.com",
    password: "ChangeMe123",
    roleName: "VOCAL"
  });

  return { superUser, refereeUser, vocalUser };
}

async function seedDemoData({ superUser, refereeUser, vocalUser }) {
  const tournament = await prisma.tournament.upsert({
    where: { code: "TORNEO-DEMO-2026" },
    update: {
      name: "Torneo Demo 2026",
      status: "ACTIVO",
      isDeleted: false
    },
    create: {
      code: "TORNEO-DEMO-2026",
      name: "Torneo Demo 2026",
      description: "Torneo base para validar el MVP.",
      status: "ACTIVO",
      startDate: new Date("2026-08-01T00:00:00.000Z"),
      endDate: new Date("2026-12-15T00:00:00.000Z"),
      createdBy: superUser.id
    }
  });

  const category = await prisma.category.upsert({
    where: {
      tournamentId_name: {
        tournamentId: tournament.id,
        name: "Senior"
      }
    },
    update: {},
    create: {
      tournamentId: tournament.id,
      name: "Senior",
      description: "Categoria principal demo",
      createdBy: superUser.id
    }
  });

  const halcones = await prisma.team.upsert({
    where: { code: "HALCONES-NORTE" },
    update: {
      name: "Halcones Norte",
      tournamentId: tournament.id,
      categoryId: category.id,
      isDeleted: false
    },
    create: {
      code: "HALCONES-NORTE",
      name: "Halcones Norte",
      colorPrimary: "#0f766e",
      colorAccent: "#facc15",
      tournamentId: tournament.id,
      categoryId: category.id,
      createdBy: superUser.id
    }
  });

  const tigres = await prisma.team.upsert({
    where: { code: "TIGRES-SUR" },
    update: {
      name: "Tigres Sur",
      tournamentId: tournament.id,
      categoryId: category.id,
      isDeleted: false
    },
    create: {
      code: "TIGRES-SUR",
      name: "Tigres Sur",
      colorPrimary: "#1d4ed8",
      colorAccent: "#ef4444",
      tournamentId: tournament.id,
      categoryId: category.id,
      createdBy: superUser.id
    }
  });

  const teamByName = new Map([
    [halcones.name, halcones],
    [tigres.name, tigres]
  ]);

  for (const [teamName, documentNumber, fullName, jerseyNumber] of demoPlayers) {
    const player = await prisma.player.upsert({
      where: { documentNumber },
      update: {
        fullName,
        isActive: true,
        isDeleted: false
      },
      create: {
        documentNumber,
        fullName,
        jerseyName: fullName.split(" ").at(-1),
        createdBy: superUser.id
      }
    });

    const team = teamByName.get(teamName);

    await prisma.playerTeam.upsert({
      where: {
        playerId_teamId: {
          playerId: player.id,
          teamId: team.id
        }
      },
      update: {
        jerseyNumber,
        isActive: true,
        isDeleted: false
      },
      create: {
        playerId: player.id,
        teamId: team.id,
        jerseyNumber,
        createdBy: superUser.id
      }
    });

    await prisma.playerStatistic.upsert({
      where: {
        tournamentId_playerId: {
          tournamentId: tournament.id,
          playerId: player.id
        }
      },
      update: {
        teamId: team.id
      },
      create: {
        tournamentId: tournament.id,
        playerId: player.id,
        teamId: team.id
      }
    });
  }

  for (const team of [halcones, tigres]) {
    await prisma.standing.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId: tournament.id,
          teamId: team.id
        }
      },
      update: {},
      create: {
        tournamentId: tournament.id,
        teamId: team.id
      }
    });

    await prisma.teamStatistic.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId: tournament.id,
          teamId: team.id
        }
      },
      update: {},
      create: {
        tournamentId: tournament.id,
        teamId: team.id
      }
    });
  }

  const field = await prisma.field.upsert({
    where: { name: "Cancha Central" },
    update: {
      isActive: true,
      isDeleted: false
    },
    create: {
      name: "Cancha Central",
      address: "Complejo deportivo demo",
      createdBy: superUser.id
    }
  });

  const round = await prisma.round.upsert({
    where: {
      tournamentId_number: {
        tournamentId: tournament.id,
        number: 1
      }
    },
    update: {
      name: "Fecha 1"
    },
    create: {
      tournamentId: tournament.id,
      name: "Fecha 1",
      number: 1,
      startDate: new Date("2026-08-03T00:00:00.000Z"),
      endDate: new Date("2026-08-09T00:00:00.000Z"),
      createdBy: superUser.id
    }
  });

  const match = await prisma.match.upsert({
    where: { code: "MATCH-DEMO-001" },
    update: {
      tournamentId: tournament.id,
      roundId: round.id,
      fieldId: field.id,
      homeTeamId: halcones.id,
      awayTeamId: tigres.id,
      status: "PROGRAMADO",
      isDeleted: false
    },
    create: {
      code: "MATCH-DEMO-001",
      tournamentId: tournament.id,
      roundId: round.id,
      fieldId: field.id,
      homeTeamId: halcones.id,
      awayTeamId: tigres.id,
      scheduledAt: new Date("2026-08-08T20:00:00.000Z"),
      status: "PROGRAMADO",
      createdBy: superUser.id
    }
  });

  const referee = await prisma.referee.upsert({
    where: { userId: refereeUser.id },
    update: {
      fullName: refereeUser.fullName,
      isActive: true,
      isDeleted: false
    },
    create: {
      userId: refereeUser.id,
      fullName: refereeUser.fullName,
      licenseNumber: "REF-DEMO-001",
      phone: "0999999999",
      createdBy: superUser.id
    }
  });

  const vocal = await prisma.vocal.upsert({
    where: { userId: vocalUser.id },
    update: {
      fullName: vocalUser.fullName,
      isActive: true,
      isDeleted: false
    },
    create: {
      userId: vocalUser.id,
      fullName: vocalUser.fullName,
      phone: "0988888888",
      createdBy: superUser.id
    }
  });

  await prisma.matchReferee.upsert({
    where: {
      matchId_refereeId: {
        matchId: match.id,
        refereeId: referee.id
      }
    },
    update: { role: "PRINCIPAL" },
    create: {
      matchId: match.id,
      refereeId: referee.id,
      role: "PRINCIPAL",
      createdBy: superUser.id
    }
  });

  await prisma.matchVocal.upsert({
    where: {
      matchId_vocalId: {
        matchId: match.id,
        vocalId: vocal.id
      }
    },
    update: { role: "VOCAL" },
    create: {
      matchId: match.id,
      vocalId: vocal.id,
      role: "VOCAL",
      createdBy: superUser.id
    }
  });

  await prisma.vocalia.upsert({
    where: { matchId: match.id },
    update: {
      status: "ABIERTA",
      isDeleted: false
    },
    create: {
      matchId: match.id,
      status: "ABIERTA",
      notes: "Vocalia demo abierta",
      createdBy: superUser.id
    }
  });

  for (const [code, name] of reports) {
    await prisma.report.upsert({
      where: { code },
      update: {
        name,
        isActive: true,
        isDeleted: false
      },
      create: {
        code,
        name,
        description: `Reporte inicial: ${name}`,
        tournamentId: tournament.id,
        createdBy: superUser.id
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      tableName: "seed",
      recordId: tournament.id,
      action: "CREATE",
      newValues: {
        tournament: tournament.code,
        teams: [halcones.code, tigres.code],
        match: match.code
      },
      userId: superUser.id
    }
  });
}

async function main() {
  const securityUsers = await seedSecurity();
  await seedDemoData(securityUsers);
  console.log("Seed inicial completado: seguridad, reportes y datos demo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
