import { CATEGORIES } from "@/lib/categories";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MainLogo from "../assets/mainLogos/mainLogo.png";
import { LocationSelector } from "./LocationSelector";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (slug, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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
    <>
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

      <div className="mx-auto flex w-full items-center justify-between px-4 lg:px-6 relative h-[58px] md:min-h-[64px] py-2">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative">
            <img src={MainLogo} alt="Main Logo" className="w-16 h-16 sm:w-20 sm:h-20 2xl:w-32 2xl:h-32 object-contain" />
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

        <div className="flex items-center gap-3 lg:gap-6">
          <div className="hidden md:block scale-90 origin-right">
            <LocationSelector />
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-foreground hover:text-accent transition-colors p-1"
            aria-label="Search"
          >
            <Search className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
          </button>

          <button
            onClick={() => setWishlistOpen(true)}
            className="group relative flex items-center p-1 text-foreground hover:text-accent transition-colors hidden sm:flex"
            aria-label="Open wishlist"
          >
            <Heart className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
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
            <ShoppingBag className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center bg-accent text-[8px] sm:text-[9px] font-bold text-primary rounded-full"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <button
            className="hidden sm:flex items-center p-1 text-foreground hover:text-accent transition-colors"
            aria-label="Profile"
          >
            <User className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]" strokeWidth={2} />
          </button>

          {/* Mobile Hamburger Menu (Right Side) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-foreground hover:text-accent p-1 transition-colors ml-1"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" strokeWidth={1.5} />
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
            className="absolute left-0 w-full bg-white/95 backdrop-blur-xl border-b border-border shadow-luxe overflow-hidden hidden lg:block"
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

    {/* Mobile Menu Drawer */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "-100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-[#FAF7F2] lg:hidden flex flex-col shadow-2xl h-screen w-screen"
        >
          {/* Header part matching top bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-accent/20 bg-white min-h-[64px]">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
              <img src={MainLogo} alt="Main Logo" className="w-16 h-16 object-contain" />
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-black hover:text-accent rounded-full bg-gray-50 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Scrollable links body */}
          <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6 bg-[#FAF7F2]">
            {/* Location Selector (rendered on mobile here) */}
            <div className="w-full">
              <LocationSelector />
            </div>

            <div className="h-px bg-accent/15 w-full" />

            {/* Navigation Menu */}
            <div className="flex flex-col gap-5">
              <NavLink
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-accent" : "text-[#0f1716] hover:text-accent"}`
                }
              >
                All Gifts
              </NavLink>

              {CATEGORIES.slice(0, 5).map((c) => {
                const hasSubMenu = !!MENU_ITEMS[c.slug];
                const isExpanded = !!expandedCategories[c.slug];

                return (
                  <div key={c.slug} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between py-1">
                      <NavLink
                        to={`/category/${c.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-accent" : "text-[#0f1716] hover:text-accent"}`
                        }
                      >
                        {c.productType}
                      </NavLink>
                      {hasSubMenu && (
                        <button
                          onClick={(e) => toggleCategory(c.slug, e)}
                          className="p-1.5 text-accent hover:text-[#0f1716] transition-colors cursor-pointer"
                          aria-label={`Toggle ${c.productType} sub-menu`}
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                    
                    {hasSubMenu && (
                      <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden flex flex-col gap-2 pl-4 border-l border-accent/20"
                      >
                        {MENU_ITEMS[c.slug].map((item, i) => (
                          <Link
                            key={i}
                            to={item.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[14px] uppercase tracking-wider text-[#0f1716]/80 hover:text-accent py-1 transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-accent/15 w-full mt-auto" />

            {/* Wishlist & Account */}
            <div className="flex flex-col gap-4 pb-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setWishlistOpen(true);
                }}
                className="flex items-center gap-3 text-[14px] uppercase tracking-wider font-semibold text-[#0f1716] hover:text-accent py-1.5 transition-colors cursor-pointer"
              >
                <Heart size={18} className="text-accent" />
                <span>Wishlist ({wishlistItems.length})</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-[14px] uppercase tracking-wider font-semibold text-[#0f1716] hover:text-accent py-1.5 transition-colors cursor-pointer"
              >
                <User size={18} className="text-accent" />
                <span>My Account</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
