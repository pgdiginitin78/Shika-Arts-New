import axios from "axios";

const api = axios.create({
  baseURL: "https://tan-cattle-873141.hostingersite.com",
   withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  const protectedUrls = ["/wp-json/wp/v2/users/me"];

  const needsAuth = protectedUrls.some((url) => config.url?.includes(url));

  if (token && needsAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
