import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import {
  getProductsByCategoryPage,
  getProductsByParentCategoryPage,
} from "../services/LoginServices";

export const PER_PAGE = 50;

/**
 * Shared infinite-scroll hook for all category pages.
 *
 * @param {"parent"|"exact"} filterMode
 * @param {string|null}      selectedSlug  – used when filterMode === "parent"
 * @param {number|null}      selectedId    – used when filterMode === "exact"
 *
 * Returns:
 *   products           – flat array of all loaded products
 *   total              – total product count reported by the API (first page)
 *   isLoading          – true only while the very first page is loading
 *   isFetchingNextPage – true while subsequent pages are loading
 *   hasNextPage        – false when all pages have been loaded
 *   sentinelRef        – attach to a <div> at the bottom of the list to trigger auto-load
 */
export function useInfiniteProducts(filterMode, selectedSlug, selectedId) {
  const isExact = filterMode === "exact" && !!selectedId;

  const queryKey = isExact
    ? ["products", "cat-exact", selectedId]
    : ["products", "cat-parent", selectedSlug];

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (isExact) {
        return getProductsByCategoryPage(selectedId, pageParam, PER_PAGE);
      }
      return getProductsByParentCategoryPage(selectedSlug, pageParam, PER_PAGE);
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Number(lastPage?.pages ?? 1);
      const next = allPages.length + 1;
      return next <= totalPages ? next : undefined;
    },
    enabled: isExact ? !!selectedId : !!selectedSlug,
    staleTime: 5 * 60 * 1000,
  });

  const products = (data?.pages ?? []).flatMap((page) => page?.products ?? []);
  const total = data?.pages?.[0]?.total ?? 0;

  // ── IntersectionObserver sentinel ──────────────────────────────────────────
  const sentinelRef = useRef(null);

  const onVisible = useCallback(
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
    const observer = new IntersectionObserver(onVisible, { rootMargin: "300px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  return {
    products,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    sentinelRef,
    PER_PAGE,
  };
}
