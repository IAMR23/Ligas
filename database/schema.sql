-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT_PDF', 'EXPORT_EXCEL', 'SYNC', 'ERROR');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('BORRADOR', 'ACTIVO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'SUSPENDIDO', 'CANCELADO', 'DEFAULT');

-- CreateEnum
CREATE TYPE "MatchEventType" AS ENUM ('PARTIDO_INICIADO', 'PARTIDO_FINALIZADO', 'GOL', 'AUTOGOL', 'GOL_PENAL', 'TARJETA_AMARILLA', 'TARJETA_ROJA', 'SUSTITUCION', 'LESION', 'SUSPENSION_PARTIDO', 'REANUDACION_PARTIDO', 'PARTIDO_CANCELADO', 'PARTIDO_DEFAULT', 'OBSERVACION_ARBITRO', 'OBSERVACION_VOCAL', 'FIRMA_DELEGADO', 'FIRMA_ARBITRO', 'FIRMA_VOCAL');

-- CreateEnum
CREATE TYPE "VocaliaStatus" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "SanctionStatus" AS ENUM ('ACTIVA', 'CUMPLIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDIENTE', 'PAGADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDIENTE', 'ENVIANDO', 'SINCRONIZADO', 'ERROR', 'CONFLICTO');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('NO_LEIDA', 'LEIDA');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "TournamentStatus" NOT NULL DEFAULT 'BORRADOR',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "tournamentId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "categoryId" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorPrimary" TEXT,
    "colorAccent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "documentNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "jerseyName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_teams" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "jerseyNumber" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "player_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "tournamentId" UUID NOT NULL,
    "roundId" UUID,
    "fieldId" UUID,
    "homeTeamId" UUID NOT NULL,
    "awayTeamId" UUID NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "teamId" UUID,
    "playerId" UUID,
    "secondaryPlayerId" UUID,
    "clientEventId" TEXT NOT NULL,
    "type" "MatchEventType" NOT NULL,
    "minute" INTEGER,
    "payload" JSONB,
    "notes" TEXT,
    "correctedAt" TIMESTAMP(3),
    "correctedBy" UUID,
    "isVoided" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referees" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "fullName" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "referees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocals" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vocals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_referees" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "refereeId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PRINCIPAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,

    CONSTRAINT "match_referees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_vocals" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "vocalId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VOCAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,

    CONSTRAINT "match_vocals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocalias" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "status" "VocaliaStatus" NOT NULL DEFAULT 'ABIERTA',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vocalias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocalia_details" (
    "id" UUID NOT NULL,
    "vocaliaId" UUID NOT NULL,
    "concept" TEXT NOT NULL,
    "value" TEXT,
    "amount" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "vocalia_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocalia_signatures" (
    "id" UUID NOT NULL,
    "vocaliaId" UUID NOT NULL,
    "signedByUserId" UUID,
    "role" TEXT NOT NULL,
    "fullName" TEXT,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,

    CONSTRAINT "vocalia_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanctions" (
    "id" UUID NOT NULL,
    "tournamentId" UUID,
    "matchId" UUID,
    "matchEventId" UUID,
    "playerId" UUID,
    "teamId" UUID,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "games" INTEGER NOT NULL DEFAULT 0,
    "amount" DECIMAL(10,2),
    "status" "SanctionStatus" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sanctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "tournamentId" UUID,
    "teamId" UUID,
    "playerId" UUID,
    "concept" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "paidAt" TIMESTAMP(3),
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standings" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDiff" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_statistics" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "teamId" UUID,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "ownGoals" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_statistics" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "cleanSheets" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tournamentId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_executions" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "userId" UUID,
    "format" "ReportFormat" NOT NULL,
    "filters" JSONB,
    "filePath" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "action" "AuditAction" NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" UUID,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "traceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_login_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "username" TEXT,
    "email" TEXT,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "clientEventId" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDIENTE',
    "payload" JSONB,
    "response" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3),

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_conflicts" (
    "id" UUID NOT NULL,
    "syncLogId" UUID,
    "clientEventId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "localPayload" JSONB,
    "serverPayload" JSONB,
    "status" "SyncStatus" NOT NULL DEFAULT 'CONFLICTO',
    "resolution" TEXT,
    "resolvedBy" UUID,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'NO_LEIDA',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_tokenHash_idx" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_code_key" ON "tournaments"("code");

-- CreateIndex
CREATE INDEX "tournaments_status_idx" ON "tournaments"("status");

-- CreateIndex
CREATE INDEX "categories_tournamentId_idx" ON "categories"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tournamentId_name_key" ON "categories"("tournamentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_code_key" ON "teams"("code");

-- CreateIndex
CREATE INDEX "teams_tournamentId_idx" ON "teams"("tournamentId");

-- CreateIndex
CREATE INDEX "teams_categoryId_idx" ON "teams"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "players_documentNumber_key" ON "players"("documentNumber");

-- CreateIndex
CREATE INDEX "players_fullName_idx" ON "players"("fullName");

-- CreateIndex
CREATE INDEX "player_teams_playerId_idx" ON "player_teams"("playerId");

-- CreateIndex
CREATE INDEX "player_teams_teamId_idx" ON "player_teams"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "player_teams_playerId_teamId_key" ON "player_teams"("playerId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "fields_name_key" ON "fields"("name");

-- CreateIndex
CREATE INDEX "rounds_tournamentId_idx" ON "rounds"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_tournamentId_number_key" ON "rounds"("tournamentId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "matches_code_key" ON "matches"("code");

-- CreateIndex
CREATE INDEX "matches_tournamentId_idx" ON "matches"("tournamentId");

-- CreateIndex
CREATE INDEX "matches_roundId_idx" ON "matches"("roundId");

-- CreateIndex
CREATE INDEX "matches_fieldId_idx" ON "matches"("fieldId");

-- CreateIndex
CREATE INDEX "matches_homeTeamId_idx" ON "matches"("homeTeamId");

-- CreateIndex
CREATE INDEX "matches_awayTeamId_idx" ON "matches"("awayTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "match_events_clientEventId_key" ON "match_events"("clientEventId");

-- CreateIndex
CREATE INDEX "match_events_matchId_idx" ON "match_events"("matchId");

-- CreateIndex
CREATE INDEX "match_events_clientEventId_idx" ON "match_events"("clientEventId");

-- CreateIndex
CREATE INDEX "match_events_teamId_idx" ON "match_events"("teamId");

-- CreateIndex
CREATE INDEX "match_events_playerId_idx" ON "match_events"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "referees_userId_key" ON "referees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "referees_licenseNumber_key" ON "referees"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vocals_userId_key" ON "vocals"("userId");

-- CreateIndex
CREATE INDEX "match_referees_matchId_idx" ON "match_referees"("matchId");

-- CreateIndex
CREATE INDEX "match_referees_refereeId_idx" ON "match_referees"("refereeId");

-- CreateIndex
CREATE UNIQUE INDEX "match_referees_matchId_refereeId_key" ON "match_referees"("matchId", "refereeId");

-- CreateIndex
CREATE INDEX "match_vocals_matchId_idx" ON "match_vocals"("matchId");

-- CreateIndex
CREATE INDEX "match_vocals_vocalId_idx" ON "match_vocals"("vocalId");

-- CreateIndex
CREATE UNIQUE INDEX "match_vocals_matchId_vocalId_key" ON "match_vocals"("matchId", "vocalId");

-- CreateIndex
CREATE UNIQUE INDEX "vocalias_matchId_key" ON "vocalias"("matchId");

-- CreateIndex
CREATE INDEX "vocalia_details_vocaliaId_idx" ON "vocalia_details"("vocaliaId");

-- CreateIndex
CREATE INDEX "vocalia_signatures_vocaliaId_idx" ON "vocalia_signatures"("vocaliaId");

-- CreateIndex
CREATE INDEX "vocalia_signatures_signedByUserId_idx" ON "vocalia_signatures"("signedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "sanctions_matchEventId_key" ON "sanctions"("matchEventId");

-- CreateIndex
CREATE INDEX "sanctions_tournamentId_idx" ON "sanctions"("tournamentId");

-- CreateIndex
CREATE INDEX "sanctions_playerId_idx" ON "sanctions"("playerId");

-- CreateIndex
CREATE INDEX "sanctions_teamId_idx" ON "sanctions"("teamId");

-- CreateIndex
CREATE INDEX "payments_tournamentId_idx" ON "payments"("tournamentId");

-- CreateIndex
CREATE INDEX "payments_teamId_idx" ON "payments"("teamId");

-- CreateIndex
CREATE INDEX "payments_playerId_idx" ON "payments"("playerId");

-- CreateIndex
CREATE INDEX "standings_tournamentId_idx" ON "standings"("tournamentId");

-- CreateIndex
CREATE INDEX "standings_teamId_idx" ON "standings"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "standings_tournamentId_teamId_key" ON "standings"("tournamentId", "teamId");

-- CreateIndex
CREATE INDEX "player_statistics_tournamentId_idx" ON "player_statistics"("tournamentId");

-- CreateIndex
CREATE INDEX "player_statistics_playerId_idx" ON "player_statistics"("playerId");

-- CreateIndex
CREATE INDEX "player_statistics_teamId_idx" ON "player_statistics"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "player_statistics_tournamentId_playerId_key" ON "player_statistics"("tournamentId", "playerId");

-- CreateIndex
CREATE INDEX "team_statistics_tournamentId_idx" ON "team_statistics"("tournamentId");

-- CreateIndex
CREATE INDEX "team_statistics_teamId_idx" ON "team_statistics"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_statistics_tournamentId_teamId_key" ON "team_statistics"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_code_key" ON "reports"("code");

-- CreateIndex
CREATE INDEX "reports_tournamentId_idx" ON "reports"("tournamentId");

-- CreateIndex
CREATE INDEX "report_executions_reportId_idx" ON "report_executions"("reportId");

-- CreateIndex
CREATE INDEX "report_executions_userId_idx" ON "report_executions"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_idx" ON "audit_logs"("tableName");

-- CreateIndex
CREATE INDEX "user_login_logs_userId_idx" ON "user_login_logs"("userId");

-- CreateIndex
CREATE INDEX "user_login_logs_email_idx" ON "user_login_logs"("email");

-- CreateIndex
CREATE INDEX "user_login_logs_username_idx" ON "user_login_logs"("username");

-- CreateIndex
CREATE INDEX "sync_logs_userId_idx" ON "sync_logs"("userId");

-- CreateIndex
CREATE INDEX "sync_logs_clientEventId_idx" ON "sync_logs"("clientEventId");

-- CreateIndex
CREATE INDEX "sync_logs_status_idx" ON "sync_logs"("status");

-- CreateIndex
CREATE INDEX "sync_conflicts_syncLogId_idx" ON "sync_conflicts"("syncLogId");

-- CreateIndex
CREATE INDEX "sync_conflicts_clientEventId_idx" ON "sync_conflicts"("clientEventId");

-- CreateIndex
CREATE INDEX "sync_conflicts_resolvedBy_idx" ON "sync_conflicts"("resolvedBy");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_teams" ADD CONSTRAINT "player_teams_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_teams" ADD CONSTRAINT "player_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_secondaryPlayerId_fkey" FOREIGN KEY ("secondaryPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referees" ADD CONSTRAINT "referees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocals" ADD CONSTRAINT "vocals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_referees" ADD CONSTRAINT "match_referees_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_referees" ADD CONSTRAINT "match_referees_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "referees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_vocals" ADD CONSTRAINT "match_vocals_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_vocals" ADD CONSTRAINT "match_vocals_vocalId_fkey" FOREIGN KEY ("vocalId") REFERENCES "vocals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocalias" ADD CONSTRAINT "vocalias_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocalia_details" ADD CONSTRAINT "vocalia_details_vocaliaId_fkey" FOREIGN KEY ("vocaliaId") REFERENCES "vocalias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocalia_signatures" ADD CONSTRAINT "vocalia_signatures_vocaliaId_fkey" FOREIGN KEY ("vocaliaId") REFERENCES "vocalias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocalia_signatures" ADD CONSTRAINT "vocalia_signatures_signedByUserId_fkey" FOREIGN KEY ("signedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_matchEventId_fkey" FOREIGN KEY ("matchEventId") REFERENCES "match_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_statistics" ADD CONSTRAINT "player_statistics_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_statistics" ADD CONSTRAINT "player_statistics_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_statistics" ADD CONSTRAINT "player_statistics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_statistics" ADD CONSTRAINT "team_statistics_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_statistics" ADD CONSTRAINT "team_statistics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_login_logs" ADD CONSTRAINT "user_login_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_conflicts" ADD CONSTRAINT "sync_conflicts_syncLogId_fkey" FOREIGN KEY ("syncLogId") REFERENCES "sync_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_conflicts" ADD CONSTRAINT "sync_conflicts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

