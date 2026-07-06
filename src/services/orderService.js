import api from "./http-common";


/**
 * Creates a WooCommerce order via the REST v3 API.
 * Requires a logged-in customer (JWT token in localStorage).
 *
 * @param {Array}  cartItems  - Items from useCartStore().items
 * @param {Object} customer   - { name, email, phone }
 * @returns {{ orderId: number, amount: number, currency: string, receiptId: string }}
 */
export async function createWooOrder(cartItems = [], customer = {}) {
  // Split name into first/last
  const nameParts = (customer.name || "").trim().split(" ");
  const firstName = nameParts[0] || "Guest";
  const lastName = nameParts.slice(1).join(" ") || ".";

  const billingAddress = {
    first_name: firstName,
    last_name: lastName,
    email: customer.email || "guest@shikaarts.com",
    phone: customer.phone || "0000000000",
    address_1: customer.address || "N/A",
    city: customer.city || "N/A",
    state: customer.state || "MH",
    postcode: customer.postcode || "400001",
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

  console.log("create-order Response:", data);

  if (!data?.success) {
    throw new Error(data?.message || "Failed to create order.");
  }

  return {
    orderId: data.woo_order_id,
    orderKey: data.order_key,
    razorpayOrderId: data.razorpay_order_id,
    amount: data.amount,
    currency: data.currency,
  };
}

/**
 * Mark an existing WooCommerce order as 'processing' after successful payment.
 * Also stores the Razorpay payment ID as order meta for reconciliation.
 *
 * @param {number} orderId
 * @param {string} razorpayPaymentId
 */
export async function markOrderPaid(orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature) {
  try {
    const response = await api.post("/wp-json/custom/v1/verify-payment", {
      order_id: orderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    });
    console.log(`Payment verified and order marked as paid:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to verify payment with backend:", error);
    throw error;
  }
}

export async function clearWooCart() {
  const { data } = await api.post("/wp-json/custom/v1/clear-cart");
  return data;
}

/**
 * Cancel a pending order if payment was dismissed or failed.
 *
 * @param {number} orderId
 */
export async function cancelWooOrder(orderId) {
  try {
    const { data } = await api.post("/wp-json/custom/v1/cancel-order", {
      order_id: orderId,
    });
    console.log(`Order ${orderId} cancelled:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
    // Non-fatal: don't block the UI on cancellation failure
  }
}
/**
 * Fetch the list of all past orders for the currently logged-in customer.
 * Calls the custom /custom/v1/my-orders endpoint (defined in functions.php).
 *
 * @param {number} page  - Page number (default 1)
 * @param {number} perPage - Orders per page (default 20)
 */
export async function getMyOrders(page = 1, perPage = 20) {
  const token = localStorage.getItem("token");
  const { data } = await api.get("/wp-json/custom/v1/my-orders", {
    params: { page, per_page: perPage },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function getGuestOrders(customerId) {
  const { data } = await api.get("/wp-json/custom/v1/guest-orders", {
    params: {
      customer_id: customerId,
    },
  });

  return data;
}

export async function cancelOrder(orderId) {
  const { data } = await api.post("/wp-json/custom/v1/cancel-order", {
    order_id: orderId,
  });
  return data;
}


export async function downloadInvoice(orderId) {
  window.open(
    `https://lawngreen-marten-717862.hostingersite.com/wp-json/custom/v1/download-invoice/${orderId}`,
    "_blank"
  );
}

/**
 * Fetch a WooCommerce order's details using the order ID and order_key.
 * The order_key is returned from the checkout response and acts as a secure token.
 *
 * @param {number} orderId
 * @param {string} orderKey
 */
export async function getOrderDetails(orderId) {
  const { data } = await api.get(`/wp-json/custom/v1/order/${orderId}`, {});

  return data;
}



export async function addToWishlistApi(item) {
  const token = localStorage.getItem("token");
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

  const { data } = await api.post(
    "/wp-json/custom/v1/wishlist",
    payload,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  return data;
}

export async function removeFromWishlistApi(productId, variationId = 0) {
  const token = localStorage.getItem("token");
  const { data } = await api.delete(
    `/wp-json/custom/v1/wishlist/${productId}`,
    {
      params: { variation_id: variationId, _t: Date.now() },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return data;
}


export async function getWishlistItems() {
  const token = localStorage.getItem("token");
  const { data } = await api.get("/wp-json/custom/v1/wishlist", {
    params: { _t: Date.now() },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

//admin dashboard api

export async function getAdminOrders(filters = {}) {
  const token = localStorage.getItem("token");
  const { data } = await api.get("/wp-json/custom/v1/admin/orders", {
    params: filters,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function getAdminOrderDetail(orderId) {
  const token = localStorage.getItem("token");
  const { data } = await api.get(`/wp-json/custom/v1/admin/orders/${orderId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function getAdminOrdersSummary(filters = {}) {
  const token = localStorage.getItem("token");
  const { data } = await api.get("/wp-json/custom/v1/admin/orders/summary", {
    params: filters,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

/**
 * Search products by name using the custom search endpoint.
 */
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
  const { data } = await api.get("/wp-json/custom/v1/user-profile", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}