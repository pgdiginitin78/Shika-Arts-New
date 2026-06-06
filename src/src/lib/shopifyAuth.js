// ─────────────────────────────────────────────────────────────
// Shopify Customer Account API — OAuth 2.0 PKCE
// ─────────────────────────────────────────────────────────────
// Required env vars (Vite — must be prefixed VITE_):
//   VITE_SHOPIFY_SHOP_ID                       e.g. 81366122713
//   VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID    e.g. shp_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//
// Get the Client ID from:
//   Shopify Admin → Settings → Customer accounts → Customer Account API
//                 → Application setup → Client ID
// In that same screen, register:
//   Callback URI(s):       https://<your-domain>/auth/callback  (+ http://localhost:5173/auth/callback)
//   JavaScript origin(s):  https://<your-domain>                (+ http://localhost:5173)
//   Logout URI(s):         https://<your-domain>                (+ http://localhost:5173)
// And confirm "New customer accounts" is the active mode.
// ─────────────────────────────────────────────────────────────

const SHOP_ID = import.meta.env.VITE_SHOPIFY_SHOP_ID || "81366122713";

export const SHOPIFY_CLIENT_ID =
  import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || "";

const REDIRECT_URI = `${window.location.origin}/auth/callback`;
const SCOPES = "openid email customer-account-api:full";

// SHOPIFY_CLIENT_ID is only required for the OAuth/Google flow.
// Email + password login works via Storefront API without it.

// ── PKCE helpers ─────────────────────────────────────────────
function randomString(len = 64) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, len);
}

async function sha256(input) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generatePKCE() {
  const codeVerifier = randomString(64);
  const codeChallenge = base64UrlEncode(await sha256(codeVerifier));
  return { codeVerifier, codeChallenge };
}

// ── OpenID discovery (Customer Account API) ──────────────────
// Customer Account API discovery lives at shopify.com/authentication/{shop_id}
// — NOT at {shop}.myshopify.com.
let _openIdConfig = null;

export async function getOpenIDConfig() {
  if (_openIdConfig) return _openIdConfig;
  const url = `https://shopify.com/authentication/${SHOP_ID}/.well-known/openid-configuration`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `OpenID discovery failed (${res.status}). Check VITE_SHOPIFY_SHOP_ID.`
    );
  }
  _openIdConfig = await res.json();
  return _openIdConfig;
}

// ── Initiate login (Email or Google — both go through Shopify) ──
export async function initiateLogin(/* clientId */) {
  if (!SHOPIFY_CLIENT_ID) {
    throw new Error(
      "Customer Account Client ID is missing. Set VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID."
    );
  }

  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = randomString(16);
  const nonce = randomString(16);

  sessionStorage.setItem("shopify_code_verifier", codeVerifier);
  sessionStorage.setItem("shopify_oauth_state", state);
  sessionStorage.setItem("shopify_oauth_nonce", nonce);

  const { authorization_endpoint } = await getOpenIDConfig();

  const params = new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.href = `${authorization_endpoint}?${params.toString()}`;
}

// ── Exchange authorization code for tokens ───────────────────
export async function exchangeCodeForToken(/* clientId */ _ignored, code) {
  // Backwards-compatible signature: old call sites pass (clientId, code).
  // We now use the env-driven SHOPIFY_CLIENT_ID exclusively.
  const codeVerifier = sessionStorage.getItem("shopify_code_verifier");
  if (!codeVerifier) throw new Error("Missing PKCE code verifier in session.");

  const { token_endpoint } = await getOpenIDConfig();

  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Origin MUST match a registered JavaScript origin in the Customer
      // Account API settings — otherwise the token call 401s.
      Origin: window.location.origin,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: SHOPIFY_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error_description || err.error || `Token exchange failed (${res.status})`
    );
  }

  const tokens = await res.json();

  // Persist (consider moving to httpOnly cookies via a backend for production).
  if (tokens.access_token) {
    localStorage.setItem("shopify_access_token", tokens.access_token);
  }
  if (tokens.id_token) {
    localStorage.setItem("shopify_id_token", tokens.id_token);
  }
  if (tokens.refresh_token) {
    localStorage.setItem("shopify_refresh_token", tokens.refresh_token);
  }
  if (tokens.expires_in) {
    localStorage.setItem(
      "shopify_token_expiry",
      String(Date.now() + tokens.expires_in * 1000)
    );
  }

  sessionStorage.removeItem("shopify_code_verifier");
  sessionStorage.removeItem("shopify_oauth_state");
  sessionStorage.removeItem("shopify_oauth_nonce");

  return tokens;
}

// ── Refresh access token ─────────────────────────────────────
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("shopify_refresh_token");
  if (!refreshToken) throw new Error("No refresh token available.");

  const { token_endpoint } = await getOpenIDConfig();

  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: window.location.origin,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: SHOPIFY_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
  const tokens = await res.json();

  if (tokens.access_token)
    localStorage.setItem("shopify_access_token", tokens.access_token);
  if (tokens.refresh_token)
    localStorage.setItem("shopify_refresh_token", tokens.refresh_token);
  if (tokens.expires_in) {
    localStorage.setItem(
      "shopify_token_expiry",
      String(Date.now() + tokens.expires_in * 1000)
    );
  }
  return tokens;
}

// ── Customer profile ─────────────────────────────────────────
export async function fetchCustomerProfile(accessToken) {
  const apiVersion = "2025-01";
  const url = `https://shopify.com/${SHOP_ID}/account/customer/api/${apiVersion}/graphql`;

  const query = `{
    customer {
      id
      firstName
      lastName
      imageUrl
      emailAddress { emailAddress }
      defaultAddress { address1 city }
    }
  }`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Customer Account API expects the raw access_token, NOT "Bearer ...".
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`Customer fetch failed (${res.status})`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0]?.message || "GraphQL error");
  return data?.customer || null;
}

// ── Logout ───────────────────────────────────────────────────
export async function initiateLogout(idTokenArg) {
  const idToken = idTokenArg || localStorage.getItem("shopify_id_token") || "";
  const { end_session_endpoint } = await getOpenIDConfig();

  localStorage.removeItem("shopify_access_token");
  localStorage.removeItem("shopify_id_token");
  localStorage.removeItem("shopify_refresh_token");
  localStorage.removeItem("shopify_token_expiry");

  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: window.location.origin,
  });
  window.location.href = `${end_session_endpoint}?${params.toString()}`;
}
