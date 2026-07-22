const ACCESS_TOKEN_KEY = "liga_futbol_access_token";
const REFRESH_TOKEN_KEY = "liga_futbol_refresh_token";
const USER_KEY = "liga_futbol_user";

export function getStoredSession() {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  return {
    accessToken,
    refreshToken,
    user: rawUser ? JSON.parse(rawUser) : null
  };
}

export function storeSession({ accessToken, refreshToken, user }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
