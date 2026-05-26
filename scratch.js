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
