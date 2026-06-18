import { ProductCard } from "@/components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavbarMenus } from "../context/NavbarContext";
import { getProductsByCategory, getProductsByParentCategory } from "../services/LoginServices";
import CustomizedGiftsBg from "../assets/corporate/CustomizedGiftBg.webp";
import {
  Grip,
  CircleDot,
  Paintbrush,
  Pen,
  Stamp,
  Tag,
  Palette,
  Box,
  Shirt,
  Frame,
  Trophy,
  Briefcase,
  Users,
  Heart,
  Gift,
  Package,
  Sparkles,
  Gem,
  Star,
  Flower2,
  Layers,
  PenTool,
  ImageIcon,
} from "lucide-react";

export default function CustomizedGifts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customizedCat, setCustomizedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navbarMenus = useNavbarMenus();

  const tagParam = searchParams.get("tag");
  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState("customizedgifts");
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState("parent");

  useEffect(() => {
    if (navbarMenus?.length > 0) {
      const found = navbarMenus.find(
        (m) =>
          m?.slug?.toLowerCase() === "customizedgifts" ||
          m?.slug?.toLowerCase() === "customization" ||
          m?.name?.toLowerCase().includes("customiz"),
      );
      setCustomizedCat(found);
    }
  }, [navbarMenus]);

  useEffect(() => {
    if (tagParam && customizedCat) {
      setActiveTag(tagParam);
      let matched = null;
      customizedCat?.children?.forEach((menu) => {
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
      setSelectedSlug(customizedCat?.slug || "customizedgifts");
      setSelectedId(null);
      setFilterMode("parent");
    }
  }, [tagParam, customizedCat]);

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
      const slug = customizedCat?.slug || "customizedgifts";
      getProductsByParentCategory(slug)
        .then((res) => {
          setProducts(res.products);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [selectedSlug, selectedId, filterMode, customizedCat]);

  const subCategoriesToShow =
    activeCategory === "All"
      ? customizedCat?.children?.flatMap((c) => c.children || []) || []
      : customizedCat?.children?.find((c) => c.name === activeCategory)?.children || [];

  const decodeHtml = (text) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  };

  const getIcon = (name, active = false) => {
    const n = (name || "").toLowerCase();
    const cls = active ? "text-[#C5A26F]" : "opacity-70 text-[#1e2321]";
    if (n.includes("all")) return <Grip size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("employee")) return <Users size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("logo")) return <Stamp size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("welcome kit") || n.includes("welcome"))
      return <Briefcase size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("corporate") || n.includes("branding"))
      return <Trophy size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("colour theme") || n.includes("color"))
      return <Palette size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("custom box")) return <Box size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("ribbon")) return <Sparkles size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("sleeve")) return <Layers size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("packaging")) return <Package size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("bridesmaid")) return <Flower2 size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("favour") || n.includes("guest"))
      return <Heart size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("invitation") || n.includes("invite"))
      return <PenTool size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("wedding")) return <Heart size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("photo") || n.includes("print"))
      return <ImageIcon size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("engrav") || n.includes("monogram"))
      return <PenTool size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("apparel") || n.includes("shirt"))
      return <Shirt size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("frame")) return <Frame size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("paint") || n.includes("art"))
      return <Paintbrush size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("pen") || n.includes("note"))
      return <Pen size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("tag") || n.includes("label"))
      return <Tag size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("premium") || n.includes("luxury"))
      return <Gem size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("award") || n.includes("trophy"))
      return <Star size={15} strokeWidth={1.5} className={cls} />;
    if (n.includes("gift")) return <Gift size={15} strokeWidth={1.5} className={cls} />;
    return <CircleDot size={15} strokeWidth={1.5} className={cls} />;
  };

  const resetToAll = () => {
    setActiveTag("");
    setActiveCategory("All");
    setSelectedSlug(customizedCat?.slug || "customizedgifts");
    setSelectedId(null);
    setFilterMode("parent");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#0f1716]">
      {/* Hero */}
      <div className="relative w-full h-[60vh] md:h-[80vh] lg:h-screen min-h-[400px] flex items-center justify-center md:justify-start overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={CustomizedGiftsBg}
            alt="Customized Gifts"
            className="w-full h-full object-cover object-top "
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-b md:from-black/30 md:via-black/20 md:to-black/35" />
        </div>
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-16 lg:px-24 2xl:px-0 flex flex-col items-center md:items-start mt-16 md:mt-0">
          <div className="max-w-2xl flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-white uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold mb-4 md:mb-6 block">
              MADE JUST FOR YOU
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-serif text-white mb-6 leading-[1.15]">
              Customized Gifts
              <br />
              Uniquely Yours
            </h1>
            <div className="flex items-center gap-3 mb-6 max-w-[280px]">
              <div className="h-[1px] bg-[#C5A26F]/60 flex-1"></div>
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
              <div className="h-[1px] bg-[#C5A26F]/60 flex-1"></div>
            </div>
            <p className="text-white/80 text-xs md:text-sm max-w-[480px] leading-relaxed font-medium">
              From personalized branding to bespoke packaging — every detail crafted to tell your
              unique story and leave a lasting impression.
            </p>
          </div>
        </div>
      </div>

      {/* Products & Sidebar */}
      <div id="product-grid" className="mx-auto w-full px-4 md:px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] shrink-0">
            <div className="mb-10">
              <h3 className="font-bold text-[11px] uppercase tracking-widest mb-6 text-[#1e2321]">
                Browse Collections
              </h3>
              <div className="space-y-1">
                <label
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors rounded-[4px] ${activeCategory === "All" ? "bg-[#F0EAE1] text-[#1e2321] font-medium" : "text-gray-500 hover:bg-[#F3EFE8]/50"}`}
                  onClick={resetToAll}
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    {getIcon("all", activeCategory === "All")}
                  </div>
                  <span className="text-[13px] tracking-wide">All Categories</span>
                </label>
                {customizedCat?.children?.map((section, idx) => {
                  const isActive = activeCategory === section.name;
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors rounded-[4px] ${isActive ? "bg-[#F0EAE1] text-[#1e2321] font-medium" : "text-gray-500 hover:bg-[#F3EFE8]/50"}`}
                      onClick={() => {
                        setActiveCategory(section.name);
                        setSelectedSlug(section.slug);
                        setSelectedId(null);
                        setFilterMode("parent");
                        setActiveTag("");
                        setSearchParams({});
                      }}
                    >
                      <div className="flex items-center justify-center w-5 h-5">
                        {getIcon(section.name, isActive)}
                      </div>
                      <span className="text-[13px] tracking-wide">{decodeHtml(section.name)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-bold text-[11px] uppercase tracking-widest mb-6 text-[#1e2321]">
                Filter By
              </h3>
              <h4 className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider mb-4">
                CUSTOMIZATION TYPES
              </h4>
              <div className="space-y-1">
                {subCategoriesToShow.map((item) => {
                  const isActive = activeTag === item.slug;
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-[4px] transition-all ${isActive ? "bg-[#F5EFE6] border-l-[3px] border-[#C5A26F]" : "border-l-[3px] border-transparent hover:bg-gray-50"}`}
                      onClick={() => {
                        setActiveTag(item.slug);
                        setSelectedId(item.id);
                        setSelectedSlug(item.slug);
                        setFilterMode("exact");
                        setSearchParams({ tag: item.slug });
                      }}
                    >
                      <div className="flex items-center justify-center w-5 h-5">
                        {getIcon(item.name, isActive)}
                      </div>
                      <span
                        className={`text-[13px] transition-colors flex-1 ${isActive ? "text-[#1e2321] font-semibold" : "text-gray-500 group-hover:text-[#1e2321]"}`}
                      >
                        {decodeHtml(item.name)}
                      </span>
                      {isActive && <span className="text-[10px] font-bold text-[#C5A26F]">✓</span>}
                    </label>
                  );
                })}
              </div>
              <button
                className="w-full mt-6 py-3 cursor-pointer border border-gray-200 text-[11px] font-semibold tracking-widest text-gray-600 uppercase hover:bg-gray-50 transition-colors"
                onClick={resetToAll}
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-h-[50vh]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
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
                            ? customizedCat?.children?.find((c) => c.name === activeCategory)
                                ?.slug ||
                                customizedCat?.slug ||
                                "customizedgifts"
                            : customizedCat?.slug || "customizedgifts",
                        );
                        setSearchParams({});
                      }}
                      className="hover:text-gray-200 cursor-pointer"
                    >
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
                <button
                  onClick={resetToAll}
                  className="text-[13px] cursor-pointer text-destructive underline underline-offset-4 ml-2 hover:text-[#0f1716] transition-colors"
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-10"
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
