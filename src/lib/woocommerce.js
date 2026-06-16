function decodeHtmlEntities(text) {
  if (!text || typeof document === "undefined") return text || "";
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}

export function normalizeProduct(p) {
  if (!p) return null;

  // ✅ Detect custom API format — has flat 'image' string
  const isCustomApiFormat = typeof p.image === "string" && p.image.length > 0;

  let price = 0;
  let regularPrice = 0;
  if (isCustomApiFormat) {
    // Custom API: price is plain string "1349"
    price = Number(p.price || 0);
    regularPrice = Number(p.regular_price || 0);
  } else {
    // WC Store API: price is in minor units
    const minorUnit = Number(p?.prices?.currency_minor_unit ?? 2);
    const priceMinor = Number(p?.prices?.price ?? 0);
    const regularpriceMinor = Number(p?.prices?.regular_price ?? 0);
    price = Number.isFinite(priceMinor) ? priceMinor / 10 ** minorUnit : 0;
    regularPrice = Number.isFinite(regularpriceMinor) ? regularpriceMinor / 10 ** minorUnit : 0;
  }

  return {
    node: {
      id: String(p?.id ?? ""),
      handle: p?.slug || p?.handle || String(p?.id ?? ""),
      title: p?.name || p?.title || "",
      description: p?.description?.replace(/<[^>]+>/g, "") || "",
      productType: isCustomApiFormat
        ? decodeHtmlEntities(p.categories?.[0] || "")
        : p?.categories?.[0]?.name || "",
      tags: isCustomApiFormat ? p?.tags || [] : p?.tags?.map((t) => t.name) || [],

      // ✅ KEY FIX — handle flat 'image' vs array 'images'
      images: {
        edges: isCustomApiFormat
          ? [{ node: { url: p.image, altText: p.name || "" } }]
          : (p?.images || []).map((img) => ({
              node: {
                url: img.src || img.url || "",
                altText: img.alt || p?.name || "",
              },
            })),
      },

      variants: {
        edges: [
          {
            node: {
              id: `variant-${p?.id ?? ""}`,
              title: "Default",
              availableForSale: isCustomApiFormat
                ? true
                : (p?.is_in_stock ?? p?.stock_status !== "outofstock"),
              regularPrice:regularPrice,
              price: {
                amount: String(price),
                currencyCode: isCustomApiFormat ? "INR" : p?.prices?.currency_code || "INR",
              },
              selectedOptions: [],
            },
          },
        ],
      },
    },
  };
}

export function productToNode(product) {
  if (!product) return null;

  // Already wrapped in node
  if (product?.node) return product.node;

  // Already normalized
  if (Array.isArray(product?.images?.edges) && Array.isArray(product?.variants?.edges)) {
    return product;
  }

  return normalizeProduct(product)?.node || null;
}

export function formatPrice(amount, currencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode || "INR",
  }).format(Number(amount || 0));
}
