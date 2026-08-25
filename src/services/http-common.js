import axios from "axios";

const REFRESH_BUFFER_MS = 10 * 60 * 1000;

export const publicApi = axios.create({
  baseURL: "https://api.shikaarts.com",
  withCredentials: false,
  timeout: 15000,
});

const api = axios.create({
  baseURL: "https://api.shikaarts.com",
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;
let scheduledTimer = null;

export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isValidAppToken(token) {
  if (!token || typeof token !== "string") return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;
  if (payload.iss === "store-api") return false;
  const exp = Number(payload.exp);
  if (!Number.isFinite(exp)) return false;
  return true;
}

export function saveTokens(data) {
  if (!data?.token || !data?.refresh_token) {
    throw new Error("Invalid token response");
  }

  const expiresInSeconds = Number(data.access_token_expires_in);

  if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new Error("Invalid access_token_expires_in");
  }

  const expiresAt = Date.now() + expiresInSeconds * 1000;

  localStorage.setItem("token", data.token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_expires_at", String(expiresAt));

  scheduleAutoRefresh(expiresAt);
}

export function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");

  localStorage.removeItem("cart_token");
  localStorage.removeItem("wc_token");
  localStorage.removeItem("user");
  localStorage.removeItem("customerData");
  localStorage.removeItem("shika-customer-auth");

  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}

export function clearCartToken() {
  localStorage.removeItem("cart_token");
}

export function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    clearTokens();
    window.dispatchEvent(new Event("auth-failed"));
    return Promise.reject(new Error("No refresh token available"));
  }

  if (import.meta.env.DEV) {
    console.log("[AUTH] Refresh started");
  }

  refreshPromise = axios
    .post(
      "https://api.shikaarts.com/wp-json/custom/v1/refresh-token",
      {
        refresh_token: refreshToken,
      },
      {
        withCredentials: true,
        timeout: 15000,
        headers: { "Content-Type": "application/json" },
      },
    )
    .then(({ data }) => {
      saveTokens(data);
      if (import.meta.env.DEV) {
        console.log("[AUTH] Refresh completed successfully");
      }
      return data.token;
    })
    .catch((error) => {
      const code = error.response?.data?.code;
      if (import.meta.env.DEV) {
        console.warn("[AUTH] Refresh failed with code:", code || error.message);
      }

      if (code === "refresh_token_in_use") {
        const latestToken = localStorage.getItem("token");
        const latestExpiresAt = Number(localStorage.getItem("token_expires_at") || 0);

        if (latestToken && latestExpiresAt > Date.now() && isValidAppToken(latestToken)) {
          scheduleAutoRefresh(latestExpiresAt);
          return latestToken;
        }
      }

      clearTokens();
      window.dispatchEvent(new Event("auth-failed"));
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function isTokenExpiringSoon() {
  const token = localStorage.getItem("token");

  if (!token) {
    return true;
  }

  if (!isValidAppToken(token)) {
    return true;
  }

  const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);

  if (!expiresAt) {
    const payload = parseJwtPayload(token);
    if (payload?.exp) {
      return payload.exp * 1000 - Date.now() <= REFRESH_BUFFER_MS;
    }
    return true;
  }

  return expiresAt - Date.now() <= REFRESH_BUFFER_MS;
}

async function ensureValidAccessToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  if (isTokenExpiringSoon()) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        return await refreshAccessToken();
      } catch {
        return null;
      }
    } else {
      clearTokens();
      return null;
    }
  }

  return token;
}

function scheduleAutoRefresh(expiresAt) {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  const refreshAt = Number(expiresAt) - REFRESH_BUFFER_MS;
  const delay = Math.max(refreshAt - Date.now(), 5000);

  scheduledTimer = setTimeout(() => {
    scheduledTimer = null;
    refreshAccessToken().catch(() => {});
  }, delay);
}

export function startTokenAutoRefresh() {
  const token = localStorage.getItem("token");

  if (!token || !isValidAppToken(token)) {
    return;
  }

  const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);

  if (!expiresAt) {
    refreshAccessToken().catch(() => {});
    return;
  }

  if (expiresAt - Date.now() <= REFRESH_BUFFER_MS) {
    refreshAccessToken().catch(() => {});
    return;
  }

  scheduleAutoRefresh(expiresAt);
}

api.interceptors.request.use(
  async (config) => {
    const isWcStoreRoute = config.url?.includes("/wc/store/");

    if (!isWcStoreRoute) {
      const token = await ensureValidAccessToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token.trim()}`;
        config.headers["Cache-Control"] = "no-cache";
        config.headers["Pragma"] = "no-cache";

        if (import.meta.env.DEV) {
          const payload = parseJwtPayload(token);
          console.log("[AUTH] Request:", {
            url: config.url,
            method: config.method?.toUpperCase(),
            tokenPresent: true,
            tokenLength: token.length,
            exp: payload?.exp,
            iat: payload?.iat,
            iss: payload?.iss,
            userId: payload?.data?.user?.id || payload?.user_id,
          });
        }
      } else {
        if (config.headers?.Authorization) {
          delete config.headers.Authorization;
        }
      }
    }

    const cartToken = localStorage.getItem("cart_token");

    if (cartToken) {
      config.headers["Cart-Token"] = cartToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const incomingCartToken = response.headers?.["cart-token"] || response.headers?.["Cart-Token"];

    if (incomingCartToken && localStorage.getItem("token")) {
      localStorage.setItem("cart_token", incomingCartToken);
    }

    return response;
  },
  (error) => {
    const incomingCartToken =
      error.response?.headers?.["cart-token"] || error.response?.headers?.["Cart-Token"];

    if (incomingCartToken && localStorage.getItem("token")) {
      localStorage.setItem("cart_token", incomingCartToken);
    }

    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/refresh-token")) {
      clearTokens();
      window.dispatchEvent(new Event("auth-failed"));
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const code = error.response?.data?.code;
    const hadToken = !!originalRequest.headers?.Authorization;

    const isAuthError =
      status === 401 ||
      (status === 403 &&
        (code === "jwt_auth_invalid_token" ||
          code === "jwt_auth_bad_auth_header" ||
          (code === "rest_forbidden" && hadToken)));

    if (isAuthError && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        originalRequest._retry = true;

        if (import.meta.env.DEV) {
          console.log(
            `[AUTH] Auth error (${code || status}), attempting token refresh and retry`,
          );
        }

        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken.trim()}`;
          return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        window.dispatchEvent(new Event("auth-failed"));
      }
    }

    return Promise.reject(error);
  },
);

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      startTokenAutoRefresh();
    }
  });

  window.addEventListener("focus", () => {
    startTokenAutoRefresh();
  });
}

export default api;
