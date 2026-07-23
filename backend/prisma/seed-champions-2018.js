import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tournamentSeed = {
  code: "UCL-2018",
  name: "Champions League 2018",
  description: "UEFA Champions League temporada 2017-2018, final ganada por Real Madrid.",
  status: "FINALIZADO",
  startDate: new Date("2017-09-12T00:00:00.000Z"),
  endDate: new Date("2018-05-26T00:00:00.000Z")
};

const teamsSeed = [
  { code: "UCL18-RMA", name: "Real Madrid", colorPrimary: "#ffffff", colorAccent: "#dc2626" },
  { code: "UCL18-FCB", name: "FC Barcelona", colorPrimary: "#111111", colorAccent: "#dc2626" },
  { code: "UCL18-JUV", name: "Juventus", colorPrimary: "#111111", colorAccent: "#ffffff" },
  { code: "UCL18-BAY", name: "Bayern Munich", colorPrimary: "#dc2626", colorAccent: "#111111" },
  { code: "UCL18-PSG", name: "Paris Saint-Germain", colorPrimary: "#111111", colorAccent: "#dc2626" },
  { code: "UCL18-LIV", name: "Liverpool", colorPrimary: "#dc2626", colorAccent: "#111111" },
  { code: "UCL18-MCI", name: "Manchester City", colorPrimary: "#111111", colorAccent: "#dc2626" },
  { code: "UCL18-MUN", name: "Manchester United", colorPrimary: "#dc2626", colorAccent: "#111111" },
  { code: "UCL18-CHE", name: "Chelsea", colorPrimary: "#111111", colorAccent: "#dc2626" },
  { code: "UCL18-ROM", name: "Roma", colorPrimary: "#dc2626", colorAccent: "#111111" }
];

const playersSeed = [
  { documentNumber: "UCL18-CR7", fullName: "Cristiano Ronaldo", teamCode: "UCL18-RMA", jerseyName: "RONALDO", jerseyNumber: 7, birthDate: "1985-02-05" },
  { documentNumber: "UCL18-RAMOS", fullName: "Sergio Ramos", teamCode: "UCL18-RMA", jerseyName: "RAMOS", jerseyNumber: 4, birthDate: "1986-03-30" },
  { documentNumber: "UCL18-MODRIC", fullName: "Luka Modric", teamCode: "UCL18-RMA", jerseyName: "MODRIC", jerseyNumber: 10, birthDate: "1985-09-09" },
  { documentNumber: "UCL18-MESSI", fullName: "Lionel Messi", teamCode: "UCL18-FCB", jerseyName: "MESSI", jerseyNumber: 10, birthDate: "1987-06-24" },
  { documentNumber: "UCL18-SUAREZ", fullName: "Luis Suarez", teamCode: "UCL18-FCB", jerseyName: "SUAREZ", jerseyNumber: 9, birthDate: "1987-01-24" },
  { documentNumber: "UCL18-PIQUE", fullName: "Gerard Pique", teamCode: "UCL18-FCB", jerseyName: "PIQUE", jerseyNumber: 3, birthDate: "1987-02-02" },
  { documentNumber: "UCL18-BUFFON", fullName: "Gianluigi Buffon", teamCode: "UCL18-JUV", jerseyName: "BUFFON", jerseyNumber: 1, birthDate: "1978-01-28" },
  { documentNumber: "UCL18-DYBALA", fullName: "Paulo Dybala", teamCode: "UCL18-JUV", jerseyName: "DYBALA", jerseyNumber: 10, birthDate: "1993-11-15" },
  { documentNumber: "UCL18-CHIELLINI", fullName: "Giorgio Chiellini", teamCode: "UCL18-JUV", jerseyName: "CHIELLINI", jerseyNumber: 3, birthDate: "1984-08-14" },
  { documentNumber: "UCL18-LEWA", fullName: "Robert Lewandowski", teamCode: "UCL18-BAY", jerseyName: "LEWANDOWSKI", jerseyNumber: 9, birthDate: "1988-08-21" },
  { documentNumber: "UCL18-MULLER", fullName: "Thomas Muller", teamCode: "UCL18-BAY", jerseyName: "MULLER", jerseyNumber: 25, birthDate: "1989-09-13" },
  { documentNumber: "UCL18-NEUER", fullName: "Manuel Neuer", teamCode: "UCL18-BAY", jerseyName: "NEUER", jerseyNumber: 1, birthDate: "1986-03-27" },
  { documentNumber: "UCL18-NEYMAR", fullName: "Neymar Jr", teamCode: "UCL18-PSG", jerseyName: "NEYMAR", jerseyNumber: 10, birthDate: "1992-02-05" },
  { documentNumber: "UCL18-MBAPPE", fullName: "Kylian Mbappe", teamCode: "UCL18-PSG", jerseyName: "MBAPPE", jerseyNumber: 29, birthDate: "1998-12-20" },
  { documentNumber: "UCL18-CAVANI", fullName: "Edinson Cavani", teamCode: "UCL18-PSG", jerseyName: "CAVANI", jerseyNumber: 9, birthDate: "1987-02-14" },
  { documentNumber: "UCL18-SALAH", fullName: "Mohamed Salah", teamCode: "UCL18-LIV", jerseyName: "SALAH", jerseyNumber: 11, birthDate: "1992-06-15" },
  { documentNumber: "UCL18-MANE", fullName: "Sadio Mane", teamCode: "UCL18-LIV", jerseyName: "MANE", jerseyNumber: 19, birthDate: "1992-04-10" },
  { documentNumber: "UCL18-FIRMINO", fullName: "Roberto Firmino", teamCode: "UCL18-LIV", jerseyName: "FIRMINO", jerseyNumber: 9, birthDate: "1991-10-02" },
  { documentNumber: "UCL18-KDB", fullName: "Kevin De Bruyne", teamCode: "UCL18-MCI", jerseyName: "DE BRUYNE", jerseyNumber: 17, birthDate: "1991-06-28" },
  { documentNumber: "UCL18-AGUERO", fullName: "Sergio Aguero", teamCode: "UCL18-MCI", jerseyName: "AGUERO", jerseyNumber: 10, birthDate: "1988-06-02" },
  { documentNumber: "UCL18-SILVA", fullName: "David Silva", teamCode: "UCL18-MCI", jerseyName: "SILVA", jerseyNumber: 21, birthDate: "1986-01-08" },
  { documentNumber: "UCL18-POGBA", fullName: "Paul Pogba", teamCode: "UCL18-MUN", jerseyName: "POGBA", jerseyNumber: 6, birthDate: "1993-03-15" },
  { documentNumber: "UCL18-HAZARD", fullName: "Eden Hazard", teamCode: "UCL18-CHE", jerseyName: "HAZARD", jerseyNumber: 10, birthDate: "1991-01-07" },
  { documentNumber: "UCL18-DZEKO", fullName: "Edin Dzeko", teamCode: "UCL18-ROM", jerseyName: "DZEKO", jerseyNumber: 9, birthDate: "1986-03-17" }
];

async function getSeedUserId() {
  const username = process.env.SUPER_USER_USERNAME || "superadmin";
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email: process.env.SUPER_USER_EMAIL || "superadmin@ligafutbol.com" }
      ],
      isDeleted: false
    }
  });

  return user?.id;
}

async function seedChampions2018() {
  const createdBy = await getSeedUserId();
  let createdTeams = 0;
  let createdPlayers = 0;

  const tournament = await prisma.tournament.upsert({
    where: { code: tournamentSeed.code },
    update: {
      ...tournamentSeed,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      updatedBy: createdBy
    },
    create: {
      ...tournamentSeed,
      createdBy
    }
  });

  const teamByCode = new Map();

  for (const teamSeed of teamsSeed) {
    const existing = await prisma.team.findUnique({ where: { code: teamSeed.code } });
    const team = await prisma.team.upsert({
      where: { code: teamSeed.code },
      update: {
        ...teamSeed,
        tournamentId: tournament.id,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedBy: createdBy
      },
      create: {
        ...teamSeed,
        tournamentId: tournament.id,
        createdBy
      }
    });

    if (!existing) {
      createdTeams += 1;
    }

    teamByCode.set(team.code, team);

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

  for (const playerSeed of playersSeed) {
    const team = teamByCode.get(playerSeed.teamCode);
    const existing = await prisma.player.findUnique({
      where: { documentNumber: playerSeed.documentNumber }
    });
    const player = await prisma.player.upsert({
      where: { documentNumber: playerSeed.documentNumber },
      update: {
        fullName: playerSeed.fullName,
        birthDate: new Date(`${playerSeed.birthDate}T00:00:00.000Z`),
        jerseyName: playerSeed.jerseyName,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedBy: createdBy
      },
      create: {
        documentNumber: playerSeed.documentNumber,
        fullName: playerSeed.fullName,
        birthDate: new Date(`${playerSeed.birthDate}T00:00:00.000Z`),
        jerseyName: playerSeed.jerseyName,
        createdBy
      }
    });

    if (!existing) {
      createdPlayers += 1;
    }

    await prisma.playerTeam.upsert({
      where: {
        playerId_teamId: {
          playerId: player.id,
          teamId: team.id
        }
      },
      update: {
        jerseyNumber: playerSeed.jerseyNumber,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedBy: createdBy
      },
      create: {
        playerId: player.id,
        teamId: team.id,
        jerseyNumber: playerSeed.jerseyNumber,
        createdBy
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

  await prisma.auditLog.create({
    data: {
      tableName: "seed",
      recordId: tournament.id,
      action: "CREATE",
      newValues: {
        tournament: tournament.code,
        teams: teamsSeed.map((team) => team.code),
        players: playersSeed.map((player) => player.documentNumber)
      },
      userId: createdBy
    }
  });

  return {
    tournament,
    createdTeams,
    createdPlayers,
    totalTeams: teamsSeed.length,
    totalPlayers: playersSeed.length
  };
}

seedChampions2018()
  .then((result) => {
    console.log(
      `Seed Champions 2018 completado: ${result.tournament.name}, equipos=${result.totalTeams}, jugadores=${result.totalPlayers}, nuevosEquipos=${result.createdTeams}, nuevosJugadores=${result.createdPlayers}.`
    );
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
