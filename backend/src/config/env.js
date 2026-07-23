import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  jwtExpiresMinutes: Number(process.env.JWT_EXPIRES_MINUTES || 120),
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7),
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim()),
  reportsStoragePath: process.env.REPORTS_STORAGE_PATH || "./storage/reports",
  superUserEmail: process.env.SUPER_USER_EMAIL || "superadmin@ligafutbol.com",
  superUserUsername: process.env.SUPER_USER_USERNAME || "superadmin",
  superUserPassword: process.env.SUPER_USER_PASSWORD || "ChangeMe123"
};
