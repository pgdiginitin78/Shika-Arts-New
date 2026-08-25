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
  localStorage.removeItem("shika-wishlist");
  localStorage.removeItem("shika_cart_items");

  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}

export function clearCartToken() {
  localStorage.removeItem("cart_token");
}

function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    clearTokens();

    window.dispatchEvent(new Event("auth-failed"));

    return Promise.reject(new Error("No refresh token available"));
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
      },
    )
    .then(({ data }) => {
      saveTokens(data);
      return data.token;
    })
    .catch((error) => {
      const code = error.response?.data?.code;

      if (code === "refresh_token_in_use") {
        const latestToken = localStorage.getItem("token");
        const latestExpiresAt = Number(localStorage.getItem("token_expires_at") || 0);

        if (latestToken && latestExpiresAt > Date.now()) {
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

  const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);

  if (!expiresAt) {
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
    return refreshAccessToken();
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

  if (!token) {
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
        config.headers.Authorization = `Bearer ${token}`;
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      const code = error.response?.data?.code;
      const hadToken = !!originalRequest.headers?.Authorization;

      if (
        code === "jwt_auth_invalid_token" ||
        code === "jwt_auth_bad_auth_header" ||
        (code === "rest_forbidden" && hadToken)
      ) {
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
