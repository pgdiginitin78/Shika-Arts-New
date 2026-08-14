import axios from "axios";

const PUBLIC_GET_PATHS = [
  "/wp-json/custom/v1/all-categories",
  "/wp-json/custom/v1/home-products",
  "/wp-json/custom/v1/all-products",
  "/wp-json/custom/v1/products-by-parent/",
  "/wp-json/custom/v1/search-products",
];

function isPublicEndpoint(url = "", method = "") {
  if (method.toLowerCase() !== "get") return false;
  return PUBLIC_GET_PATHS.some((path) => url.includes(path));
}

const api = axios.create({
  baseURL: "https://api.shikaarts.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const publicRequest = isPublicEndpoint(config.url, config.method);

  if (publicRequest) {
    delete config.headers.Authorization;
    delete config.headers.authorization;
    config._isPublic = true;
  } else {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const cartToken = localStorage.getItem("cart_token");
  if (cartToken) {
    config.headers["Cart-Token"] = cartToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const incomingCartToken = response.headers?.["cart-token"] || response.headers?.["Cart-Token"];

    if (incomingCartToken) {
      localStorage.setItem("cart_token", incomingCartToken);
    }

    return response;
  },
  (error) => {
    const incomingCartToken =
      error.response?.headers?.["cart-token"] || error.response?.headers?.["Cart-Token"];

    if (incomingCartToken) {
      localStorage.setItem("cart_token", incomingCartToken);
    }

    return Promise.reject(error);
  },
);

let refreshPromise = null;
let scheduledTimer = null;

export function saveTokens(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_expires_at", Date.now() + data.access_token_expires_in * 1000);
  scheduleAutoRefresh(data.access_token_expires_in);
}

export function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}

export function clearCartToken() {
  localStorage.removeItem("cart_token");
}

function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refresh_token = localStorage.getItem("refresh_token");

  if (!refresh_token) {
    clearTokens();
    window.dispatchEvent(new Event("auth-failed"));
    return Promise.reject(new Error("No refresh token available"));
  }

  refreshPromise = axios
    .post(
      "https://api.shikaarts.com/wp-json/custom/v1/refresh-token",
      { refresh_token },
      { withCredentials: true },
    )
    .then(({ data }) => {
      saveTokens(data);
      return data.token;
    })
    .catch((err) => {
      const code = err.response?.data?.code;

      if (code === "refresh_token_in_use") {
        const latestToken = localStorage.getItem("token");
        if (latestToken) {
          return latestToken;
        }
      }

      clearTokens();
      window.dispatchEvent(new Event("auth-failed"));
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function scheduleAutoRefresh(expiresInSeconds) {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  const bufferMs = 2 * 60 * 1000;
  const delay = Math.max(expiresInSeconds * 1000 - bufferMs, 5000);

  scheduledTimer = setTimeout(() => {
    refreshAccessToken().catch(() => {});
  }, delay);
}

export function startTokenAutoRefresh() {
  const token = localStorage.getItem("token");
  const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);

  if (!token) return;

  if (!expiresAt || Date.now() >= expiresAt) {
    refreshAccessToken().catch(() => {});
    return;
  }

  const remainingSeconds = (expiresAt - Date.now()) / 1000;
  scheduleAutoRefresh(remainingSeconds);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?._isPublic) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (originalRequest.url?.includes("refresh-token")) {
        clearTokens();
        window.dispatchEvent(new Event("auth-failed"));
        return Promise.reject(error);
      }

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;