import { ProductCard } from "@/components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavbarMenus } from "../context/NavbarContext";
import { getProductsByCategory, getProductsByParentCategory } from "../services/LoginServices";
import DelicaciesBg from "../assets/Delicacies/DelicaciesBanner.png";
import DelicaciesMobileBg from "../assets/Delicacies/DelicaciesMobileBanner.png";

export default function Delicacies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [delicaciesCat, setDelicaciesCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navbarMenus = useNavbarMenus();

  const tagParam = searchParams.get("tag");
  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState("delicacies");
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState("parent");

  useEffect(() => {
    if (navbarMenus?.length > 0) {
      const found = navbarMenus.find((menu) => menu?.name === "Delicacies");
      setDelicaciesCat(found);
    }
  }, [navbarMenus]);

  useEffect(() => {
    if (tagParam && delicaciesCat) {
      setActiveTag(tagParam);
      let matched = null;
      delicaciesCat?.children?.forEach((menu) => {
        if (menu.slug === tagParam) {
          matched = menu;
        }
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
      setSelectedSlug("delicacies");
      setSelectedId(null);
      setFilterMode("parent");
    }
  }, [tagParam, delicaciesCat]);

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
    delicaciesCat?.children?.flatMap((category) => category.children || []) || [];

  const categoryTabs =
    delicaciesCat?.children && delicaciesCat.children.length > 0
      ? delicaciesCat.children
      : [
          { name: "Chocolate", slug: "chocolate" },
          { name: "Dry Fruits", slug: "dryfruit" },
        ];

  const decodeHtml = (text) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  };

  const handleTabClick = (name, slug) => {
    setActiveCategory(name);
    setSelectedSlug(slug);
    setSelectedId(null);
    setFilterMode("parent");
    setActiveTag("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#0f1716]">
      <div className="relative sm:h-[65dvh] md:h-[80dvh] lg:h-[83dvh] 2xl:h-[86dvh]  bg-[#7A1F3D]">
        <div className="hidden md:block inset-0 w-full h-full">
          <img
            src={DelicaciesBg}
            alt="Delicacies"
            className="w-full h-full object-cover"
          />
          {/* <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-b md:from-black/30 md:via-black/20 md:to-black/40" /> */}
        </div>
        <div className=" md:hidden absolute inset-0 w-full h-full">
          <img
            src={DelicaciesMobileBg}
            alt="Corporate Gifts"
            className="w-full h-full object-cover object-center md:object-top"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-b md:from-black/30 md:via-black/20 md:to-black/30" />
        </div>
      </div>

   <div className="w-full flex justify-center mt-5 px-4">
  <div
    className="
      inline-flex flex-wrap items-center justify-center gap-2
      p-2
      rounded-[12px]
      bg-white/55
      backdrop-blur-2xl
      border border-white/60
      shadow-[0_20px_60px_rgba(0,0,0,0.12)]
      ring-1 ring-black/5
    "
  >
    {/* All */}
    <button
      onClick={() => handleTabClick("All", "delicacies")}
      className={`cursor-pointer rounded px-7 py-3
      text-[13px] font-semibold tracking-wide
      transition-all duration-300 ease-out
      ${
        activeCategory === "All"
          ? "bg-black text-white shadow-lg"
          : "bg-transparent text-gray-800 hover:bg-white/70 hover:shadow-md"
      }`}
    >
      All
    </button>

    {categoryTabs.map((cat) => {
      const isActive = activeCategory === cat.name;

      return (
        <button
          key={cat.slug}
          onClick={() => handleTabClick(cat.name, cat.slug)}
          className={`cursor-pointer rounded px-7 py-3
          text-[13px] font-semibold tracking-wide
          transition-all duration-300 ease-out
          ${
            isActive
              ? "bg-black text-white shadow-lg"
              : "bg-transparent text-gray-800 hover:bg-white/70 hover:shadow-md"
          }`}
        >
          {decodeHtml(cat.name)}
        </button>
      );
    })}
  </div>
</div>
      <div
        id="product-grid"
        className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1620px] px-4 md:px-6 2xl:px-12 py-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <p className="text-[13px] text-gray-500 font-medium">
            Showing 1–{products.length} of {products.length} results
          </p>
          <div className="flex flex-wrap space-x-2 items-center">
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
                        ? delicaciesCat?.children?.find((c) => c.name === activeCategory)?.slug ||
                            "delicacies"
                        : "delicacies",
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
            {(activeTag || activeCategory !== "All") && (
              <button
                onClick={() => handleTabClick("All", "delicacies")}
                className="text-[13px] cursor-pointer text-destructive underline underline-offset-4 ml-2 hover:text-midnight transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
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
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 gap-y-10"
            >
              {products.map((p, index) => (
                <ProductCard key={index} product={p} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
