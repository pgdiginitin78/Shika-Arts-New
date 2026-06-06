import api from "./http-common";

export const customerLogin = async (username, password) => {
  const { data } = await api.post("/wp-json/jwt-auth/v1/token", {
    username,
    password,
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  localStorage.setItem("customerData", JSON.stringify(data));
  return data;
};

export const registerCustomer = async (payload) => {
  const { data } = await api.post("/wp-json/custom/v1/register", payload);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("customerData");
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/wp-json/wp/v2/users/me");

  return data;
};

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/wp-json/wc/store/v1/products", {
    params,
  });

  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/wp-json/wc/store/v1/products/${id}`);

  return data;
};

export const searchProducts = async (search) => {
  const { data } = await api.get("/wp-json/wc/store/v1/products", {
    params: {
      search,
    },
  });

  return data;
};

export const getCategories = async () => {
  const { data } = await api.get("/wp-json/wc/store/v1/products/categories");

  return data;
};

export const getProductsByCategory = async (categoryId) => {
  const { data } = await api.get("/wp-json/wc/store/v1/products", {
    params: {
      category: categoryId,
    },
  });

  return data;
};

export const getCart = async () => {
  const { data } = await api.get("/wp-json/wc/store/v1/cart");

  return data;
};

export const addToCart = async (productId, quantity = 1) => {
  const { data } = await api.post("/wp-json/wc/store/v1/cart/add-item", {
    id: productId,
    quantity,
  });

  return data;
};

export const removeCartItem = async (cartItemKey) => {
  const { data } = await api.post("/wp-json/wc/store/v1/cart/remove-item", {
    key: cartItemKey,
  });

  return data;
};

export const updateCartItem = async (cartItemKey, quantity) => {
  const { data } = await api.post("/wp-json/wc/store/v1/cart/update-item", {
    key: cartItemKey,
    quantity,
  });

  return data;
};
