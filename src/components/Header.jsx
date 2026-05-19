import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { CATEGORIES } from "@/lib/categories";
import { Search, ShoppingBag, User, MapPin, ChevronDown, Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import { LocationSelector } from "./LocationSelector";
import { useState } from "react";
import MainLogo from "../assets/mainLogos/mainLogo.png";

const MENU_ITEMS = {
  hampers: [
    { name: "Luxury Hampers", link: "/products" },
    { name: "Gourmet Boxes", link: "/products" },
    { name: "Executive Sets", link: "/products" },
    { name: "Personalized Boxes", link: "/products" },
  ],
  occasions: [
    { name: "Weddings", link: "/category/wedding" },
    { name: "Anniversaries", link: "/products" },
    { name: "Birthdays", link: "/products" },
    { name: "Corporate Events", link: "/products" },
  ],
  corporate: [
    { name: "Custom Branding", link: "/products" },
    { name: "Bulk Orders", link: "/products" },
    { name: "Employee Gifting", link: "/products" },
    { name: "Client Relations", link: "/products" },
  ],
  customization: [
    { name: "Engraved Gifts", link: "/products" },
    { name: "Monogrammed Sets", link: "/products" },
    { name: "Bespoke Hampers", link: "/products" },
    { name: "Creative Selection", link: "/products" },
  ],
};

export function Header() {
  const setOpen = useCartStore((s) => s.setOpen);
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistItems = useWishlistStore((s) => s.items);
  const setWishlistOpen = useWishlistStore((s) => s.setOpen);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 glass" onMouseLeave={() => setActiveMenu(null)}>
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl px-4 lg:px-12 flex items-center"
          >
            <form onSubmit={handleSearch} className="w-full flex items-center gap-6">
              <Search className="text-accent" size={24} />
              <input
                autoFocus
                type="text"
                placeholder="Search for luxury gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-xl md:text-3xl font-serif outline-none placeholder:text-muted-foreground/30"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-[10px] uppercase tracking-ultra font-bold hover:text-accent transition-colors cursor-pointer"
              >
                Close
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex w-full items-center justify-between px-4 lg:px-6 ">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative">
            <img src={MainLogo} alt="Main Logo" className="w-20 h-20 2xl:w-32 2xl:h-32" />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <NavLink
            to="/products"
            onMouseEnter={() => setActiveMenu(null)}
            className={({ isActive }) =>
              `text-[12px] 2xl:text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-accent" : "text-foreground hover:text-accent"}`
            }
          >
            All Gifts
          </NavLink>

          {CATEGORIES.slice(0, 5).map((c) => (
            <div
              key={c.slug}
              onMouseEnter={() => setActiveMenu(c.slug)}
              className="relative py-4 cursor-pointer"
            >
              <NavLink
                to={`/category/${c.slug}`}
                className={({ isActive }) =>
                  `flex items-center gap-1 text-[12px] 2xl:text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive || activeMenu === c.slug ? "text-accent" : "text-foreground hover:text-accent"}`
                }
              >
                {c.productType}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${activeMenu === c.slug ? "rotate-180" : ""}`}
                />
              </NavLink>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden md:block scale-90 origin-right">
            <LocationSelector />
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-foreground hover:text-accent transition-colors p-1"
            aria-label="Search"
          >
            <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
          </button>

          <button
            onClick={() => setWishlistOpen(true)}
            className="group relative flex items-center p-1 text-foreground hover:text-accent transition-colors"
            aria-label="Open wishlist"
          >
            <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
            {wishlistItems.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center bg-accent text-[8px] sm:text-[9px] font-bold text-primary"
              >
                {wishlistItems.length}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setOpen(true)}
            className="group relative flex items-center p-1 text-foreground hover:text-accent transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center bg-accent text-[8px] sm:text-[9px] font-bold text-primary"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <button
            className="hidden sm:flex items-center p-1 text-foreground hover:text-accent transition-colors"
            aria-label="Profile"
          >
            <User className="h-4 w-4 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeMenu && MENU_ITEMS[activeMenu] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-0 w-full bg-white/95 backdrop-blur-xl border-b border-border shadow-luxe overflow-hidden"
          >
            <div className="w-full px-12 py-12 grid grid-cols-4 gap-12">
              <div className="col-span-1">
                <h3 className="font-serif text-3xl mb-4 italic">The Collection</h3>
                <p className="text-xs 2xl:text-[16px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Explore our handcrafted selection of {activeMenu} curated for moments that matter.
                </p>
                <Link
                  to={`/category/${activeMenu}`}
                  className="inline-block mt-6 text-[10px] 2xl:text-[16px] uppercase tracking-ultra font-bold text-accent border-b border-accent pb-1"
                >
                  View All
                </Link>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-8">
                {MENU_ITEMS[activeMenu].map((item, i) => (
                  <Link key={i} to={item.link} className="group flex flex-col">
                    <span className="text-xs 2xl:text-[16px] uppercase tracking-wider font-semibold text-foreground group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] 2xl:text-[14px] text-muted-foreground uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now →
                    </span>
                  </Link>
                ))}
              </div>

              <div className="col-span-1">
                <div className="aspect-[4/3] bg-secondary overflow-hidden">
                  <img
                    src={CATEGORIES.find((c) => c.slug === activeMenu)?.image}
                    alt={activeMenu}
                    className="w-full h-full object-cover grayscale-[0.2]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
