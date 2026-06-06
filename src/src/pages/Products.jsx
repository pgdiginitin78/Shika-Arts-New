import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, STOREFRONT_QUERY } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
function ProductsPage() {
  const {
    data: products = [],
    isLoading
  } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const data = await storefrontApiRequest(STOREFRONT_QUERY, {
        first: 100,
        query: null
      });
      return data?.data?.products?.edges ?? [];
    }
  });
  return <div className="mx-auto w-full px-4 md:px-6 lg:px-12 py-6">
      <div className="mb-10 text-center">
        <span className="text-xs uppercase tracking-luxe text-muted-foreground">The Full Collection</span>
        <h1 className="mt-2 font-serif text-5xl">All Gifts</h1>
        <p className="mt-3 text-sm text-muted-foreground">{products.length} curated pieces</p>
      </div>
      {isLoading ? <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {Array.from({
        length: 8
      }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-secondary" />)}
        </div> : products.length === 0 ? <p className="text-center text-muted-foreground">No products found</p> : <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map(p => <ProductCard key={p.node.id} product={p} />)}
        </div>}
    </div>;
}

export default ProductsPage;