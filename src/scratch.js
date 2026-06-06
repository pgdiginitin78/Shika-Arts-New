const url = 'https://shika-arts-premium-gifts-jmx4i.myshopify.com/api/2025-07/graphql.json';
const token = '717bf5323807b285f6f93cad741a7820';
const query = `{ products(first: 10, query: "(product_type:\\"Occasion\\" OR product_type:\\"Occasions\\")") { edges { node { title productType tags handle } } } }`;

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token
  },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
  // Test 2: Public products.json (no auth needed)
  console.log("\n=== Test 2: Public products.json (no token) ===");
  const r2 = await fetch("https://shika-arts-premium-gifts-jmx4i.myshopify.com/products.json?limit=3");
  console.log("Status:", r2.status);
  const data = await r2.json();
  console.log("Products found:", data?.products?.length);
  if (data?.products?.length > 0) {
    console.log("First product:", data.products[0]?.title);
  }

  // Test 3: Collections.json
  console.log("\n=== Test 3: Collections.json ===");
  const r3 = await fetch("https://shika-arts-premium-gifts-jmx4i.myshopify.com/collections.json");
  console.log("Status:", r3.status);
  const cols = await r3.json();
  console.log("Collections:", cols?.collections?.map(c => c.title));
}

test().catch(console.error);
