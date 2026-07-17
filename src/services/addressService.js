const WP_BASE = "https://api.shikaarts.com/wp-json/custom-auth/v1";

/**
 * Save (or update) the billing address for the currently logged-in customer.
 * Calls a custom WP REST endpoint that writes billing_* user-meta.
 */
export async function saveAddress(token, addressData) {
  const response = await fetch(`${WP_BASE}/save-address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to save address");
  }
  return response.json();
}
