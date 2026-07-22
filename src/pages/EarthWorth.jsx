import { ProductCard } from "@/components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EarthWorthBanner from "../assets/EarthWorthBanner.webp";
import { useNavbarMenus } from "../context/NavbarContext";
import { getProductsByCategory, getProductsByParentCategory } from "../services/LoginServices";

export default function EarthWorth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [corporateCat, setCorporateCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navbarMenus = useNavbarMenus();

  const tagParam = searchParams.get("tag");
  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState("earthworth");
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState("parent");

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
          setActiveCategory(menu.name);
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

  const isFirstRender = useRef(true);

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

  useEffect(() => {
    setIsLoading(true);

    if (filterMode === "exact" && selectedId) {
      getProductsByCategory(selectedId)
        .then((res) => {
          setProducts(Array.isArray(res) ? res : []);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    } else {
      if (!selectedSlug) {
        setIsLoading(false);
        return;
      }
      getProductsByParentCategory(selectedSlug)
        .then((res) => {
          setProducts(res.products);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [selectedSlug, selectedId, filterMode]);

  const subCategoriesToShow =
    activeCategory === "All"
      ? corporateCat?.children?.flatMap((category) => category.children || []) || []
      : corporateCat?.children?.find((c) => c.name === activeCategory)?.children || [];

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#0f1716]">
      <div className="relative w-full h-[60vh] md:h-[80vh]  lg:h-screen  flex items-center justify-center md:justify-start overflow-hidden">
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
              Showing 1–{products.length} of {products.length} results
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-gray-200" />
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
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + activeTag}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5  gap-3 gap-y-10"
              >
                {products.map((p, index) => (
                  <ProductCard key={index} product={p} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
