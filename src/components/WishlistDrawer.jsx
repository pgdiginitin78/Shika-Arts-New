import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, Plus, Loader2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlistStore, getProductKey } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, productToNode } from "@/lib/woocommerce";
import { removeFromWishlistApi } from "@/services/orderService";
import { toast } from "sonner";

function getWishlistImage(product, node) {
  const graphqlImage = node?.images?.edges?.[0]?.node?.url;
  if (graphqlImage) return graphqlImage;
  if (Array.isArray(product?.images) && product.images[0]?.src) {
    return product.images[0].src;
  }
  return null;
}

function getWishlistTitle(product, node) {
  return node?.title || product?.title || product?.name || "";
}

function getWishlistType(product, node) {
  return node?.productType || product?.productType || "";
}

function getWishlistVariationLabel(product) {
  if (Array.isArray(product?.variation) && product.variation.length > 0) {
    return product.variation
      .map((v) => {
        if (!v?.value) return null;
        return v?.attribute ? `${v.attribute}: ${v.value}` : v.value;
      })
      .filter(Boolean)
      .join(" / ");
  }
  return product?.sku || "";
}

function getWishlistPrice(product, node) {
  const variant = node?.variants?.edges?.[0]?.node;
  if (variant?.price?.amount != null) {
    return formatPrice(Number(variant.price.amount), variant.price.currencyCode);
  }
  if (product?.prices?.price != null) {
    const minorUnit = Number(product.prices.currency_minor_unit ?? 2);
    const divisor = 10 ** minorUnit;
    const amount = Number(product.prices.price) / divisor;
    return formatPrice(amount, product.prices.currency_code || "INR");
  }
  return "—";
}

function getWishlistHandle(product, node) {
  return node?.handle || node?.slug || product?.handle || product?.slug || "";
}

export function WishlistDrawer() {
  const { items, isOpen, setOpen, fetchWishlist, isLoading } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchWishlist();
    }
  }, [isOpen, fetchWishlist]);

  const handleAddToCart = async (product) => {
    const node = productToNode(product);
    const id = node?.id || product?.id || product?.productId;
    const variationId = product?.variation_id ?? product?.variationId ?? 0;

    if (!id) return;

    const itemKey = getProductKey(product);

    setBusyId(itemKey);
    useWishlistStore.getState().removeItemOptimistic(itemKey);

    try {
      await addItemToCart({
        productId: id,
        variationId: product?.variationId,
        handle: node?.handle,
        product: node,
        quantity: product?.quantity || 1,
      });

      await removeFromWishlistApi(id, variationId);

      setOpen(false);
      setCartOpen(true);
    } catch (error) {
      console.error("Failed to add wishlist item to cart:", error);
      toast.error("Couldn't add item to cart. Please try again.");
      await useWishlistStore.getState().fetchWishlist();
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (product) => {
    const id = product?.id || product?.product_id || product?.productId;
    const variationId = product?.variation_id ?? product?.variationId ?? 0;
    const itemKey = getProductKey(product);

    setBusyId(itemKey);
    useWishlistStore.getState().removeItemOptimistic(itemKey);

    try {
      await removeFromWishlistApi(id, variationId);
    } catch (error) {
      console.error("Failed to remove item from wishlist on server:", error);
      toast.error("Couldn't remove item. Please try again.");
      await useWishlistStore.getState().fetchWishlist();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-serif text-2xl">Your Wishlist</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Your wishlist is empty"
              : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col pt-6 min-h-0">
          {isLoading && items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">
                  No favorites yet. Start building your collection.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="space-y-4">
                {items.map((product) => {
                  const node = productToNode(product);
                  const itemKey = getProductKey(product);
                  const image = getWishlistImage(product, node);
                  const title = getWishlistTitle(product, node);
                  const productType = getWishlistType(product, node);
                  const variationLabel = getWishlistVariationLabel(product);
                  const price = getWishlistPrice(product, node);
                  const handle = getWishlistHandle(product, node);
                  const isBusy = busyId === itemKey;

                  return (
                    <div
                      key={itemKey}
                      className="flex gap-4 rounded-sm border border-border p-3 group"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
                        {image ? (
                          <img src={image} alt={title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-2xl text-gold">
                            ✦
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="truncate font-serif text-base font-semibold">
                            {title}
                          </h4>
                          {productType && (
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                              {productType}
                            </p>
                          )}
                          {variationLabel && (
                            <p className="text-xs text-muted-foreground">
                              {variationLabel}
                            </p>
                          )}
                          <p className="font-semibold text-sm">{price}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 text-[10px] uppercase tracking-ultra h-8"
                            onClick={() => handleAddToCart(product)}
                            disabled={isBusy}
                          >
                            {isBusy ? (
                              <Loader2 size={12} className="mr-1 animate-spin" />
                            ) : (
                              <Plus size={12} className="mr-1" />
                            )}
                            Add to Cart
                          </Button>
                          
                          {handle && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              asChild
                            >
                              <Link to={`/product/${handle}`} onClick={() => setOpen(false)} title="View Details">
                                <Eye size={14} className="text-muted-foreground hover:text-foreground" />
                              </Link>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => handleRemove(product)}
                            disabled={isBusy}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}