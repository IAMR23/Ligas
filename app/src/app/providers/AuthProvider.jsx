import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { installAuthInterceptor } from "../../shared/api/authInterceptor";
import { httpClient } from "../../shared/api/httpClient";
import { clearStoredSession, getStoredSession, storeSession } from "../../shared/auth/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());
  const [status, setStatus] = useState(() => (getStoredSession().accessToken ? "authenticated" : "guest"));

  useEffect(() => {
    installAuthInterceptor({
      onSessionRefreshed: (nextSession) => {
        setSession(nextSession);
        setStatus("authenticated");
      },
      onSessionExpired: () => {
        setSession({ accessToken: null, refreshToken: null, user: null });
        setStatus("guest");
      }
    });
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    setStatus("loading");
    const response = await httpClient.post("/auth/login", { identifier, password });
    const nextSession = response.data.data;

    storeSession(nextSession);
    setSession(nextSession);
    setStatus("authenticated");

    return nextSession;
  }, []);

  const register = useCallback(async (payload) => {
    setStatus("loading");
    const response = await httpClient.post("/auth/register", payload);
    const nextSession = response.data.data;

    storeSession(nextSession);
    setSession(nextSession);
    setStatus("authenticated");

    return nextSession;
  }, []);

  const requestPasswordReset = useCallback(async ({ email }) => {
    const response = await httpClient.post("/auth/forgot-password", { email });
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = session.refreshToken;

    try {
      if (refreshToken) {
        await httpClient.post("/auth/logout", { refreshToken });
      }
    } finally {
      clearStoredSession();
      setSession({ accessToken: null, refreshToken: null, user: null });
      setStatus("guest");
    }
  }, [session.refreshToken]);

  const value = useMemo(
    () => ({
      ...session,
      status,
      isAuthenticated: Boolean(session.accessToken),
      roles: session.user?.roles || [],
      login,
      logout,
      register,
      requestPasswordReset
    }),
    [login, logout, register, requestPasswordReset, session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
