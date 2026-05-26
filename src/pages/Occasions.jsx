import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, STOREFRONT_QUERY } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import OccasionHero from "@/assets/homePage/OccasionGift.webp";

const MENUS = [
  {
    category: "Celebrations",
    subCategory: [
      { name: "Birthdays", tag: "Birthday" },
      { name: "Anniversaries", tag: "Anniversary" },
      { name: "HouseWarming", tag: "housewarming" },
      { name: "Graduation", tag: "graduation" },
      { name: "New Job", tag: "new job" },
      { name: "Retirement", tag: "retirement" },
    ],
  },
  {
    category: "Baby & Family",
    subCategory: [
      { name: "Baby Announcement", tag: "baby announcement" },
      { name: "Baby Shower", tag: "baby shower" },
      { name: "Naming Ceremony", tag: "naming ceremony" },
      { name: "New Parent Gifts", tag: "new parent gifts" },
    ],
  },
  {
    category: "Seasonal & Festive",
    subCategory: [
      { name: "Raksha Bandhan", tag: "raksha bandhan" },
      { name: "Valentine's", tag: "velentine's" },
      { name: "Diwali", tag: "diwali" },
      { name: "Christmas", tag: "christmas" },
    ],
  },
];

const ALL_TAGS_AND_TYPES_QUERY = MENUS.flatMap((m) =>
  m.subCategory.flatMap((s) => [`tag:"${s.tag}"`, `product_type:"${s.tag}"`])
).join(" OR ");

export default function Occasions() {
  const [searchParams] = useSearchParams();
  const tagParam = searchParams.get("tag");

  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (tagParam) {
      setActiveTag(tagParam);
      // optionally find the corresponding category and set it active so the sidebar highlights it
      for (const menu of MENUS) {
        if (menu.subCategory.some(s => s.tag === tagParam)) {
          setActiveCategory(menu.category);
          break;
        }
      }
    } else {
      setActiveTag("");
      setActiveCategory("All");
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
  }, [activeTag, activeCategory]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "Occasions", activeTag, activeCategory],
    queryFn: async () => {
      let queryStr = ``;
      if (activeTag) {
        queryStr = `tag:"${activeTag}" OR product_type:"${activeTag}"`;
      } else if (activeCategory !== "All") {
        const catTagsAndTypes = MENUS.find((m) => m.category === activeCategory)
          ?.subCategory.flatMap((s) => [`tag:"${s.tag}"`, `product_type:"${s.tag}"`])
          .join(" OR ");
        queryStr = `product_type:"Occasion" OR product_type:"Occasions" OR ${catTagsAndTypes}`;
      } else {
        queryStr = `product_type:"Occasion" OR product_type:"Occasions" OR ${ALL_TAGS_AND_TYPES_QUERY}`;
      }

      const data = await storefrontApiRequest(STOREFRONT_QUERY, {
        first: 60,
        query: queryStr,
      });
      return data?.data?.products?.edges ?? [];
    },
  });

  const subCategoriesToShow =
    activeCategory === "All"
      ? MENUS.flatMap((m) => m.subCategory)
      : MENUS.find((m) => m.category === activeCategory)?.subCategory || [];

  return (
    <div className="min-h-screen bg-white font-sans text-[#0f1716]">
      <div className="relative h-screen text-center overflow-hidden">
        <img
          src={OccasionHero}
          alt="Occasions"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/60" />
      </div>

      <div id="product-grid" className="mx-auto w-full px-4 md:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8 lg:gap-10">
        <aside className="w-full lg:w-[260px] flex-shrink-0">
          <div className="border-b border-border pb-4 mb-6">
            <h2 className="text-lg font-bold text-[#0f1716]">Filter Options</h2>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-[#0f1716]">By Categories</h3>
            <div className="space-y-3">
              <label
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => {
                  setActiveCategory("All");
                  setActiveTag("");
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 border rounded-[3px] flex items-center justify-center ${activeCategory === "All" ? "bg-destructive border-destructive" : "border-gray-300"}`}
                  >
                    {activeCategory === "All" && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${activeCategory === "All" ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}
                  >
                    All Categories
                  </span>
                </div>
                {activeCategory === "All" && (
                  <div className="w-[3px] h-5 bg-destructive rounded-l-md" />
                )}
              </label>
              {MENUS.map((section, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => {
                    setActiveCategory(section.category);
                    setActiveTag("");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 border rounded-[3px] flex items-center justify-center ${activeCategory === section.category ? "bg-destructive border-destructive" : "border-gray-300"}`}
                    >
                      {activeCategory === section.category && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${activeCategory === section.category ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}
                    >
                      {section.category}
                    </span>
                  </div>
                  {activeCategory === section.category && (
                    <div className="w-[3px] h-5 bg-destructive rounded-l-md" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-[#0f1716]">By Occasion</h3>
            <div className="space-y-3">
              {subCategoriesToShow.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => setActiveTag(item.tag)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 border rounded-[3px] flex items-center justify-center ${activeTag === item.tag ? "bg-destructive border-destructive" : "border-gray-300"}`}
                    >
                      {activeTag === item.tag && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${activeTag === item.tag ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}
                    >
                      {item.name}
                    </span>
                  </div>
                  {activeTag === item.tag && (
                    <div className="w-[3px] h-5 bg-destructive rounded-l-md" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <p className="text-[13px] text-muted-foreground">
              Showing 1-{products.length} of {products.length || 0} results
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[13px] text-muted-foreground mr-2">Active Filter</span>
            {activeTag && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive text-white rounded-full text-xs font-medium">
                {subCategoriesToShow.find((s) => s.tag === activeTag)?.name || activeTag}
                <button onClick={() => setActiveTag("")} className="hover:text-gray-200">
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
              }}
              className="text-[13px] cursor-pointer text-destructive underline underline-offset-4 ml-2 hover:text-[#0f1716] transition-colors"
            >
              Clear All
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg text-foreground font-medium mb-2">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or categories.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
