import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, Plus } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, productToNode } from "@/lib/woocommerce";

export function WishlistDrawer() {
  const { items, isOpen, setOpen, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const handleAddToCart = async (product) => {
    const node = productToNode(product);

    if (!node?.id) return;

    try {
      await addItemToCart({
        productId: node.id,
        handle: node.handle,
        product: node,
        quantity: 1,
      });

      setOpen(false);
      setCartOpen(true);
    } catch (error) {
      console.log(error);
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
          {items.length === 0 ? (
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
                  const variant = node?.variants?.edges?.[0]?.node;
                  const image = node?.images?.edges?.[0]?.node;

                  return (
                    <div
                      key={node?.id}
                      className="flex gap-4 rounded-sm border border-border p-3 group"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
                        {image?.url ? (
                          <img
                            src={image.url}
                            alt={node?.title || ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-2xl text-gold">
                            ✦
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="truncate font-serif text-base font-semibold">
                            {node?.title || ""}
                          </h4>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            {node?.productType || ""}
                          </p>
                          <p className="font-semibold text-sm">
                            {variant
                              ? formatPrice(
                                  Number(variant.price.amount),
                                  variant.price.currencyCode,
                                )
                              : "—"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 text-[10px] uppercase tracking-ultra h-8"
                            onClick={() => handleAddToCart(product)}
                          >
                            <Plus size={12} className="mr-1" /> Add to Cart
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => removeItem(node?.id)}
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
