import axios from "axios";
import { clearStoredSession, getStoredSession, storeSession } from "../auth/authStorage";
import { httpClient } from "./httpClient";

let refreshPromise = null;
let isInstalled = false;
let sessionCallbacks = {};

export function installAuthInterceptor({ onSessionRefreshed, onSessionExpired } = {}) {
  sessionCallbacks = { onSessionRefreshed, onSessionExpired };

  if (isInstalled) {
    return;
  }

  isInstalled = true;

  httpClient.interceptors.request.use((config) => {
    const { accessToken } = getStoredSession();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || originalRequest?._retry) {
        return Promise.reject(error);
      }

      const { refreshToken } = getStoredSession();

      if (!refreshToken) {
        clearStoredSession();
        sessionCallbacks.onSessionExpired?.();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ||
          axios.post(`${httpClient.defaults.baseURL}/auth/refresh-token`, {
            refreshToken
          });

        const response = await refreshPromise;
        const nextSession = response.data.data;

        storeSession(nextSession);
        sessionCallbacks.onSessionRefreshed?.(nextSession);
        originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;

        return httpClient(originalRequest);
      } catch (refreshError) {
        clearStoredSession();
        sessionCallbacks.onSessionExpired?.();
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }
  );
}
