import api, { startTokenAutoRefresh, saveTokens, clearTokens, publicApi } from "./http-common";

export const customerLogin = async (username, password) => {
  const { data } = await api.post("/wp-json/custom/v1/login", {
    username,
    password,
  });
  saveTokens(data);
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

export const logoutApi = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  if (refresh_token) {
    try {
      await api.post("/wp-json/custom/v1/logout", { refresh_token });
    } catch (e) {
      console.error("Logout API call failed:", e);
    }
  }

  clearTokens();
};

export const getCurrentUser = async (token) => {
  const { data } = await api.get("/wp-json/custom/v1/user-profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getProducts = async (params = {}) => {
  const { data } = await publicApi.get("/wp-json/custom/v1/all-products", {
    params,
  });
  return data.products;
};

export const getProductsPage = async ({ page = 1, per_page = 50 } = {}) => {
  const { data } = await publicApi.get("/wp-json/custom/v1/all-products", {
    params: { page, per_page },
  });
  // data = { total, pages, products }
  return data;
};

export const searchProducts = async (search) => {
  const { data } = await publicApi.get("/wp-json/custom/v1/all-products", {
    params: { search, per_page: 20 },
  });
  return data.products;
};

export const getCategories = async () => {
  const { data } = await publicApi.get("https://api.shikaarts.com/wp-json/custom/v1/all-categories");
  return data;
};

export const getProductsByParentCategory = async (categorySlug, perPage = 24) => {
  const { data } = await publicApi.get(`/wp-json/custom/v1/products-by-parent/${categorySlug}`, {
    params: {
      per_page: perPage,
    },
  });
  return data;
};

export const getProductsByParentCategoryPage = async (categorySlug, page = 1, perPage = 50) => {
  const { data } = await publicApi.get(`/wp-json/custom/v1/products-by-parent/${categorySlug}`, {
    params: { page, per_page: perPage },
  });
  // Expected: { products: [...], total: N, pages: N }
  return data;
};

export const getProductsByCategoryPage = async (categoryId, page = 1, perPage = 50) => {
  const { data } = await publicApi.get("/wp-json/custom/v1/all-products", {
    params: { category: categoryId, page, per_page: perPage },
  });
  // Expected: { products: [...], total: N, pages: N }
  return data;
};

export const getProductsByCategory = async (categorySlug, page = 1, perPage = 24) => {
  const { data } = await publicApi.get("/wp-json/custom/v1/all-products", {
    params: { category: categorySlug, page, per_page: perPage },
  });

  let allProducts = Array.isArray(data?.products) ? [...data.products] : [];
  const totalPages = Number(data?.pages || 1);

  if (totalPages > 1 && page === 1 && perPage === 100) {
    for (let p = 2; p <= totalPages; p++) {
      try {
        const { data: pageData } = await publicApi.get("/wp-json/custom/v1/all-products", {
          params: { category: categorySlug, page: p, per_page: 24 },
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
  if (incomingToken) {
    localStorage.setItem("token", incomingToken);
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
    localStorage.setItem("token", cartToken);
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
    localStorage.setItem("token", cartToken);
  }
  return response.data;
};

export const removeCartItem = async (cartItemKey) => {
  const response = await api.post("/wp-json/wc/store/v1/cart/remove-item", {
    key: cartItemKey,
  });
  const cartToken = response.headers["cart-token"];
  if (cartToken) {
    localStorage.setItem("token", cartToken);
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
