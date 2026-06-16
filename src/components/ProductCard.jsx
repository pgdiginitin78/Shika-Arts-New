import { Link } from "react-router-dom";
import { Loader2, Plus, Heart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { formatPrice, productToNode } from "@/lib/woocommerce";
import { motion } from "framer-motion";

export function ProductCard({ product, lightMode = true }) {
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoading = useCartStore((s) => s.isLoading);

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
  console.log("node1212", node);

  console.log("product raw", product);
  console.log("node after transform", node);
  console.log("image", node?.images?.edges?.[0]?.node);
  const productId = node?.id || "";
  const variant = node?.variants?.edges?.[0]?.node;
  const image = node?.images?.edges?.[0]?.node;

  console.log("variant", variant);

  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId));

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variant) return;

    await addItem({
      productId: node.id,
      handle: node.handle,
      product: node,
      quantity: 1,
    });

    setOpen(true);
  };
console.log("nodehandle", node,product);
  return (
    <Link
      to={`/product/${node.handle || node.id}`}
      className="group block relative w-full border rounded"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary shine-effect">
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
          <button
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
        </div>
        <button
          onClick={handleWishlist}
          className={`absolute top-1 right-2 z-20 p-2 cursor-pointer rounded-full backdrop-blur-md transition-all duration-300 ${
            isInWishlist ? "bg-accent text-primary" : "bg-white/20 text-white hover:bg-white/40"
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} className={isInWishlist ? "text-red-600 fill-current" : ""} />
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
        {/* <span
          className={`text-[8px] 2xl:text-sm uppercase tracking-ultra ${
            lightMode ? "text-muted-foreground" : "text-accent/60"
          }`}
        >
          {node.productType || ""}
        </span> */}

        <h3
          className={`font-serif text-sm 2xl:text-xl leading-tight transition-all duration-500 group-hover:italic ${
            lightMode ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          {node.title}
        </h3>

        <div className="mt-1 flex items-center justify-between w-full">
          <div className="flex space-x-2 items-center">
            <span className="line-through font-medium text-[11px] text-muted-foreground">
              {formatPrice(Number(variant.regularPrice))}
            </span>
            <span
              className={`font-medium text-[11px] ${lightMode ? "text-foreground" : "text-accent"}`}
            >
              {variant
                ? formatPrice(Number(variant.price.amount), variant.price.currencyCode)
                : "—"}
            </span>
          </div>

          {variant?.availableForSale === false && (
            <span className="text-[10px] uppercase text-gold tracking-widest">Sold out</span>
          )}
        </div>
      </div>
    </Link>
  );
}
