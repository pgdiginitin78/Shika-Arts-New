import axios from "axios";

const api = axios.create({
  baseURL: "https://api.shikaarts.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const cartToken = localStorage.getItem("cart_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (cartToken) {
    config.headers["Cart-Token"] = cartToken;
  }

  return config;
});

let refreshPromise = null;
let scheduledTimer = null;

function saveTokens(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_expires_at", Date.now() + data.access_token_expires_in * 1000);
  scheduleAutoRefresh(data.access_token_expires_in);
}

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}

function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refresh_token = localStorage.getItem("refresh_token");

  if (!refresh_token) {
    clearTokens();
    window.location.href = "/login";
    return Promise.reject(new Error("No refresh token available"));
  }

  refreshPromise = axios
    .post("https://api.shikaarts.com/wp-json/custom/v1/refresh-token", {
      refresh_token,
    })
    .then(({ data }) => {
      saveTokens(data);
      return data.token;
    })
    .catch((err) => {
      clearTokens();
      window.location.href = "/login";
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

  const bufferMs = 2 * 60 * 1000; // 2 minutes
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

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
