import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import api from "./http-common";

export const customerLogin = async (username, password) => {
  const { data } = await api.post("/wp-json/jwt-auth/v1/token", {
    username,
    password,
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  localStorage.setItem("customerData", JSON.stringify(data));
  useCustomerAuthStore.getState().login(data.token, data.customer || data.user || data, null);
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
  localStorage.removeItem("cart_token");
  useCustomerAuthStore.getState().logout();
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
export const getProductsByParentCategory = async (categorySlug, perPage = -1) => {
  const { data } = await api.get(`/wp-json/custom/v1/products-by-parent/${categorySlug}`, {
    params: {
      per_page: perPage,
    },
  });
  return data;
};

// Get products by exact single category (for subcategory pages)
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

  console.log("[Cart] GET /cart → Cart-Token from server:", incomingToken);
  console.log("[Cart] GET /cart → Existing token in localStorage:", existingToken);

  if (incomingToken) {
    // Only overwrite existing token if we don't have one yet
    // (prevents an empty new session from replacing a valid cart session)
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

export const addToCart = async (productId, quantity = 1, variationAttributes = []) => {
  const body =
    variationAttributes.length > 0
      ? { id: productId, quantity, variation: variationAttributes }
      : { id: productId, quantity };

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

    // Log (don't throw) so failures are visible without breaking the page
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
