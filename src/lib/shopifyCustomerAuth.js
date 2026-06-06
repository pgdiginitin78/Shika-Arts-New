// ─────────────────────────────────────────────────────────────
// Shopify Storefront API — Customer Authentication
// Uses the existing SHOPIFY_STOREFRONT_TOKEN (no OAuth Client ID needed)
// ─────────────────────────────────────────────────────────────

import { SHOPIFY_STOREFRONT_URL, SHOPIFY_STOREFRONT_TOKEN } from "./shopify";

async function run(query, variables = {}) {
  const res = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify network error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join(", ");
    console.error("[shopifyCustomerAuth] GraphQL errors:", msg);
    throw new Error(msg);
  }

  return json.data;
}

// ── Login with email + password ───────────────────────────────
export async function customerLogin(email, password) {
  const data = await run(
    `mutation Login($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { code field message }
      }
    }`,
    { input: { email, password } }
  );

  const { customerAccessToken, customerUserErrors } =
    data.customerAccessTokenCreate;

  if (customerUserErrors?.length) {
    throw new Error(customerUserErrors[0].message);
  }
  if (!customerAccessToken?.accessToken) {
    throw new Error("Login failed. Please check your email and password.");
  }

  localStorage.setItem("shopify_access_token", customerAccessToken.accessToken);
  localStorage.setItem("shopify_token_expiry", customerAccessToken.expiresAt);

  return customerAccessToken; // { accessToken, expiresAt }
}

// ── Fetch customer profile by Storefront token ────────────────
export async function fetchCustomerByToken(accessToken) {
  const data = await run(
    `query GetCustomer($token: String!) {
      customer(customerAccessToken: $token) {
        id
        firstName
        lastName
        email
        phone
        defaultAddress { address1 city country }
      }
    }`,
    { token: accessToken }
  );

  const c = data?.customer;
  if (!c) throw new Error("Customer not found for this token.");

  return {
    id: c.id,
    firstName: c.firstName || "",
    lastName: c.lastName || "",
    email: c.email,
    phone: c.phone || "",
    // Match shape expected by UserMenu (Customer Account API format)
    emailAddress: { emailAddress: c.email },
    imageUrl: null,
    defaultAddress: c.defaultAddress,
  };
}

// ── Logout ────────────────────────────────────────────────────
export async function customerLogout(accessToken) {
  try {
    await run(
      `mutation Logout($token: String!) {
        customerAccessTokenDelete(customerAccessToken: $token) {
          deletedAccessToken
          userErrors { field message }
        }
      }`,
      { token: accessToken }
    );
  } catch (e) {
    console.warn("[shopifyCustomerAuth] Logout mutation error:", e.message);
  } finally {
    localStorage.removeItem("shopify_access_token");
    localStorage.removeItem("shopify_token_expiry");
    localStorage.removeItem("shopify_id_token");
    localStorage.removeItem("shopify_refresh_token");
  }
}

// ── Restore session on app load ───────────────────────────────
export async function restoreSession() {
  const token = localStorage.getItem("shopify_access_token");
  const expiry = localStorage.getItem("shopify_token_expiry");

  if (!token) return null;

  // Check token expiry
  if (expiry && new Date(expiry) < new Date()) {
    localStorage.removeItem("shopify_access_token");
    localStorage.removeItem("shopify_token_expiry");
    return null;
  }

  try {
    const customer = await fetchCustomerByToken(token);
    return { token, customer };
  } catch (e) {
    console.warn("[shopifyCustomerAuth] Session restore failed:", e.message);
    localStorage.removeItem("shopify_access_token");
    return null;
  }
}
