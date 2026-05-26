import { motion, useScroll, useTransform } from "framer-motion";
import { HomeCarousel } from "@/components/HomeCarousel";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/categories";
import { STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Truck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import PersonalizedImage from "../assets/homePage/Personalized Gift.jpg";

function useProducts(query) {
  return useQuery({
    queryKey: ["products", query ?? "all"],
    queryFn: async () => {
      const data = await storefrontApiRequest(STOREFRONT_QUERY, {
        first: 24,
        query: query ?? null,
      });
      return data?.data?.products?.edges ?? [];
    },
  });
}

function HomePage() {
  const { data: products = [], isLoading } = useProducts();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const featured = products.slice(0, 8);

  const filteredProducts = products.filter(
    (p) => p.node.tags?.includes("bestseller") || p.node.tags?.includes("wedding"),
  );

  return (
    <div ref={containerRef} className="bg-background text-foreground overflow-x-hidden">
      <section className="relative  md:min-h-[75vh] lg:min-h-[90vh] flex flex-col justify-end">
        <div className="w-full h-full px-0">
          <HomeCarousel />
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-24 px-4 md:px-8 lg:px-12 bg-background">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center group"
          >
            <div className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 mb-5 md:mb-6 lg:mb-8 flex items-center justify-center rounded-full border border-accent/20 bg-noir text-primary-foreground transition-all duration-700">
              <Star className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1} />
            </div>
            <h3 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 italic">
              Artisanal Curation
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider leading-relaxed max-w-xs md:max-w-none">
              Every gift in our atelier is hand-selected by experts to ensure it meets our rigorous
              standards of craftsmanship and beauty.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 mb-5 md:mb-6 lg:mb-8 flex items-center justify-center rounded-full border border-accent/20 bg-noir text-primary-foreground transition-all duration-700">
              <Truck className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1} />
            </div>
            <h3 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 italic">Swift Elegance</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider leading-relaxed max-w-xs md:max-w-none">
              We understand the urgency of emotion. Our logistics team ensures your gesture arrives
              in pristine condition and on time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 mb-5 md:mb-6 lg:mb-8 flex items-center justify-center rounded-full border border-accent/20 bg-noir text-primary-foreground transition-all duration-700">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1} />
            </div>
            <h3 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 italic">The Promise</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider leading-relaxed max-w-xs md:max-w-none">
              Your satisfaction is our only metric. We offer personalized support to help you find
              exactly what you're looking for.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 lg:py-40 px-4 md:px-8 lg:px-12 bg-white">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12 items-center">
          <div className="md:col-span-5 md:pr-8 lg:pr-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-5 md:mb-8 block font-medium"
            >
              CURATED ATELIERS
            </motion.span>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-8xl text-foreground leading-[0.9] mb-8 md:mb-10 lg:mb-12">
              Artisanal <br /> <i className="font-light">Excellence.</i>
            </h2>
            <p className="text-muted-foreground text-[13px] max-w-xs mb-10 md:mb-12 lg:mb-16 leading-relaxed">
              Each category is a studio of its own, dedicated to a specific craft and emotion. From
              hand-poured scents to gourmet delights.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-4 md:gap-6 text-[10px] uppercase tracking-ultra font-bold group"
            >
              SHOP ALL ATELIERS{" "}
              <div className="h-[1px] w-16 md:w-24 bg-foreground group-hover:w-28 md:group-hover:w-36 transition-all duration-700" />
            </Link>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-3 md:gap-4 lg:gap-8">
            {CATEGORIES.slice(0, 4).map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`relative group overflow-hidden h-full shine-effect ${i % 2 !== 0 ? "mt-8 md:mt-12 lg:mt-24" : ""}`}
              >
                <Link to={`/category/${c.slug}`} className="block h-full aspect-[4/5]">
                  <img
                    src={c.image}
                    alt={c.label}
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 text-white pointer-events-none">
                    <h4 className="font-serif text-base md:text-xl lg:text-2xl font-light drop-shadow-md">
                      {c.label}
                    </h4>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 lg:py-12 px-4 md:px-8 lg:px-12 bg-pearl border-y border-accent/10">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-5 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="w-full relative shine-effect"
          >
            <div className=" overflow-hidden">
              <motion.img
                style={{ scale: useTransform(scrollYProgress, [0.3, 0.6], [1.2, 1]) }}
                src={PersonalizedImage}
                alt="Personalized Gifting"
                className="w-full h-full object-cover brightness-95"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 lg:w-32 lg:h-32 bg-accent/20 hidden lg:block -z-10" />
          </motion.div>

          <div className="w-full">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[12px] uppercase tracking-ultra text-green-900 mb-4 md:mb-6 block font-bold"
            >
              The Customization Atelier
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="font-serif text-4xl md:text-4xl lg:text-5xl mb-6 md:mb-8 lg:mb-10 leading-tight text-foreground"
            >
              Personalized <i className="font-light">Excellence.</i>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm leading-relaxed mb-10 md:mb-12 lg:mb-16 max-w-lg"
            >
              Transform your gesture into a lasting legacy. From bespoke engravings to curated
              hampers, we craft unique experiences that resonate with the recipient's soul. No
              generic gifts, only hand-selected artisanal treasures.
            </motion.p>

            <div className="grid grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-3 lg:gap-6 mb-10 md:mb-12 lg:mb-16">
              {products.slice(8, 12).map((p, idx) => (
                <motion.div
                  key={p.node.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>

            <Link to="/products" className="cursor-pointer flex justify-end">
              <button className="px-8 md:px-10 lg:px-12 py-4 md:py-5 bg-primary text-primary-foreground text-[10px] uppercase tracking-ultra font-bold hover:bg-accent hover:text-primary transition-all duration-500 cursor-pointer">
                Enter The Studio
              </button>
            </Link>
          </div>
        </div>
      </section>

      {filteredProducts.length > 0 && (
        <section className="py-16  2xl:py-32 bg-primary text-primary-foreground overflow-hidden px-4 md:px-8 lg:px-12">
          <div className="w-full">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-10 md:mb-12 lg:mb-16">
              <div>
                <h2 className="font-serif text-gold text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">
                  The Essentials
                </h2>
                <p className="text-accent tracking-widest text-xs uppercase">
                  Most loved by our connoisseurs
                </p>
              </div>
              <Link
                to="/products"
                className="flex items-center gap-2 text-sm border-b border-accent pb-1 group cursor-pointer w-fit"
              >
                Shop the selection{" "}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-10">
              {filteredProducts.map((p, idx) => (
                <motion.div
                  key={p.node.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard product={p} lightMode={false} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-12 bg-pearl">
        <div className="w-full">
          <div className="text-center mb-14 md:mb-18 lg:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Star className="mx-auto mb-5 md:mb-6 text-accent" size={24} strokeWidth={1} />
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">
                Featured Selection
              </h2>
              <div className="w-12 h-[1px] bg-primary mx-auto opacity-30" />
            </motion.div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 xl:gap-12">
              {featured.map((p, idx) => (
                <motion.div
                  key={p.node.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (idx % 4) * 0.1 }}
                  className={idx % 2 !== 0 ? "md:mt-12" : ""}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-14 md:mt-18 lg:mt-24 text-center">
            <Link to="/products" className="cursor-pointer">
              <button className="px-8 md:px-10 lg:px-12 py-4 bg-primary text-primary-foreground hover:bg-accent hover:text-primary transition-colors duration-500 text-sm tracking-widest uppercase cursor-pointer">
                View All Creations
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative h-[50vh] md:h-[55vh] lg:h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale: useTransform(scrollYProgress, [0.8, 1], [1, 1.2]) }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070"
            alt="Gift backdrop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-midnight/60" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-4 md:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="font-serif text-4xl md:text-5xl lg:text-7xl mb-4 md:mb-6 italic"
          >
            Crafted for Moments <br /> that Matter.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-accent tracking-ultra text-xs uppercase"
          >
            Complimentary Premium Packaging on all orders
          </motion.p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
