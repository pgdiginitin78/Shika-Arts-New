import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProductsPage } from "../services/LoginServices";
import { normalizeProduct } from "@/lib/woocommerce";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";

const PER_PAGE = 50;

function AllProducts() {
  const sentinelRef = useRef(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["products", "all-infinite"],
    queryFn: ({ pageParam = 1 }) => getProductsPage({ page: pageParam, per_page: PER_PAGE }),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Number(lastPage?.pages ?? 1);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = (data?.pages ?? []).flatMap((page) =>
    (page?.products ?? []).map(normalizeProduct),
  );

  const total = data?.pages?.[0]?.total ?? 0;

  const onSentinelVisible = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onSentinelVisible, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onSentinelVisible]);

  return (
    <div className="mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 2xl:px-10 py-6 md:py-10 bg-[#FAF7F2] min-h-screen">
      <div className="mb-6 md:mb-10 text-center">
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">
          The Full Collection
        </span>
        <h1 className="mt-1 md:mt-2 font-serif text-3xl md:text-4xl lg:text-5xl text-[#1e2321]">
          All Gifts
        </h1>
        <p className="mt-2 md:mt-3 text-[11px] md:text-sm text-muted-foreground">
          {total > 0 ? `${total} curated pieces` : isLoading ? "Loading…" : "0 curated pieces"}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: PER_PAGE }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 bg-white/50 h-full rounded-lg">
          <p className="text-sm md:text-base text-gray-500 uppercase tracking-widest">
            No products found
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}

            {isFetchingNextPage &&
              Array.from({ length: PER_PAGE }).map((_, i) => <ProductSkeleton key={`sk-${i}`} />)}
          </div>

          <div ref={sentinelRef} className="h-1" aria-hidden="true" />

          {!hasNextPage && products.length > 0 && (
            <p className="mt-10 text-center text-xs text-muted-foreground uppercase tracking-widest">
              You've seen all {products.length} pieces ✦
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default AllProducts;
