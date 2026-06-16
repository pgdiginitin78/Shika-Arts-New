import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/woocommerce";

export function CartDrawer() {
  const { items, isOpen, setOpen, isLoading, isSyncing, updateQuantity, removeItem } =
    useCartStore();

  const totalItems = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);

  const totalPrice = items.reduce((sum, item) => {
    const minorUnit = Number(item?.prices?.currency_minor_unit ?? 2);
    const lineTotalMinor =
      item?.totals?.line_total != null
        ? Number(item.totals.line_total)
        : Number(item?.prices?.price || 0) * Number(item?.quantity || 0);

    return sum + lineTotalMinor / 10 ** minorUnit;
  }, 0);

  const currency = items?.[0]?.prices?.currency_code || "INR";

  const handleCheckout = () => {
    setOpen(false);
    window.location.href = "https://tan-cattle-873141.hostingersite.com/checkout";
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
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nothing here yet — start exploring.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item?.key} className="flex gap-4 rounded-sm border border-border p-3">
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

                      <div className="flex-1 min-w-0">
                        <h4 className="truncate font-serif text-base font-semibold">
                          {item?.name || ""}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item?.variation?.[0]?.value || item?.sku || ""}
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatPrice(
                            Number(item?.prices?.price || 0) /
                              10 ** Number(item?.prices?.currency_minor_unit ?? 2),
                            item?.prices?.currency_code || "INR",
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(item?.key)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item?.key, item?.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="w-7 text-center text-sm">{item?.quantity}</span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item?.key, item?.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0 space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg">Subtotal</span>
                  <span className="font-serif text-2xl font-bold">
                    {formatPrice(totalPrice, currency)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Taxes & delivery calculated at checkout.
                </p>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  disabled={isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Secure Checkout
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
