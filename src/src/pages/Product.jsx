import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Truck, ShieldCheck, Sparkles, ArrowLeft, Heart } from "lucide-react";
import { getCategoryByType } from "@/lib/categories";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "sonner";
function ProductDetailPage() {
  const {
    handle
  } = useParams();
  const addItem = useCartStore(s => s.addItem);
  const setOpen = useCartStore(s => s.setOpen);
  const isLoading = useCartStore(s => s.isLoading);
  const toggleWishlist = useWishlistStore(s => s.toggleItem);
  const [qty, setQty] = useState(1);
  const {
    data,
    isLoading: loading
  } = useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, {
        handle
      });
      const p = res?.data?.product;
      if (!p) return null;
      return {
        node: p
      };
    }
  });

  const isInWishlist = useWishlistStore(s => s.isInWishlist(data?.node?.id));
  if (loading) {
    return <div className="mx-auto max-w-7xl animate-pulse px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square rounded-sm bg-secondary" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-secondary" />
            <div className="h-12 w-full bg-secondary" />
            <div className="h-32 w-full bg-secondary" />
          </div>
        </div>
      </div>;
  }
  if (!data) return <div>Product not found</div>;
  const node = data.node;
  const variant = node.variants.edges[0]?.node;
  const image = node.images.edges[0]?.node;
  const cat = getCategoryByType(node.productType);
  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: data,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: qty,
      selectedOptions: variant.selectedOptions || []
    });
    setOpen(true);
  };
  return <div className="mx-auto w-full px-4 lg:px-12 md:px-6 py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to all gifts
      </Link>
      <div className="mt-6 grid gap-12 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-sm border border-border bg-gradient-to-br from-amber-100 via-rose-100 to-stone-100 shadow-card">
          {image ? <img src={image.url} alt={image.altText ?? node.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full flex-col items-center justify-center">
              <span className="font-serif text-[12rem] text-gold">{cat?.icon ?? "✦"}</span>
              <span className="text-xs uppercase tracking-luxe text-primary/70">{node.productType}</span>
            </div>}
        </div>
        <div>
          <span className="text-xs uppercase tracking-luxe text-muted-foreground">{node.productType}</span>
          <h1 className="mt-2 font-serif text-5xl leading-tight">{node.title}</h1>
          {variant && <div className="mt-4 font-serif text-3xl font-bold">
              {formatPrice(variant.price.amount, variant.price.currencyCode)}
            </div>}
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{node.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-sm border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-secondary">−</button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 hover:bg-secondary">+</button>
            </div>
            <Button onClick={handleAdd} disabled={isLoading || !variant} size="lg" className="flex-1">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart</>}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`px-4 ${isInWishlist ? "text-red-500 border-red-200 bg-red-50" : ""}`}
              onClick={() => toggleWishlist(data)}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t pt-8 text-sm">
            <div className="text-center">
              <Truck className="mx-auto h-5 w-5 text-gold" />
              <div className="mt-2 text-xs">Same-day delivery</div>
            </div>
            <div className="text-center">
              <Sparkles className="mx-auto h-5 w-5 text-gold" />
              <div className="mt-2 text-xs">Hand-finished</div>
            </div>
            <div className="text-center">
              <ShieldCheck className="mx-auto h-5 w-5 text-gold" />
              <div className="mt-2 text-xs">Quality guaranteed</div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}

export default ProductDetailPage;