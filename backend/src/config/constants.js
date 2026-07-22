export const ROLES = {
  SUPER_USUARIO: "SUPER_USUARIO",
  ADMIN: "ADMIN",
  ARBITRO: "ARBITRO",
  VOCAL: "VOCAL",
  DELEGADO: "DELEGADO",
  JUGADOR: "JUGADOR",
  PUBLICO: "PUBLICO"
};

export const PUBLIC_AUTH_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh-token",
  "/api/public/onboarding"
];

export const REFRESH_TOKEN_BYTES = 64;
