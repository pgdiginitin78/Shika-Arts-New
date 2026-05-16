import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, STOREFRONT_QUERY } from "@/lib/shopify";
import { getCategoryBySlug } from "@/lib/categories";
import { ProductCard } from "@/components/ProductCard";

function CategoryPage() {
  const { slug } = useParams();
  const cat = getCategoryBySlug(slug);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "type", cat?.productType],
    queryFn: async () => {
      const data = await storefrontApiRequest(STOREFRONT_QUERY, {
        first: 60,
        query: `product_type:"${cat.productType}"`,
      });
      console.log("product data",cat, data.data);

      return data?.data?.products?.edges ?? [];
    },
    enabled: !!cat?.productType,
  });

  if (!cat) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Category not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* <section
        className="bg-noir text-ivory"
        style={{ background: "var(--gradient-noir)" }}
      >
        <div className="mx-auto w-full px-4 py-16 text-center">
          <span className="font-serif text-7xl text-gold">{cat.icon}</span>
          <h1 className="mt-3 font-serif text-5xl">{cat.label}</h1>
          <p className="mt-3 text-sm text-ivory/75">{cat.tagline}</p>
        </div>
      </section> */}

      <div className="mx-auto w-full px-4 md:px-6 lg:px-12 py-5">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-secondary" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;