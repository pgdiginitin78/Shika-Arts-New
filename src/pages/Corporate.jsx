import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, STOREFRONT_QUERY } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

const MENUS = [
  {
    category: "Employee Gifting",
    subCategory: [
      { name: "Joining Kits", tag: "Corporate" },
      { name: "Event Gifting", tag: "event gifting" },
      { name: "Work Anniversaries", tag: "work anniversaries" },
      { name: "Rewards", tag: "rewards" },
      { name: "Wellness Box", tag: "wellness box" },
    ],
  },
  {
    category: "Client Gifting",
    subCategory: [
      { name: "New Year Gifting", tag: "new year gifting" },
      { name: "Festive Gifting", tag: "festive gifting" },
      { name: "Executive Gifts", tag: "executive gifts" },
      { name: "Premium Collection", tag: "premium collection" },
    ],
  },
  {
    category: "Annual Gifting Calendar",
    subCategory: [
      { name: "Annual Gifting Calendar", tag: "annual gifting calendar" }
    ],
  },
];

const ALL_TAGS_AND_TYPES_QUERY = MENUS.flatMap((m) =>
  m.subCategory.flatMap((s) => [`tag:"${s.tag}"`, `product_type:"${s.tag}"`])
).join(" OR ");

export default function Corporate() {
  const [searchParams] = useSearchParams();
  const tagParam = searchParams.get("tag");

  const [activeTag, setActiveTag] = useState(tagParam || "");

  useEffect(() => {
    if (tagParam) {
      setActiveTag(tagParam);
    } else {
      setActiveTag("");
    }
  }, [tagParam]);

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
  }, [activeTag]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "Corporate", activeTag],
    queryFn: async () => {
      let queryStr = `product_type:"Corporate" OR ${ALL_TAGS_AND_TYPES_QUERY}`;
      if (activeTag) {
        queryStr = `tag:"${activeTag}" OR product_type:"${activeTag}"`;
      }
      const data = await storefrontApiRequest(STOREFRONT_QUERY, {
        first: 60,
        query: queryStr,
      });
      return data?.data?.products?.edges ?? [];
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
            Shop Corporate Gift
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground uppercase tracking-widest">
            Professional excellence
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 bg-white p-6 shadow-sm border border-border"
            >
              <button
                onClick={() => setActiveTag("")}
                className={`w-full text-left font-serif text-xl md:text-2xl italic mb-6 transition-colors ${
                  activeTag === "" ? "text-destructive" : "text-foreground hover:text-destructive"
                }`}
              >
                All Corporate
              </button>
              
              <div className="space-y-8">
                {MENUS.map((section, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    <h4 className="text-[14px] uppercase tracking-widest font-bold text-muted-foreground border-b border-border pb-2">
                      {section.category}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {section.subCategory.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveTag(item.tag)}
                          className={`text-left text-[14px] uppercase tracking-wider transition-colors ${
                            activeTag === item.tag
                              ? "text-destructive font-semibold"
                              : "text-foreground hover:text-destructive"
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4 min-h-[50vh]">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-secondary" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border bg-white/50 h-full"
              >
                <p className="text-lg text-muted-foreground uppercase tracking-widest mb-4">
                  No products found for this category yet.
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">
                  Connect to Shopify and add category and menu to show products proper.
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
                  className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8"
                >
                  {products.map((p) => (
                    <ProductCard key={p.node.id} product={p} />
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
