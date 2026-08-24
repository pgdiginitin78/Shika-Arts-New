import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "@/lib/categories";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { useNavbarMenus } from "../context/NavbarContext";
import { getProductsByCategory, getProductsByParentCategory } from "../services/LoginServices";

function CategoryPage() {
  const { slug } = useParams();
  const cat = getCategoryBySlug(slug);
  const [searchParams] = useSearchParams();
  const tagParam = searchParams.get("tag");
  const navbarMenus = useNavbarMenus();

  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [selectedSlug, setSelectedSlug] = useState(slug);
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState("parent");

  const activeCategory = navbarMenus.find(
    (c) => c.slug === slug || c.slug?.toLowerCase() === slug?.toLowerCase(),
  );
  const menuData = activeCategory?.children?.length ? activeCategory.children : null;

  useEffect(() => {
    setSelectedSlug(slug);
    setSelectedId(null);
    setFilterMode("parent");
    setActiveTag("");
  }, [slug]);

  useEffect(() => {
    if (!tagParam || !menuData) {
      return;
    }
    let matched = null;
    menuData.forEach((section) => {
      const found = section.children?.find((item) => item.slug === tagParam);
      if (found) {
        matched = found;
      }
    });
    if (matched) {
      setActiveTag(matched.slug);
      setSelectedSlug(matched.slug);
      setSelectedId(matched.id);
      setFilterMode("exact");
    }
  }, [tagParam, menuData]);

  useEffect(() => {
    if (activeTag) {
      const grid = document.getElementById("product-grid");
      if (grid) {
        const y = grid.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTag, slug]);

  const displayTitle = cat
    ? cat.label
    : slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "category", selectedSlug, selectedId, filterMode],
    queryFn: async () => {
      if (filterMode === "exact" && selectedId) {
        const res = await getProductsByCategory(selectedId);
        return Array.isArray(res) ? res : [];
      }
      if (!selectedSlug) {
        return [];
      }
      const res = await getProductsByParentCategory(selectedSlug);
      return res.products || [];
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 md:py-16">
      <div id="product-grid" className="mx-auto w-full px-4 md:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl text-[#0f1716] uppercase tracking-wider">
            {displayTitle}
          </h1>
          {cat?.tagline && (
            <p className="mt-4 text-sm md:text-base text-muted-foreground uppercase tracking-widest">
              {cat.tagline}
            </p>
          )}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {menuData && (
            <div className="w-full lg:w-1/4 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 bg-white p-6 shadow-sm border border-border"
              >
                <button
                  onClick={() => {
                    setActiveTag("");
                    setSelectedSlug(slug);
                    setSelectedId(null);
                    setFilterMode("parent");
                  }}
                  className={`w-full text-left font-serif text-xl md:text-2xl italic mb-6 transition-colors ${
                    activeTag === "" ? "text-destructive" : "text-foreground hover:text-destructive"
                  }`}
                >
                  All {displayTitle}
                </button>

                <div className="space-y-8">
                  {menuData.map((section, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <h4 className="text-[14px] uppercase tracking-widest font-bold text-muted-foreground border-b border-border pb-2">
                        {section.name.replace(/&amp;/g, "&")}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {(section.children ?? []).map((item, i) => {
                          const isActive = activeTag === item.slug;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setActiveTag(item.slug);
                                setSelectedSlug(item.slug);
                                setSelectedId(item.id);
                                setFilterMode("exact");
                              }}
                              className={`text-left text-[14px] uppercase tracking-wider transition-colors ${
                                isActive
                                  ? "text-destructive font-semibold"
                                  : "text-foreground hover:text-destructive"
                              }`}
                            >
                              {item.name.replace(/&amp;/g, "&")}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          <div className={`w-full ${menuData ? "lg:w-3/4" : ""} min-h-[50vh]`}>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border bg-white/50 h-full"
              >
                <p className="text-lg text-muted-foreground uppercase tracking-widest mb-4">
                  No products found in this collection yet.
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTag}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 ${
                    menuData
                      ? "md:grid-cols-3 lg:gap-x-8"
                      : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-4"
                  }`}
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
    </div>
  );
}

export default CategoryPage;
