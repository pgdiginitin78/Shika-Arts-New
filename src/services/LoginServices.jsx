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
  const { data } = await api.get("/wp-json/custom/v1/all-products", {
    params,
  });
  return data.products;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/wp-json/wc/store/v1/products/${id}`);
  return data;
};

export const searchProducts = async (search) => {
  const { data } = await api.get("/wp-json/custom/v1/all-products", {
    params: { search, per_page: 100 },
  });
  return data.products;
};

// api/products.js

// Get all categories as a tree (parent > children > grandchildren)
export const getCategories = async () => {
  const { data } = await api.get("/wp-json/custom/v1/all-categories");
  return data;
};

// api/products.js
export const getProductsByParentCategory = async (
  categorySlug,
  page = 1,
  perPage = 100
) => {
  const { data } = await api.get(
    `/wp-json/custom/v1/products-by-parent/${categorySlug}`,
    {
      params: {
        page,
        per_page: perPage,
      },
    }
  );

  return data;
};

// Get products by exact single category (for subcategory pages)
export const getProductsByCategory = async (categorySlug, page = 1, perPage = 100) => {
  const { data } = await api.get("/wp-json/custom/v1/all-products", {
    params: { category: categorySlug, page, per_page: perPage },
  });
  return data.products;
};

export const getCart = async () => {
  const response = await api.get("/wp-json/wc/store/v1/cart");

  const cartToken = response.headers["cart-token"];

  if (cartToken) {
    localStorage.setItem("wc_cart_token", cartToken);
  }

  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const cartToken = localStorage.getItem("wc_cart_token");

  const { data } = await api.post(
    "/wp-json/wc/store/v1/cart/add-item",
    {
      id: productId,
      quantity,
    },
    {
      headers: {
        "Cart-Token": cartToken,
      },
    },
  );

  return data;
};

export const updateCartItem = async (cartItemKey, quantity) => {
  const cartToken = localStorage.getItem("wc_cart_token");

  const { data } = await api.post(
    "/wp-json/wc/store/v1/cart/update-item",
    {
      key: cartItemKey,
      quantity,
    },
    {
      headers: {
        "Cart-Token": cartToken,
      },
    },
  );

  return data;
};

export const removeCartItem = async (cartItemKey) => {
  const cartToken = localStorage.getItem("wc_cart_token");

  const { data } = await api.post(
    "/wp-json/wc/store/v1/cart/remove-item",
    {
      key: cartItemKey,
    },
    {
      headers: {
        "Cart-Token": cartToken,
      },
    },
  );

  return data;
};

export const getProductBySlug = async (slug) => {
  const { data } = await api.get("/wp-json/wc/store/v1/products", {
    params: {
      per_page: 100,
    },
  });

  const cleaned = slug?.replace(/-/g, " ").toLowerCase();

  return (
    data?.find((p) => p.slug === slug) ||
    data?.find((p) => p.slug === cleaned) ||
    data?.find((p) => p.name?.toLowerCase() === cleaned) ||
    null
  );
};
