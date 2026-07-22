import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, productToNode } from "@/lib/woocommerce";
import { getProductBySlug } from "@/services/LoginServices";
import { addToWishlistApi, removeFromWishlistApi } from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartAnimation } from "@/context/CartAnimationContext";
import { motion } from "framer-motion";
import { Heart, Loader2, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const buildWishlistPayload = (node, variant, image, product, quantity = 1, productId) => {
  const minorUnit = 2;
  const multiplier = 10 ** minorUnit;
  const rawMultiplier = 10 ** 6;

  const amount = Number(variant?.price?.amount || 0);
  const regularAmount =
    Number(variant?.regularPrice || 0) > 0 ? Number(variant.regularPrice) : amount;
  const saleAmount = amount;

  const toMinor = (val) => Math.round(val * multiplier).toString();
  const toRaw = (val) => Math.round(val * rawMultiplier).toString();

  const variationIdMatch = String(variant?.id || "").match(/\d+/);
  const variationId =
    node?.productVariationType === "variable" && variationIdMatch ? Number(variationIdMatch[0]) : 0;

  return {
    product_id: productId,
    variation_id: variationId,
    quantity,
    name: node?.title || "",
    sku: variant?.sku || "",
    permalink: product?.permalink || `${window.location.origin}/product/${node?.handle}/`,
    images: image?.url
      ? [
          {
            id: 0,
            src: image.url,
            thumbnail: image.url,
            srcset: "",
            sizes: "",
            thumbnail_srcset: "",
            thumbnail_sizes: "",
            name: node?.title || "",
            alt: image?.altText || "",
          },
        ]
      : [],
    variation: [],
    prices: {
      price: toMinor(amount),
      regular_price: toMinor(regularAmount),
      sale_price: toMinor(saleAmount),
      price_range: null,
      currency_code: variant?.price?.currencyCode || "INR",
      currency_symbol: "₹",
      currency_minor_unit: minorUnit,
      currency_decimal_separator: ".",
      currency_thousand_separator: ",",
      currency_prefix: "₹",
      currency_suffix: "",
      raw_prices: {
        precision: 6,
        price: toRaw(amount),
        regular_price: toRaw(regularAmount),
        sale_price: toRaw(saleAmount),
      },
    },
    quantity_limits: {
      minimum: 1,
      maximum: 9999,
      multiple_of: 1,
      editable: true,
    },
  };
};

// Reactive auth check (store) with a localStorage fallback, since
// customerLogin() persists the token directly to localStorage as well.
function useIsLoggedIn() {
  const storeToken = useCustomerAuthStore((s) => s.token ?? s.accessToken ?? null);
  if (storeToken) return true;
  if (typeof window !== "undefined") {
    return Boolean(localStorage.getItem("token"));
  }
  return false;
}

export function ProductCard({ product, lightMode = true }) {
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const isGlobalLoading = useCartStore((s) => s.isLoading);
  const isLoading = isAdding || isGlobalLoading;
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const { launchAnimation } = useCartAnimation();
  const addButtonRef = useRef(null);

  const node = productToNode(product) || {
    id: "",
    handle: "",
    title: "",
    description: "",
    productType: "",
    tags: [],
    images: { edges: [] },
    variants: { edges: [] },
  };

  const rawId = product?.node?.id;
  const productId = Number(node?.id || rawId || 0);
  const variant = node?.variants?.edges?.[0]?.node;
  const image = node?.images?.edges?.[0]?.node;

  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId));

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisting) return;

    if (!isLoggedIn) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    setIsWishlisting(true);

    try {
      const resolvedId = Number(product?.id || node?.id || product?.node?.id || 0);
      const variationId = product?.variation_id ?? product?.variationId ?? 0;

      if (isInWishlist) {
        await removeFromWishlistApi(resolvedId, variationId);
        await useWishlistStore.getState().fetchWishlist();
        toast.success("Removed from wishlist");
      } else {
        const handle = node.handle || node.id;
        const fullProduct = handle ? await getProductBySlug(handle) : null;

        const fetchResolvedId = Number(fullProduct?.id || resolvedId);

        if (!fetchResolvedId) {
          toast.error("Couldn't add to wishlist — missing product info.");
          return;
        }

        const payload = fullProduct
          ? { ...fullProduct, quantity: 1, product_id: fetchResolvedId }
          : buildWishlistPayload(node, variant, image, product, 1, fetchResolvedId);

        await addToWishlistApi(payload);
        await useWishlistStore.getState().fetchWishlist();
        toast.success("Added to wishlist");
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Please log in to add items to your wishlist");
        navigate("/login", { state: { from: window.location.pathname } });
      } else {
        toast.error("Couldn't update wishlist. Please try again.");
      }
    } finally {
      setIsWishlisting(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variant) return;
    const imgSrc = product?.image || image?.url;
    const triggerEl = addButtonRef.current;
    const qtyBefore = useCartStore
      .getState()
      .items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

    setIsAdding(true);
    try {
      const handle = node.handle || node.id;
      if (handle) {
        const fullProduct = await getProductBySlug(handle);
        if (fullProduct && fullProduct.type?.toLowerCase() === "variable") {
          navigate(`/product/${handle}`);
          return;
        }
      }

      const data = await addItem({
        productId: node.id,
        handle: node.handle,
        product: node,
        quantity: 1,
      });

      const qtyAfter = useCartStore
        .getState()
        .items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
      if (data?.error === "woocommerce_rest_missing_attributes") {
        const handle = node.handle || node.id;
        if (handle) navigate(`/product/${handle}`);
        return;
      }

      const wasAdded = data && !data.error && qtyAfter > qtyBefore;

      if (wasAdded) {
        if (imgSrc && triggerEl) {
          await launchAnimation({ src: imgSrc, triggerElement: triggerEl });
        }
        setOpen(true);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const getPriceSuffix = (title) => {
    if (!title) return "";
    const t = title.toLowerCase();
    if (
      t.includes("candle") ||
      t.includes("diya") ||
      t.includes("charm") ||
      t.includes("tealight") ||
      t.includes("peony") ||
      t.includes("seashell") ||
      t.includes("trio") ||
      t.includes("quarter") ||
      t.includes("mini-cake") ||
      t.includes("medley") ||
      t.includes("bar") ||
      t.includes("sachet") ||
      t.includes("pouch") ||
      t.includes("bags") ||
      t.includes("bag") ||
      t.includes("badges")
    )
      return "/ pp";

    if (
      t.includes("hamper") ||
      t.includes("gift box") ||
      t.includes("gift set") ||
      t.includes("celebration") ||
      t.includes("keepsake") ||
      t.includes("box print")
    )
      return "";

    if (t.includes("set") || t.includes("box") || t.includes("trough") || t.includes("kit"))
      return "/ set";
    return "";
  };

  return (
    <Link
      to={`/product/${node.handle || node.id}`}
      className="group block relative w-full border rounded"
    >
      <div className="relative h-[230px] md:h-[300px] flex-shrink-0 overflow-hidden bg-secondary shine-effect">
        {product?.image || image?.url ? (
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            src={product?.image || image?.url}
            alt={product?.name || image?.altText || node.title}
            className="h-full w-full object-cover rounded grayscale-[0.1] group-hover:grayscale-0 transition-all duration-700"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/20">
            <span className="font-serif text-4xl opacity-20 italic">Shika</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
          {Number(variant?.price?.amount || 0) > 0 ? (
            <button
              ref={addButtonRef}
              onClick={handleAdd}
              disabled={isLoading || !variant}
              className="w-full bg-primary text-primary-foreground cursor-pointer py-3 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-ultra hover:bg-accent hover:text-primary transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Plus size={12} />
                  Add
                </>
              )}
            </button>
          ) : (
            <Link
              to={`/product/${node.handle || node.id}`}
              className="w-full bg-primary text-primary-foreground py-3 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-ultra hover:bg-accent hover:text-primary transition-colors text-center"
            >
              Contact Us
            </Link>
          )}
        </div>
        <button
          onClick={handleWishlist}
          disabled={isWishlisting}
          className={`absolute top-1 right-2 z-20 p-2 cursor-pointer rounded-full backdrop-blur-md transition-all duration-300 ${
            isInWishlist ? "bg-accent text-primary" : "bg-white/20 text-white hover:bg-white/40"
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Heart size={14} className={isInWishlist ? "text-red-600 fill-current" : ""} />
          )}
        </button>
        {node.tags?.includes("bestseller") && (
          <div className="absolute top-4 left-4">
            <span className="bg-accent text-primary px-3 py-1 text-[8px] uppercase tracking-ultra font-bold">
              Essential
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-col items-start gap-0.5 px-2 pb-2">
        <h3
          className={`font-serif font-semibold text-sm 2xl:text-xl  transition-all duration-500  ${
            lightMode ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          {node.title}
        </h3>

        <div className="mt-1 flex items-center justify-between w-full">
          <div className="flex space-x-2 items-center w-full">
            {Number(variant?.price?.amount || 0) > 0 ? (
              <div className="flex justify-between w-full items-center gap-1">
                {Number(variant?.regularPrice) > 0 &&
                  Number(variant?.regularPrice) !== Number(variant?.price?.amount) && (
                    <span className="line-through font-medium text-[11px] text-muted-foreground">
                      {formatPrice(Number(variant?.regularPrice))}
                    </span>
                  )}
                <span
                  className={`font-medium text-[14px] flex justify-end items-center text-end ${lightMode ? "text-foreground" : "text-accent"}`}
                >
                  {variant
                    ? formatPrice(Number(variant.price.amount), variant.price.currencyCode)
                    : "—"}
                  <span className="text-[10px] normal-case">{getPriceSuffix(node.title)}</span>
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-[#1e2321] italic">
                Contact Us for Pricing & Customization
              </span>
            )}
          </div>

          {variant?.availableForSale === false && (
            <span className="text-[10px] uppercase text-gold tracking-widest">Sold out</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductSkeleton() {
  return (
    <div className="group block relative w-full border rounded">
      <div className="relative h-[370px] flex-shrink-0 overflow-hidden bg-secondary">
        <Skeleton className="h-full w-full rounded" />
      </div>
      <div className="mt-2 flex flex-col items-start gap-2 px-2 pb-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4 mt-1" />
      </div>
    </div>
  );
}
