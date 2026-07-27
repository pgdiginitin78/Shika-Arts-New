import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import api, { startTokenAutoRefresh } from "./http-common";

export const customerLogin = async (username, password) => {
  const { data } = await api.post("/wp-json/custom/v1/login", {
    username,
    password,
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("token_expires_at", Date.now() + data.access_token_expires_in * 1000);
  startTokenAutoRefresh();
  return data;
};

export const registerCustomer = async (payload) => {
  const { data } = await api.post("/wp-json/custom/v1/register", payload);
  return data;
};

export const verifyEmailOtp = async (payload) => {
  const { data } = await api.post("/wp-json/custom/v1/verify-email", payload);
  return data;
};

export const resendOtp = async (payload) => {
  const { data } = await api.post("/wp-json/custom/v1/resend-otp", payload);
  return data;
};

export const logout = async () => {
  const refresh_token = localStorage.getItem("refresh_token");

  if (refresh_token) {
    try {
      await api.post("/wp-json/custom/v1/logout", { refresh_token });
    } catch (e) {
      console.error("Logout API call failed:", e);
    }
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
  localStorage.removeItem("user");
  localStorage.removeItem("customerData");
  localStorage.removeItem("cart_token");
  useCustomerAuthStore.getState().logout();
};

export const getCurrentUser = async (token) => {
  const { data } = await api.get("/wp-json/custom/v1/user-profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/wp-json/custom/v1/all-products", {
    params,
  });
  return data.products;
};

export const searchProducts = async (search) => {
  const { data } = await api.get("/wp-json/custom/v1/all-products", {
    params: { search, per_page: 100 },
  });
  return data.products;
};

export const getCategories = async () => {
  const { data } = await api.get("/wp-json/custom/v1/all-categories");
  return data;
};

export const getProductsByParentCategory = async (categorySlug, perPage = -1) => {
  const { data } = await api.get(`/wp-json/custom/v1/products-by-parent/${categorySlug}`, {
    params: {
      per_page: perPage,
    },
  });
  return data;
};

export const getProductsByCategory = async (categorySlug, page = 1, perPage = 100) => {
  const effectivePerPage = perPage === 100 ? -1 : perPage;
  const { data } = await api.get("/wp-json/custom/v1/all-products", {
    params: { category: categorySlug, page, per_page: effectivePerPage },
  });

  let allProducts = Array.isArray(data?.products) ? [...data.products] : [];
  const totalPages = Number(data?.pages || 1);

  if (totalPages > 1 && page === 1 && (perPage === 100 || perPage === -1)) {
    for (let p = 2; p <= totalPages; p++) {
      try {
        const { data: pageData } = await api.get("/wp-json/custom/v1/all-products", {
          params: { category: categorySlug, page: p, per_page: 100 },
        });
        if (Array.isArray(pageData?.products) && pageData.products.length > 0) {
          allProducts.push(...pageData.products);
        }
      } catch (e) {
        console.error(`[getProductsByCategory] Error fetching page ${p}:`, e);
      }
    }
  }

  return allProducts;
};

export const getCart = async () => {
  const response = await api.get("/wp-json/wc/store/v1/cart");

  const incomingToken = response.headers["cart-token"];
  const existingToken = localStorage.getItem("cart_token");

  if (incomingToken) {
    if (!existingToken || existingToken === incomingToken) {
      localStorage.setItem("cart_token", incomingToken);
    } else {
      console.warn(
        "[Cart] Server returned a DIFFERENT token — keeping existing token to preserve cart session.",
      );
    }
  }

  return response.data;
};

export const addToCart = async (
  productId,
  quantity = 1,
  variationAttributes = [],
  variationId = null,
) => {
  const idToSend = variationId || productId;

  const body = { id: idToSend, quantity };

  const response = await api.post("/wp-json/wc/store/v1/cart/add-item", body);

  const cartToken = response.headers["cart-token"];

  if (cartToken) {
    localStorage.setItem("cart_token", cartToken);
  }

  return response.data;
};

export const updateCartItem = async (cartItemKey, quantity) => {
  const response = await api.post("/wp-json/wc/store/v1/cart/update-item", {
    key: cartItemKey,
    quantity,
  });

  const cartToken = response.headers["cart-token"];
  if (cartToken) {
    localStorage.setItem("cart_token", cartToken);
  }

  return response.data;
};

export const removeCartItem = async (cartItemKey) => {
  const response = await api.post("/wp-json/wc/store/v1/cart/remove-item", {
    key: cartItemKey,
  });

  const cartToken = response.headers["cart-token"];
  if (cartToken) {
    localStorage.setItem("cart_token", cartToken);
  }

  return response.data;
};

const getVariationPrice = async (productId, variationId) => {
  try {
    const { data } = await api.get(`/wp-json/wc/store/v1/products/${variationId}`);
    return data || null;
  } catch {
    try {
      const { data } = await api.get(
        `/wp-json/wc/v2/products/${productId}/variations/${variationId}`,
      );
      return data || null;
    } catch {
      return null;
    }
  }
};

export const getProductBySlug = async (slug) => {
  const { data } = await api.get("/wp-json/wc/store/v1/products", {
    params: { slug },
  });

  const product = data?.[0] || null;
  if (!product) return null;

  if (product.type === "variable" && product.variations?.length > 0) {
    const results = await Promise.allSettled(
      product.variations.map(async (v) => {
        const vd = await getVariationPrice(product.id, v.id);
        if (vd) {
          vd.attributes = v.attributes && v.attributes.length > 0 ? v.attributes : vd.attributes;
        }
        return vd;
      }),
    );

    product._variationDetails = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    results
      .filter((r) => r.status === "rejected")
      .forEach((r) => console.error("[getProductBySlug] variation fetch failed:", r.reason));
  }

  return product;
};

export async function updateAddress(payload) {
  const token = localStorage.getItem("token");
  const { data } = await api.post("/wp-json/custom/v1/update-address", payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}