import { CATEGORIES } from "@/lib/categories";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Loader2, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MainLogo from "../assets/mainLogos/shikaArtsLogo.webp";
import { useNavbarMenus } from "../context/NavbarContext";
import { LocationSelector } from "./LocationSelector";
import { LoginModal } from "./LoginModal";
import { UserMenu, UserMenuInline } from "./UserMenu";
import { searchProducts } from "@/services/orderService";

export function Header() {
  const setOpen = useCartStore((s) => s.setOpen);
  const totalItems = useCartStore((s) => s.items?.length);
  const wishlistItems = useWishlistStore((s) => s.items);
  const setWishlistOpen = useWishlistStore((s) => s.setOpen);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const navbarMenus = useNavbarMenus();

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await searchProducts(searchQuery, 1, 6);
        setSearchResults(data.products || []);
      } catch (err) {
        console.error("Search error:", err);
        setSearchError("Something went wrong. Try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

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
      closeSearch();
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  const handleResultClick = (product) => {
    navigate(`/product/${product.slug}`);
    closeSearch();
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const customer = JSON.parse(localStorage.getItem("user"));

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass 2xl:px-3" onMouseLeave={() => setActiveMenu(null)}>
        <div className="mx-auto flex w-full items-center justify-between px-4 2xl:px-6 relative h-[58px] md:min-h-[80px] py-2">
          <Link to="/" className="flex items-center">
            <div className="relative">
              <span className="text-3xl md:text-4xl font-serif font-bold text-[#D4AF37]">
                Shika
              </span>
              <span className="absolute -bottom-2 -right-3 text-[11px] uppercase tracking-[0.3em] font-semibold text-[#7A1F3D]">
                Arts
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-3 2xl:gap-6">
            <NavLink
              to="/about-us"
              onMouseEnter={() => setActiveMenu(null)}
              className={({ isActive }) =>
                `text-[10px] 2xl:text-[14px] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${isActive ? "text-destructive" : "text-foreground hover:text-destructive"}`
              }
            >
              About Us
            </NavLink>

            {navbarMenus.map((c) => (
              <div
                key={c.slug}
                onMouseEnter={() => setActiveMenu(c.slug)}
                className="relative py-4 cursor-pointer"
              >
                <NavLink
                  to={`/category/${c.slug}`}
                  className={({ isActive }) =>
                    `flex items-center gap-1 text-[10px] 2xl:text-[14px] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${isActive || activeMenu === c.slug ? "text-destructive" : "text-foreground hover:text-destructive"}`
                  }
                >
                  {c.name.replace(/&amp;/g, '&')}
                  {c.children && c.children.length > 0 && (
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${activeMenu === c.slug ? "rotate-180" : ""}`}
                    />
                  )}
                </NavLink>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden md:block scale-90 origin-right">
              <LocationSelector />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="text-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
              aria-label="Search"
            >
              <Search
                className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]"
                strokeWidth={2}
              />
            </button>

            <button
              onClick={() => setWishlistOpen(true)}
              className="group relative cursor-pointer flex items-center p-1 text-foreground hover:text-destructive transition-colors hidden sm:flex"
              aria-label="Open wishlist"
            >
              <Heart
                className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]"
                strokeWidth={2}
              />
              {wishlistItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 rounded-full text-white flex h-3.5 w-3.5 sm:h-4 sm:w-4 text-center items-center justify-center bg-destructive text-[8px] sm:text-[9px] font-bold "
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="group relative flex items-center cursor-pointer p-1 text-foreground hover:text-destructive transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart
                className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]"
                strokeWidth={2}
              />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center bg-destructive text-[8px] sm:text-[9px] font-bold text-white rounded-full"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
            {customer ? (
              <div className="hidden sm:flex items-center">
                <UserMenu />
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="group relative  flex items-center p-1 cursor-pointer text-foreground hover:text-destructive transition-colors hidden sm:flex"
                aria-label="Login / Account"
              >
                <User
                  className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]"
                  strokeWidth={2}
                />
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-foreground hover:text-destructive p-1 transition-colors ml-1"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(() => {
            const activeData = navbarMenus.find((c) => c.slug === activeMenu);
            if (!activeMenu || !activeData || !activeData.children || activeData.children.length === 0) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute left-0 w-full bg-white/95 backdrop-blur-xl border-b border-border shadow-luxe overflow-hidden hidden lg:block"
              >
                <div className="w-full px-12 py-12 grid grid-cols-4 gap-12">
                  <div className="col-span-1">
                    <h3 className="font-serif text-3xl mb-2 italic">The {activeData.name.replace(/&amp;/g, '&')}</h3>
                    <p className="text-[14px] 2xl:text-[14px] text-muted-foreground  tracking-widest leading-relaxed">
                      {activeData.slug === "occasions"
                        ? "Discover thoughtfully curated gifting experiences designed for every occasion."
                        : activeData.slug === "corporate"
                          ? "From onboarding kits to festive campaigns, thoughtfully curated gifting that strengthens every connection."
                          : activeData.slug === "wedding"
                            ? "Craft a wedding celebration that feels uniquely yours with custom invitations, curated hampers, and thoughtful gifting details."
                            : activeData.slug === "customizedgifts" || activeData.slug === "customization"
                              ? "From personalised products and custom packaging to curated hampers and branded details, we create gifting experiences designed uniquely around your vision."
                              : "Elevate every gift with beautifully curated packaging designed to leave a lasting impression."}
                    </p>
                    <Link
                      to={`/category/${activeData.slug}`}
                      onClick={() => setActiveMenu(null)}
                      className="inline-block mt-3 text-end text-[10px] 2xl:text-[14px] uppercase tracking-ultra font-bold text-destructive border-b border-destructive pb-1"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-8">
                    {activeData.children.map(
                      (section, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                          <h4 className="text-[16px] 2xl:text-[18px] font-semibold  font-serif italic  text-destructive mb-1">
                            {section.name.replace(/&amp;/g, '&')}
                          </h4>
                          <div className="flex flex-col gap-3">
                            {section.children && section.children.map((item, i) => (
                              <Link
                                key={i}
                                to={`/category/${activeData.slug}?tag=${item.slug}`}
                                className="group flex flex-col"
                                onClick={() => setActiveMenu(null)}
                              >
                                <span className="text-[12px] 2xl:text-[14px]  tracking-wider font-semibold text-foreground group-hover:text-destructive transition-colors">
                                  {item.name.replace(/&amp;/g, '&')}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="col-span-1">
                    <div className=" w-full bg-secondary overflow-hidden">
                      <img
                        src={CATEGORIES.find((c) => c.slug.toLowerCase().replace(/\s+/g, '') === activeData.slug.toLowerCase().replace(/\s+/g, '') || c.slug.toLowerCase() === (activeData.slug === 'customizedgifts' ? 'customization' : ''))?.image}
                        alt={activeData.name.replace(/&amp;/g, '&')}
                        className="w-full h-full object-cover grayscale-[0.2]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </header>

      {isSearchOpen && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl px-4 xl:px-12 flex flex-col"
          >
            <form onSubmit={handleSearch} className="w-full flex items-center gap-6 min-h-[80px] shrink-0">
              <Search className="text-destructive shrink-0" size={24} />
              <input
                autoFocus
                type="text"
                autoComplete="off"
                placeholder="Search for luxury gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-xl md:text-3xl font-serif outline-none placeholder:text-muted-foreground/30"
              />
              {isSearching && (
                <Loader2 className="animate-spin text-muted-foreground shrink-0" size={20} />
              )}
              <button
                type="button"
                onClick={closeSearch}
                className="text-[10px] uppercase tracking-ultra font-bold hover:text-destructive transition-colors cursor-pointer shrink-0"
              >
                Close
              </button>
            </form>

            {searchQuery.trim() && (
              <div className="flex-1 overflow-y-auto pb-8 max-w-3xl w-full">
                {searchError && (
                  <p className="text-sm text-destructive mt-4">{searchError}</p>
                )}

                {!isSearching && !searchError && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    No products found for "{searchQuery}"
                  </p>
                )}

                <div className="flex flex-col divide-y divide-border mt-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleResultClick(product)}
                      className="flex items-center gap-4 py-3 text-left hover:bg-secondary/50 transition-colors px-2 rounded-md cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹ {(product.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="mt-4 text-[11px] uppercase tracking-ultra font-bold text-destructive border-b border-destructive pb-1 cursor-pointer"
                  >
                    View all results for "{searchQuery}"
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-[#FAF7F2] lg:hidden flex flex-col shadow-2xl h-screen w-screen"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-destructive/20 bg-white min-h-[64px]">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <img src={MainLogo} alt="Main Logo" className="w-16 h-16 object-contain" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-black hover:text-destructive rounded-full bg-gray-50 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6 bg-[#FAF7F2]">
              <div className="w-full">
                <LocationSelector />
              </div>

              <div className="h-px bg-destructive/15 w-full" />

              <div className="flex flex-col gap-5">
                <NavLink
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-destructive" : "text-[#0f1716] hover:text-destructive"}`
                  }
                >
                  All Gifts
                </NavLink>

                <NavLink
                  to="/about-us"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-destructive" : "text-[#0f1716] hover:text-destructive"}`
                  }
                >
                  About Us
                </NavLink>

                {navbarMenus.map((c) => {
                  const hasSubMenu = c.children && c.children.length > 0;
                  const isExpanded = !!expandedCategories[c.slug];

                  return (
                    <div key={c.slug} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between py-1">
                        <NavLink
                          to={`/category/${c.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-destructive" : "text-[#0f1716] hover:text-destructive"}`
                          }
                        >
                          {c.name.replace(/&amp;/g, '&')}
                        </NavLink>
                        {hasSubMenu && (
                          <button
                            onClick={(e) => toggleCategory(c.slug, e)}
                            className="p-1.5 text-destructive hover:text-[#0f1716] transition-colors cursor-pointer"
                            aria-label={`Toggle ${c.name.replace(/&amp;/g, '&')} sub-menu`}
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
                          className="overflow-hidden flex flex-col gap-4 pl-4 border-l border-destructive/20"
                        >
                          {c.children.map((section, idx) => (
                            <div key={idx} className="flex flex-col gap-2 mt-2">
                              <span className="text-[12px] font-bold uppercase tracking-wider text-destructive">
                                {section.name.replace(/&amp;/g, '&')}
                              </span>
                              <div className="flex flex-col gap-2 pl-2">
                                {section.children && section.children.map((item, i) => (
                                  <Link
                                    key={i}
                                    to={`/category/${c.slug}?tag=${item.slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-[14px] uppercase tracking-wider text-[#0f1716]/80 hover:text-destructive py-1 transition-colors"
                                  >
                                    {item.name.replace(/&amp;/g, '&')}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-destructive/15 w-full mt-auto" />
              <div className="flex flex-col gap-4 pb-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setWishlistOpen(true);
                  }}
                  className="flex items-center gap-3 text-[14px] uppercase tracking-wider font-semibold text-[#0f1716] hover:text-destructive py-1.5 transition-colors cursor-pointer"
                >
                  <Heart size={18} className="text-destructive" />
                  <span>Wishlist ({wishlistItems.length})</span>
                </button>
                {customer ? (
                  <UserMenuInline onAfter={() => setIsMobileMenuOpen(false)} />
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLoginClick();
                    }}
                    className="flex items-center gap-3 text-[14px] cursor-pointer uppercase tracking-wider font-semibold text-[#0f1716] hover:text-destructive py-1.5 transition-colors cursor-pointer"
                    aria-label="Login / Account"
                  >
                    <User size={18} className="text-destructive" />
                    <span>Login / Account</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}