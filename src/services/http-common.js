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

  // Send JWT for all custom/WooCommerce requests
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Send Cart Token for Store API
  if (cartToken) {
    config.headers["Cart-Token"] = cartToken;
  }

  return config;
});

export default api;