import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavbarMenus } from "../context/NavbarContext";
import { useInfiniteProducts } from "../hooks/useInfiniteProducts";
import PremiumBg from "../assets/premiumGift/Premium_Gifts.webp";
import PremiumGiftsMobile from "../assets/premiumGift/Premium_Gifts-Mobile.webp";
import { Grip, Hexagon, Box, Leaf, CircleDot } from "lucide-react";

const HandmadeIcon = ({ size = 15, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="6.2" r="2.4" />
    <path d="M9 10.2c-1.6.9-2.7 2.3-3.2 4" />
    <path d="M15 10.2c1.6.9 2.7 2.3 3.2 4" />
    <path d="M9 10.2c1 1.6 1.4 3.2 1.1 4.8" />
    <path d="M15 10.2c-1 1.6-1.4 3.2-1.1 4.8" />
    <path d="M4.8 15.5h14.4" />
    <path d="M6.5 15.5v2.6c0 .4.3.7.7.7h9.6c.4 0 .7-.3.7-.7v-2.6" />
    <path d="M9.6 12.6c.9-.5 1.9-.5 2.4 0 .5-.5 1.5-.5 2.4 0" strokeWidth="1.1" />
  </svg>
);

const decodeHtml = (text) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
};

const getCategoryIcon = (name, active = false, depth = 0) => {
  const n = (name || "").toLowerCase();
  const cls = `${active ? "text-[#C5A26F]" : "opacity-70 text-[#1e2321]"}`;
  if (depth > 0) {
    return <CircleDot size={depth > 1 ? 10 : 12} strokeWidth={1.5} className={cls} />;
  }
  if (n.includes("all")) return <Grip size={15} strokeWidth={1.5} className={cls} />;
  if (n.includes("cane")) return <Leaf size={15} strokeWidth={1.5} className={cls} />;
  if (n.includes("cork")) return <CircleDot size={15} strokeWidth={1.5} className={cls} />;
  if (n.includes("hand-made") || n.includes("handmade"))
    return <HandmadeIcon size={15} className={cls} />;
  if (n.includes("marble")) return <Hexagon size={15} strokeWidth={1.5} className={cls} />;
  if (n.includes("metal")) return <Box size={15} strokeWidth={1.5} className={cls} />;
  return <CircleDot size={15} strokeWidth={1.5} className={cls} />;
};

const findCategoryBySlug = (nodes, slug) => {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.slug === slug) return node;
    const found = findCategoryBySlug(node.children, slug);
    if (found) return found;
  }
  return null;
};

function CategoryTree({ node, depth, activeTag, onSelect }) {
  const isActive = activeTag === node.slug;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        className={`flex items-center gap-3 cursor-pointer group px-3 rounded-[4px] transition-all shrink-0 whitespace-nowrap lg:whitespace-normal lg:shrink ${
          depth > 1 ? "py-1.5" : "py-2"
        } ${
          isActive
            ? "bg-[#F5EFE6] border-l-[3px] border-[#C5A26F]"
            : "border-l-[3px] border-transparent hover:bg-gray-50"
        }`}
        style={{ marginLeft: depth > 0 ? depth * 16 : 0 }}
        onClick={() => onSelect(node)}
      >
        <div
          className={`flex items-center justify-center ${
            depth > 1 ? "w-3 h-3" : "w-5 h-5"
          }`}
        >
          {getCategoryIcon(node.name, isActive, depth)}
        </div>
        <span
          className={`transition-colors flex-1 ${depth > 1 ? "text-[12px]" : "text-[13px]"} ${
            isActive ? "text-[#1e2321] font-semibold" : "text-gray-500 group-hover:text-[#1e2321]"
          }`}
        >
          {decodeHtml(node.name)}
        </span>
        {isActive && <span className="text-[10px] font-bold text-[#C5A26F]">✓</span>}
      </label>
      {hasChildren && (
        <div className="flex flex-col gap-1">
          {node.children.map((child) => (
            <CategoryTree
              key={child.id}
              node={child}
              depth={depth + 1}
              activeTag={activeTag}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PremiumGifts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [premiumCat, setPremiumCat] = useState(null);
  const navbarMenus = useNavbarMenus();

  const tagParam = searchParams.get("tag");
  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [selectedSlug, setSelectedSlug] = useState("premium-gifts");
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState("parent");

  useEffect(() => {
    if (navbarMenus?.length > 0) {
      const found = navbarMenus.find((menu) => menu?.name === "Premium Gifts");
      setPremiumCat(found);
    }
  }, [navbarMenus]);

  useEffect(() => {
    if (tagParam && premiumCat) {
      setActiveTag(tagParam);
      const matched = findCategoryBySlug(premiumCat?.children, tagParam);
      if (matched) {
        setSelectedSlug(matched.slug);
        setSelectedId(matched.id);
        setFilterMode("exact");
      } else {
        setSelectedSlug("premium-gifts");
        setSelectedId(null);
        setFilterMode("parent");
      }
    } else {
      setActiveTag("");
      setSelectedSlug("premium-gifts");
      setSelectedId(null);
      setFilterMode("parent");
    }
  }, [tagParam, premiumCat]);

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
  }, [activeTag]);

  const { products, total, isLoading, isFetchingNextPage, hasNextPage, sentinelRef } =
    useInfiniteProducts(filterMode, selectedSlug, selectedId);

  const subCategoriesToShow = premiumCat?.children || [];

  const clearFilters = () => {
    setActiveTag("");
    setSelectedSlug("premium-gifts");
    setSelectedId(null);
    setFilterMode("parent");
    setSearchParams({});
  };

  const selectCategory = (node) => {
    setActiveTag(node.slug);
    setSelectedId(node.id);
    setSelectedSlug(node.slug);
    setFilterMode("exact");
    setSearchParams({ tag: node.slug });
  };

  const findActiveCategoryLabel = () => {
    const match = findCategoryBySlug(subCategoriesToShow, activeTag);
    return match ? decodeHtml(match.name) : activeTag;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#0f1716]">
      <div className="relative w-full h-[70dvh] sm:h-[65dvh] md:h-[80dvh] lg:h-[83dvh] 2xl:h-[86dvh] min-h-[400px] flex items-center justify-center md:justify-start overflow-hidden">
        <div className="absolute hidden md:block inset-0 w-full h-full">
          <img
            src={PremiumBg}
            alt="Premium Gifts"
            className="w-full h-full object-cover object-center md:object"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent pointer-events-none" />
        </div>
        <div className="absolute inset-0 w-full h-full md:hidden">
          <img
            src={PremiumGiftsMobile}
            alt="Premium Gifts"
            className="w-full h-full object-cover object-center md:object"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1620px] mx-auto px-4 sm:px-8 md:px-16 lg:px-14 2xl:px-6 flex flex-col items-center md:items-start mt-16 md:mt-0">
          <div className="max-w-2xl 2xl:max-w-4xl flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-white uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold mb-4 md:mb-6 block">
              EXCLUSIVE COLLECTIONS
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-serif text-white mb-4 leading-[1.15]">
              Premium Gifts
              <br />
              Crafted to Perfection
            </h1>
            <div className="flex items-center gap-3 mb-6 max-w-[280px]">
              <div className="h-[1px] bg-white flex-1"></div>
              <svg
                width="8"
                height="8"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 0L8.13685 5.86315L14 7L8.13685 8.13685L7 14L5.86315 8.13685L0 7L5.86315 5.86315L7 0Z"
                  fill="#C5A26F"
                />
              </svg>
              <div className="h-[1px] bg-white flex-1"></div>
            </div>

            <p className="text-white/80 text-xs md:text-sm 2xl:text-lg max-w-[400px] 2xl:max-w-[600px] leading-relaxed font-medium">
              Discover our signature assortment of premium items, blending artistry with everyday
              elegance.
            </p>
          </div>
        </div>
      </div>

      <div id="product-grid" className="mx-auto w-full px-4 md:px-6 2xl:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-5">
          <aside className="w-full lg:w-[220px] shrink-0">
            <div className="mb-10">
              <h3 className="font-bold text-[11px] uppercase tracking-widest mb-6 text-[#1e2321]">
                Filter By
              </h3>
              <div className="mb-6">
                <h4 className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider mb-4">
                  PRODUCTS
                </h4>
                <div className="flex flex-row gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0 lg:flex-col lg:overflow-visible lg:gap-0 lg:space-y-1">
                  <label
                    className={`flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-[4px] transition-all shrink-0 whitespace-nowrap lg:whitespace-normal lg:shrink ${
                      activeTag === ""
                        ? "bg-[#F5EFE6] border-l-[3px] border-[#C5A26F]"
                        : "border-l-[3px] border-transparent hover:bg-gray-50"
                    }`}
                    onClick={clearFilters}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      {getCategoryIcon("All", activeTag === "")}
                    </div>
                    <span
                      className={`text-[13px] transition-colors flex-1 ${
                        activeTag === ""
                          ? "text-[#1e2321] font-semibold"
                          : "text-gray-500 group-hover:text-[#1e2321]"
                      }`}
                    >
                      All
                    </span>
                    {activeTag === "" && (
                      <span className="text-[10px] font-bold text-[#C5A26F]">✓</span>
                    )}
                  </label>
                  {subCategoriesToShow.map((item) => (
                    <CategoryTree
                      key={item.id}
                      node={item}
                      depth={0}
                      activeTag={activeTag}
                      onSelect={selectCategory}
                    />
                  ))}
                </div>
              </div>

              <button
                className="w-full py-3 border border-gray-200 text-[11px] font-semibold tracking-widest text-gray-600 uppercase hover:bg-gray-50 transition-colors"
                onClick={clearFilters}
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          </aside>
          <div className="flex-1 min-h-[50vh] min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center  gap-4 mb-8">
              <p className="text-[13px] text-gray-500 font-medium">
                Showing {products.length} of {total || products.length} results
              </p>
              <div className="flex flex-wrap space-x-2 items-center">
                {activeTag && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive text-white rounded-full text-xs font-medium">
                    {findActiveCategoryLabel()}
                    <button onClick={clearFilters} className="hover:text-gray-200 cursor-pointer">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                {activeTag && (
                  <button
                    onClick={clearFilters}
                    className="text-[13px] cursor-pointer text-destructive underline underline-offset-4 ml-2 hover:text-midnight transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 min-[2560px]:grid-cols-7 gap-3 gap-y-10">
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
                    key={activeTag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 min-[2560px]:grid-cols-7 gap-3 gap-y-10"
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
    </div>
  );
}