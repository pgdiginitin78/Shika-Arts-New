import api from "./http-common";

/**
 * Save (or update) the billing address for the currently logged-in customer.
 * Calls a custom WP REST endpoint that writes billing_* user-meta.
 */
export async function saveAddress(token, addressData) {
  const { data } = await api.post("/wp-json/custom-auth/v1/save-address", addressData);
  return data;
}
