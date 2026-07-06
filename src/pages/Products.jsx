import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/LoginServices";
import { normalizeProduct } from "@/lib/woocommerce";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";

function ProductsPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const data = await getProducts({ per_page: 100 });
      return data.map(normalizeProduct);
    },
  });

  return (
    <div className="mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-10 bg-[#FAF7F2] min-h-screen">
      <div className="mb-6 md:mb-10 text-center">
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">The Full Collection</span>
        <h1 className="mt-1 md:mt-2 font-serif text-3xl md:text-4xl lg:text-5xl text-[#1e2321]">All Gifts</h1>
        <p className="mt-2 md:mt-3 text-[11px] md:text-sm text-muted-foreground">{products.length} curated pieces</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 bg-white/50 h-full rounded-lg">
          <p className="text-sm md:text-base text-gray-500 uppercase tracking-widest">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;