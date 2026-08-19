import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EarthWorthBanner from "../assets/EarthWorthBanner.webp";
import { useNavbarMenus } from "../context/NavbarContext";
import { useInfiniteProducts } from "../hooks/useInfiniteProducts";

export default function EarthWorth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [corporateCat, setCorporateCat] = useState(null);
  const navbarMenus = useNavbarMenus();

  const tagParam = searchParams.get("tag");
  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState("earthworth");
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState("parent");

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (navbarMenus?.length > 0) {
      const found = navbarMenus.find((menu) => menu?.name === "EarthWorth");
      setCorporateCat(found);
    }
  }, [navbarMenus]);

  useEffect(() => {
    if (tagParam && corporateCat) {
      setActiveTag(tagParam);
      let matched = null;
      corporateCat?.children?.forEach((menu) => {
        const found = menu.children?.find((s) => s.slug === tagParam);
        if (found) {
          matched = found;
        }
      });
      if (matched) {
        setSelectedSlug(matched.slug);
        setSelectedId(matched.id);
        setFilterMode("exact");
      }
    } else {
      setActiveTag("");
      setActiveCategory("All");
      setSelectedSlug("earthworth");
      setSelectedId(null);
      setFilterMode("parent");
    }
  }, [tagParam, corporateCat]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (activeTag) {
        setTimeout(() => {
          const grid = document.getElementById("product-grid");
          if (grid) {
            const y = grid.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 100);
      }
      return;
    }

    const grid = document.getElementById("product-grid");
    if (grid) {
      const y = grid.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [activeTag, activeCategory]);

  const { products, total, isLoading, isFetchingNextPage, hasNextPage, sentinelRef } =
    useInfiniteProducts(filterMode, selectedSlug, selectedId);

  const subCategoriesToShow =
    activeCategory === "All"
      ? corporateCat?.children?.flatMap((category) => category.children || []) || []
      : corporateCat?.children?.find((c) => c.name === activeCategory)?.children || [];

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#0f1716]">
      <div className="relative w-full h-[60dvh] sm:h-[65dvh] md:h-[80dvh] lg:h-[83dvh] 2xl:h-[86dvh]  flex items-center justify-center md:justify-start overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={EarthWorthBanner}
            alt="Earth Worth Gifts"
            className="w-full h-full object-cover object-left md:object-center lg:object-top "
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>

      <div id="product-grid" className="mx-auto w-full px-4 md:px-6 lg:px-7 py-12">
        <div className="flex-1 min-h-[50vh]">
          <div className="flex flex-col sm:flex-row sm:items-center  gap-4 mb-8">
            <p className="text-[13px] text-gray-500 font-medium">
              Showing {products.length} of {total || products.length} results
            </p>
            <div className="flex space-x-2 items-center">
              {activeTag && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive text-white rounded-full text-xs font-medium">
                  {subCategoriesToShow.find((s) => s.slug === activeTag)?.name || activeTag}
                  <button
                    onClick={() => {
                      setActiveTag("");
                      setSelectedId(null);
                      setFilterMode("parent");
                      setSelectedSlug(
                        activeCategory !== "All"
                          ? corporateCat?.children?.find((c) => c.name === activeCategory)?.slug ||
                              "earthworth"
                          : "earthworth",
                      );
                      setSearchParams({});
                    }}
                    className="hover:text-gray-200 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setActiveTag("");
                  setSelectedSlug("earthworth");
                  setSelectedId(null);
                  setFilterMode("parent");
                  setSearchParams({});
                }}
                className="text-[13px] cursor-pointer text-destructive underline underline-offset-4 ml-2 hover:text-midnight transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 gap-y-10">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-300 bg-white/50 rounded-lg"
            >
              <p className="text-lg text-gray-500 uppercase tracking-widest mb-4">
                No products found for this category yet.
              </p>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory + activeTag}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 gap-y-10"
                >
                  {products.map((p, index) => (
                    <ProductCard key={p.id || index} product={p} />
                  ))}
                  {isFetchingNextPage &&
                    Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={`sk-${i}`} />)}
                </motion.div>
              </AnimatePresence>

              <div ref={sentinelRef} className="h-1" aria-hidden="true" />

              {!hasNextPage && products.length > 0 && (
                <p className="mt-10 text-center text-xs text-muted-foreground uppercase tracking-widest">
                  You&#39;ve seen all {products.length} pieces ✦
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}