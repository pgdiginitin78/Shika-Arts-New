import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/woocommerce";
import { addToWishlistApi } from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import {
  CreditCard,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


export function CartDrawer() {
  const { items, isOpen, setOpen, isLoading, isSyncing, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];

  console.log("CartDrawer items:", safeItems);

const moveToWishlist = async (item) => {
  try {
    await addToWishlistApi({
      ...item,
      quantity: item.quantity, 
    });
    await useWishlistStore.getState().fetchWishlist();
    await removeItem(item.key);
    toast.success("Moved to wishlist");
  } catch (error) {
    console.error("Failed to move item to wishlist:", error);
    toast.error("Couldn't move item to wishlist. Please try again.");
  }
};

  const totalItems = safeItems.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);

  const totalPrice = safeItems.reduce((sum, item) => {
    const minorUnit = Number(item?.prices?.currency_minor_unit ?? 2);
    const divisor = 10 ** minorUnit;
    const lineTotalMinor =
      item?.totals?.line_total != null
        ? Number(item.totals.line_total)
        : Number(item?.prices?.price || 0) * Number(item?.quantity || 0);

    return sum + lineTotalMinor / divisor;
  }, 0);

  const currency = safeItems?.[0]?.prices?.currency_code || "INR";

  const getUnitPrice = (item) => {
    const minorUnit = Number(item?.prices?.currency_minor_unit ?? 2);
    const divisor = 10 ** minorUnit;
    return Number(item?.prices?.price || 0) / divisor;
  };

  const getVariationLabel = (item) => {
    if (Array.isArray(item?.variation) && item.variation.length > 0) {
      return item.variation
        .map((v) => v?.value)
        .filter(Boolean)
        .join(" / ");
    }
    return item?.sku || "";
  };

  const getMinQty = (item) => Number(item?.quantity_limits?.minimum ?? 1);
  const getMaxQty = (item) => Number(item?.quantity_limits?.maximum ?? Infinity);
  const getStep = (item) => Number(item?.quantity_limits?.multiple_of ?? 1);

  const handleCheckout = () => {
    if (!safeItems.length) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to proceed with payment.");
      return;
    }

    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-serif text-2xl">Your Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Your cart is empty"
              : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col pt-6 min-h-0">
          {safeItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nothing here yet — start exploring.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2">
                <div className="space-y-4">
                  {safeItems.map((item) => {
                    const minQty = getMinQty(item);
                    const maxQty = getMaxQty(item);
                    const step = getStep(item);
                    const quantity = Number(item?.quantity || 0);

                    return (
                      <div
                        key={item?.key}
                        className="flex flex-col gap-3 rounded-sm border border-border p-3"
                      >
                        <div className="flex gap-3">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
                            {item?.images?.[0]?.src ? (
                              <img
                                src={item.images[0].src}
                                alt={item?.name || ""}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-2xl text-gold">
                                ✦
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="break-words font-serif text-base font-semibold leading-snug">
                              {item?.name || ""}
                            </h4>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {getVariationLabel(item)}
                            </p>
                            <p className="mt-1 font-semibold">
                              {formatPrice(getUnitPrice(item), item?.prices?.currency_code || "INR")}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 border-t border-border pt-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 px-2.5 text-xs"
                              onClick={() => moveToWishlist(item)}
                              disabled={isLoading || isCheckingOut}
                            >
                              <Heart className="h-3.5 w-3.5 text-red-500" />
                              Move to Wishlist
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 px-2.5 text-xs text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.key)}
                              disabled={isLoading || isCheckingOut}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-xs text-muted-foreground">Qty</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item?.key, quantity - step)}
                                disabled={isLoading || isCheckingOut || quantity - step < minQty}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>

                              <span className="w-7 text-center text-sm">{quantity}</span>

                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item?.key, quantity + step)}
                                disabled={isLoading || isCheckingOut || quantity + step > maxQty}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-shrink-0 space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg">Subtotal</span>
                  <span className="font-serif text-xl font-bold sm:text-2xl">
                    {formatPrice(totalPrice, currency)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Taxes &amp; delivery calculated at checkout.
                </p>

                <Button
                  id="razorpay-checkout-btn"
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  disabled={isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600" strokeWidth={2} />
                  Secured by Razorpay · UPI · Cards · Net Banking
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}