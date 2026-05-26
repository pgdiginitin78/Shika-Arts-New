import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, STOREFRONT_QUERY } from "@/lib/shopify";
import { getCategoryBySlug } from "@/lib/categories";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

function CategoryPage() {
  const { slug } = useParams();
  const cat = getCategoryBySlug(slug);

  const displayTitle = cat
    ? cat.label
    : slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: async () => {
      let queryStr = "";
      if (cat?.productType) {
        queryStr = `product_type:"${cat.productType}"`;
      } else {
        queryStr = `tag:"${slug.replace(/-/g, " ")}"`;
      }
      const data = await storefrontApiRequest(STOREFRONT_QUERY, {
        first: 60,
        query: queryStr,
      });

      return data?.data?.products?.edges ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-white py-12 md:py-16 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full px-4 md:px-6 lg:px-12 text-center"
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
      </div>

      <div className="mx-auto w-full px-4 md:px-6 lg:px-12 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-sm bg-secondary"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg text-muted-foreground uppercase tracking-widest">
              No products found in this collection yet.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8"
          >
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;