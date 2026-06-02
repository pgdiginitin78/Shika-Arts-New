import { toast } from "sonner";
export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "shika-arts-premium-gifts-jmx4i.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "717bf5323807b285f6f93cad741a7820";

const PRODUCT_FIELDS = `
  id
  title
  description
  handle
  productType
  tags
  vendor
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 10) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;
export const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;
export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;
export async function storefrontApiRequest(query, variables = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Shopify API access requires an active billing plan. Visit admin.shopify.com to upgrade."
    });
    return;
  }
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Shopify error: ${data.errors.map(e => e.message).join(", ")}`);
  return data;
}
// ── Customer Auth (Storefront API) ──────────────────────────────
const CUSTOMER_LOGIN_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;

const CUSTOMER_PROFILE_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
    }
  }
`;

export async function loginCustomer(email, password) {
  const data = await storefrontApiRequest(CUSTOMER_LOGIN_MUTATION, {
    input: { email, password },
  });
  return data?.data?.customerAccessTokenCreate;
}

export async function getCustomerProfile(accessToken) {
  const data = await storefrontApiRequest(CUSTOMER_PROFILE_QUERY, {
    customerAccessToken: accessToken,
  });
  return data?.data?.customer || null;
}

export function formatPrice(amount, currencyCode = "INR") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = currencyCode === "INR" ? "₹" : currencyCode === "USD" ? "$" : currencyCode + " ";
  return `${symbol}${n.toLocaleString("en-IN", {
    maximumFractionDigits: 0
  })}`;
}