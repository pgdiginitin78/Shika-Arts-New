import api from "./http-common";

export async function createWooOrder(cartItems = [], customer = {}) {
  const nameParts = (customer.name || "").trim().split(" ");
  const firstName = nameParts[0] || "Guest";
  const lastName = nameParts.slice(1).join(" ") || ".";

  const billingAddress = {
    first_name: firstName,
    last_name: lastName,
    email: customer.email || "",
    phone: customer.phone || "",
    address_1: customer.address || "N/A",
    city: customer.city || "N/A",
    state: customer.state || "MH",
    postcode: customer.postcode || "",
    country: "IN",
  };

  const line_items = cartItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  const payload = {
    line_items,
    billing: billingAddress,
    shipping: billingAddress,
    payment_method: "razorpay",
  };

  const { data } = await api.post("/wp-json/custom/v1/create-order", payload);

  if (!data?.success) {
    throw new Error(data?.message || "Failed to create order.");
  }

  return {
    receiptId: data.receipt,
    razorpayOrderId: data.razorpay_order_id,
    amount: data.amount,
    currency: data.currency,
  };
}

export async function markOrderPaid(
  receiptId,
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
) {
  try {
    const response = await api.post("/wp-json/custom/v1/verify-payment", {
      receipt: receiptId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function clearWooCart() {
  const { data } = await api.post("/wp-json/custom/v1/clear-cart");
  return data;
}

export async function cancelWooOrder(orderId) {
  try {
    const { data } = await api.post("/wp-json/custom/v1/cancel-order", {
      order_id: orderId,
    });
    return data;
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
  }
}

export async function getMyOrders() {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Not logged in" };
  const { data } = await api.get("/wp-json/custom/v1/my-orders");
  return data;
}

export async function cancelOrder(orderId) {
  const { data } = await api.post("/wp-json/custom/v1/cancel-order", {
    order_id: orderId,
  });
  return data;
}

export async function downloadInvoice(orderId) {
  const response = await fetch(
    `https://api.shikaarts.com/wp-json/custom/v1/download-invoice/${orderId}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new Error("Invoice not available");
  }

  const originalBlob = await response.blob();
  const pdfBlob = new Blob([originalBlob], { type: "application/pdf" });
  return URL.createObjectURL(pdfBlob);
}

export async function getOrderDetails(orderId) {
  const { data } = await api.get(`/wp-json/custom/v1/order/${orderId}`, {});

  return data;
}

export async function addToWishlistApi(item) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.dispatchEvent(new Event("auth-failed"));
    return { success: false, message: "Not logged in" };
  }
  const payload = {
    product_id: item.id,
    variation_id: item.variationId ?? item.variation_id ?? 0,
    quantity: item.quantity ?? 1,
    name: item.name,
    slug: item.slug,
    sku: item.sku,
    permalink: item.permalink,
    images: item.images,
    variation: item.variation,
    prices: item.prices,
    quantity_limits: item.quantity_limits,
  };

  const { data } = await api.post("/wp-json/custom/v1/wishlist", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function removeFromWishlistApi(productId, variationId = 0) {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Not logged in" };
  const { data } = await api.delete(`/wp-json/custom/v1/wishlist/${productId}`, {
    params: { variation_id: variationId, _t: Date.now() },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getWishlistItems() {
  const token = localStorage.getItem("token");
  if (!token) return [];
  const { data } = await api.get("/wp-json/custom/v1/wishlist", {
    params: { _t: Date.now() },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getAdminOrders(filters = {}) {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Not logged in" };
  const { data } = await api.get("/wp-json/custom/v1/admin/orders", {
    params: filters,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getAdminOrderDetail(orderId) {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Not logged in" };
  const { data } = await api.get(`/wp-json/custom/v1/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getAdminOrdersSummary(filters = {}) {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Not logged in" };
  const { data } = await api.get("/wp-json/custom/v1/admin/orders/summary", {
    params: filters,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function searchProducts(name, page = 1, perPage = 20) {
  if (!name || !name.trim()) {
    return { products: [], total: 0, pages: 0 };
  }

  const { data } = await api.get("/wp-json/custom/v1/search-products", {
    params: { name: name.trim(), page, per_page: perPage },
  });

  return data;
}

export async function getUserProfile() {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Not logged in" };
  const { data } = await api.get("/wp-json/custom/v1/user-profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getHomeProducts() {
  const { data } = await api.get("/wp-json/custom/v1/home-products");
  return data;
}

export async function downloadBrochure(dataObj) {
  const { data } = await api.post("/wp-json/custom/v1/brochure-download", dataObj);
  return data;
}

export async function getBrochureDownloads() {
  const { data } = await api.get("/wp-json/custom/v1/brochure-downloads");
  return data;
}
