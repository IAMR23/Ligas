-- Seed SQL de referencia.
-- El seed operativo del proyecto vive en backend/prisma/seed.js porque crea hashes
-- bcrypt y datos relacionales demo de forma idempotente con Prisma.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "roles" ("id", "name", "description", "isSystem", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'SUPER_USUARIO', 'Rol inicial SUPER_USUARIO', true, NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN', 'Rol inicial ADMIN', true, NOW(), NOW()),
  (gen_random_uuid(), 'ARBITRO', 'Rol inicial ARBITRO', true, NOW(), NOW()),
  (gen_random_uuid(), 'VOCAL', 'Rol inicial VOCAL', true, NOW(), NOW()),
  (gen_random_uuid(), 'DELEGADO', 'Rol inicial DELEGADO', true, NOW(), NOW()),
  (gen_random_uuid(), 'JUGADOR', 'Rol inicial JUGADOR', true, NOW(), NOW()),
  (gen_random_uuid(), 'PUBLICO', 'Rol inicial PUBLICO', true, NOW(), NOW())
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "isSystem" = true,
  "isDeleted" = false,
  "deletedAt" = NULL,
  "deletedBy" = NULL,
  "updatedAt" = NOW();

INSERT INTO "permissions" ("id", "code", "description", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'DASHBOARD_READ', 'Permiso DASHBOARD_READ', NOW(), NOW()),
  (gen_random_uuid(), 'TOURNAMENTS_MANAGE', 'Permiso TOURNAMENTS_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'TEAMS_MANAGE', 'Permiso TEAMS_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'PLAYERS_MANAGE', 'Permiso PLAYERS_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'MATCHES_MANAGE', 'Permiso MATCHES_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'MATCH_EVENTS_MANAGE', 'Permiso MATCH_EVENTS_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'REFEREES_MANAGE', 'Permiso REFEREES_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'VOCALIA_MANAGE', 'Permiso VOCALIA_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'SANCTIONS_MANAGE', 'Permiso SANCTIONS_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'STANDINGS_READ', 'Permiso STANDINGS_READ', NOW(), NOW()),
  (gen_random_uuid(), 'REPORTS_READ', 'Permiso REPORTS_READ', NOW(), NOW()),
  (gen_random_uuid(), 'REPORTS_EXPORT', 'Permiso REPORTS_EXPORT', NOW(), NOW()),
  (gen_random_uuid(), 'LOGS_READ', 'Permiso LOGS_READ', NOW(), NOW()),
  (gen_random_uuid(), 'AUDIT_READ', 'Permiso AUDIT_READ', NOW(), NOW()),
  (gen_random_uuid(), 'USERS_MANAGE', 'Permiso USERS_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'ROLES_MANAGE', 'Permiso ROLES_MANAGE', NOW(), NOW()),
  (gen_random_uuid(), 'SYNC_CONFLICTS_MANAGE', 'Permiso SYNC_CONFLICTS_MANAGE', NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt")
SELECT gen_random_uuid(), r."id", p."id", NOW()
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."name" = 'SUPER_USUARIO'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "users" ("id", "fullName", "username", "email", "passwordHash", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Super Usuario',
  'superadmin',
  'superadmin@ligafutbol.com',
  '$2b$12$A7i4k5Xv4Ci9KApW9Ttxgu.GPg7R8xoIASOX7I9t1Wf/Sf9zy76PC',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO UPDATE SET
  "username" = EXCLUDED."username",
  "passwordHash" = EXCLUDED."passwordHash",
  "isActive" = true,
  "isDeleted" = false,
  "deletedAt" = NULL,
  "deletedBy" = NULL,
  "updatedAt" = NOW();

INSERT INTO "user_roles" ("id", "userId", "roleId", "createdAt")
SELECT gen_random_uuid(), u."id", r."id", NOW()
FROM "users" u
JOIN "roles" r ON r."name" = 'SUPER_USUARIO'
WHERE u."email" = 'superadmin@ligafutbol.com'
ON CONFLICT ("userId", "roleId") DO NOTHING;

INSERT INTO "tournaments" ("id", "code", "name", "description", "status", "startDate", "endDate", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'TORNEO-DEMO-2026',
  'Torneo Demo 2026',
  'Torneo base para validar el MVP.',
  'ACTIVO',
  '2026-08-01T00:00:00.000Z',
  '2026-12-15T00:00:00.000Z',
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "status" = EXCLUDED."status",
  "isDeleted" = false,
  "updatedAt" = NOW();

INSERT INTO "reports" ("id", "code", "name", "description", "tournamentId", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), v."code", v."name", 'Reporte inicial: ' || v."name", t."id", true, NOW(), NOW()
FROM (
  VALUES
    ('MATCHES_BY_TOURNAMENT', 'Partidos por torneo'),
    ('GOALS_BY_PLAYER', 'Goles por jugador'),
    ('GOALS_BY_TEAM', 'Goles por equipo'),
    ('CARDS', 'Tarjetas'),
    ('SANCTIONS', 'Sanciones'),
    ('STANDINGS', 'Tabla de posiciones'),
    ('VOCALIAS', 'Vocalias'),
    ('REFEREEING', 'Arbitraje'),
    ('LOGIN_LOGS', 'Logs de ingreso'),
    ('AUDIT', 'Auditoria')
) AS v("code", "name")
CROSS JOIN "tournaments" t
WHERE t."code" = 'TORNEO-DEMO-2026'
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "isActive" = true,
  "isDeleted" = false,
  "updatedAt" = NOW();
