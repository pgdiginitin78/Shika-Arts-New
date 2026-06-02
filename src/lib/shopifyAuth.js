// ─────────────────────────────────────────────────────────────
// Shopify Customer Account API — OAuth 2.0 PKCE Auth Utilities
// ─────────────────────────────────────────────────────────────

const STORE_DOMAIN = "shika-arts-premium-gifts-jmx4i.myshopify.com";
const REDIRECT_URI = `${window.location.origin}/auth/callback`;
const SCOPES = "openid email customer-account-api:full";

export const SHOPIFY_CLIENT_ID = import.meta.env.VITE_SHOPIFY_CLIENT_ID || "";

// ── PKCE Helpers ─────────────────────────────────────────────

function generateRandom(length = 64) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, length);
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generatePKCE() {
  const codeVerifier = generateRandom(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64URLEncode(hashed);
  return { codeVerifier, codeChallenge };
}

// ── OpenID Discovery ─────────────────────────────────────────

let _openIdConfig = null;

export async function getOpenIDConfig() {
  if (_openIdConfig) return _openIdConfig;
  const res = await fetch(
    `https://${STORE_DOMAIN}/.well-known/openid-configuration`
  );
  if (!res.ok) throw new Error("Failed to fetch OpenID configuration");
  _openIdConfig = await res.json();
  return _openIdConfig;
}

// ── Initiate Login ────────────────────────────────────────────

export async function initiateLogin(clientId) {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = generateRandom(16);
  const nonce = generateRandom(16);

  // Store in sessionStorage for use after redirect
  sessionStorage.setItem("shopify_code_verifier", codeVerifier);
  sessionStorage.setItem("shopify_oauth_state", state);
  sessionStorage.setItem("shopify_oauth_nonce", nonce);

  const config = await getOpenIDConfig();
  const authEndpoint = config.authorization_endpoint;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.href = `${authEndpoint}?${params.toString()}`;
}

// ── Exchange Code for Token ───────────────────────────────────

export async function exchangeCodeForToken(clientId, code) {
  const codeVerifier = sessionStorage.getItem("shopify_code_verifier");
  if (!codeVerifier) throw new Error("Missing code verifier in session");

  const config = await getOpenIDConfig();
  const tokenEndpoint = config.token_endpoint;

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || "Token exchange failed");
  }

  const tokens = await res.json();

  // Clean up session storage
  sessionStorage.removeItem("shopify_code_verifier");
  sessionStorage.removeItem("shopify_oauth_state");
  sessionStorage.removeItem("shopify_oauth_nonce");

  return tokens; // { access_token, id_token, expires_in, ... }
}

// ── Sign Out ──────────────────────────────────────────────────

export async function initiateLogout(clientId, idToken) {
  const config = await getOpenIDConfig();
  const endSessionEndpoint = config.end_session_endpoint;

  // post_logout_redirect_uri must be registered in Shopify admin
  const returnTo = window.location.origin;

  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: returnTo,
  });

  // Include id_token_hint if available (preferred by Shopify)
  if (idToken) {
    params.set("id_token_hint", idToken);
  }

  window.location.href = `${endSessionEndpoint}?${params.toString()}`;
}

// ── Fetch Customer Profile ────────────────────────────────────

export async function fetchCustomerProfile(accessToken) {
  const config = await getOpenIDConfig();

  // Derive the Customer Account API GraphQL endpoint from the issuer
  // issuer looks like: https://shopify.com/81366122713
  const shopId = config.issuer?.split("/").pop();
  const apiVersion = "2024-10";
  const graphqlUrl = `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`;

  const query = `
    query {
      customer {
        id
        firstName
        lastName
        emailAddress { emailAddress }
        imageUrl
        defaultAddress {
          address1
          city
        }
      }
    }
  `;

  const res = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error("Failed to fetch customer profile");
  const { data } = await res.json();
  return data?.customer || null;
}
