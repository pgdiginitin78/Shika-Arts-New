import { CATEGORIES } from "@/lib/categories";
import { useCartStore } from "@/stores/cartStore";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MainLogo from "../assets/mainLogos/shikaArtsLogo.webp";
import { LocationSelector } from "./LocationSelector";
import { LoginModal } from "./LoginModal";
import { UserMenu, UserMenuInline } from "./UserMenu";

export const MENU_ITEMS = {
  occasions: [
    {
      category: "Celebrations",
      subCategory: [
        { name: "Birthdays", link: "/category/Occasions?tag=Birthday" },
        { name: "Anniversaries", link: "/category/Occasions?tag=Anniversary" },
        { name: "HouseWarming", link: "/category/Occasions?tag=housewarming" },
        { name: "Graduation", link: "/category/Occasions?tag=graduation" },
        { name: "New Job", link: "/category/Occasions?tag=new job" },
        { name: "Retirement", link: "/category/Occasions?tag=retirement" },
      ],
    },
    {
      category: "Baby & Family",
      subCategory: [
        { name: "Baby Announcement", link: "/category/Occasions?tag=baby announcement" },
        { name: "Baby Shower", link: "/category/Occasions?tag=baby shower" },
        { name: "Naming Ceremony", link: "/category/Occasions?tag=naming ceremony" },
        { name: "New Parent Gifts", link: "/category/Occasions?tag=new parent gifts" },
      ],
    },
    {
      category: "Seasonal & Festive",
      subCategory: [
        { name: "Raksha Bandhan", link: "/category/Occasions?tag=raksha bandhan" },
        { name: "Valentine's", link: "/category/Occasions?tag=velentine's" },
        { name: "Diwali", link: "/category/Occasions?tag=diwali" },
        { name: "Christmas", link: "/category/Occasions?tag=christmas" },
      ],
    },
  ],

  corporate: [
    {
      category: "Employee Gifting",
      subCategory: [
        { name: "Joining Kits", link: "/category/Corporate?tag=joining kits" },
        { name: "Event Gifting", link: "/category/Corporate?tag=event gifting" },
        { name: "Work Anniversaries", link: "/category/Corporate?tag=work anniversaries" },
        { name: "Rewards", link: "/category/Corporate?tag=rewards" },
        { name: "Wellness Box", link: "/category/Corporate?tag=wellness box" },
      ],
    },
    {
      category: "Client Gifting",
      subCategory: [
        { name: "New Year Gifting", link: "/category/Corporate?tag=new year gifting" },
        { name: "Festive Gifting", link: "/category/Corporate?tag=festive gifting" },
        { name: "Executive Gifts", link: "/category/Corporate?tag=executive gifts" },
        { name: "Premium Collection", link: "/category/Corporate?tag=premium collection" },
      ],
    },
    {
      category: "Annual Gifting Calendar",
      subCategory: [
        {
          name: "Annual Gifting Calendar",
          link: "/category/Corporate?tag=annual gifting calendar",
        },
      ],
    },
  ],
  wedding: [
    {
      category: "Invitations",
      subCategory: [
        { name: "Physical Invites", link: "/category/Wedding?tag=physical invites" },
        { name: "Digital Invites", link: "/category/Wedding?tag=digital invites" },
        { name: "Luxury Box Invites", link: "/category/Wedding?tag=luxury box invites" },
      ],
    },
    {
      category: "Wedding Hampers",
      subCategory: [
        { name: "Bridesmaid Boxes", link: "/category/Wedding?tag=Wedding" },
        { name: "Groomsmen Kits", link: "/category/Wedding?tag=Wedding" },
        { name: "Guest Welcome Kits", link: "/category/Wedding?tag=Wedding" },
        { name: "Return Gifts", link: "/category/Wedding?tag=Wedding" },
      ],
    },
  ],
  customization: [
    {
      category: "Packaging Personalisation",
      subCategory: [
        { name: "Custom Boxes", link: "/category/Customization?tag=custom-boxes" },
        { name: "Ribbons", link: "/category/Customization?tag=ribbons" },
        { name: "Sleeves", link: "/category/Customization?tag=sleeves" },
        { name: "Colour Themes", link: "/category/Customization?tag=colour-themes" },
      ],
    },
    {
      category: "Corporate Branding",
      subCategory: [
        { name: "Logo Placement", link: "/category/Customization?tag=logo-placement" },
        { name: "Welcome Kits", link: "/category/Customization?tag=welcome-kits" },
        { name: "Employee Gifting", link: "/category/Customization?tag=employee-gifting" },
      ],
    },
    {
      category: "Wedding Personalisation",
      subCategory: [
        { name: "Invitation", link: "/category/Customization?tag=invitation" },
        { name: "Guest Favours", link: "/category/Customization?tag=guest-favours" },
        { name: "Bridesmaid Boxes", link: "/category/Customization?tag=bridesmaid-boxes" },
      ],
    },
  ],
  "Packaging Studio": [
    {
      category: "Boxes",
      subCategory: [
        { name: "Luxury Boxes", link: "/category/Packaging-Studio?tag=luxury-boxes" },
        { name: "Magnetic Boxes", link: "/category/Packaging-Studio?tag=magnetic-boxes" },
        { name: "Acrylic Boxes", link: "/category/Packaging-Studio?tag=acrylic-boxes" },
      ],
    },
    {
      category: "Baskets",
      subCategory: [
        { name: "Wicker", link: "/category/Packaging-Studio?tag=wicker-basket" },
        { name: "Premium Cane", link: "/category/Packaging-Studio?tag=premium-cane-basket" },
        { name: "Festive ", link: "/category/Packaging-Studio?tag=festive-basket" },
      ],
    },
    {
      category: "Wraps & Papers",
      subCategory: [
        { name: "Floral", link: "/category/Packaging-Studio?tag=floral" },
        { name: "Minimal", link: "/category/Packaging-Studio?tag=minimal" },
        { name: "Festive", link: "/category/Packaging-Studio?tag=festive" },
      ],
    },
    {
      category: "Finishing Touches",
      subCategory: [
        { name: "Ribbons", link: "/category/Packaging-Studio?tag=ribbons" },
        { name: "Tags", link: "/category/Packaging-Studio?tag=tags" },
        { name: "Wax Seals", link: "/category/Packaging-Studio?tag=wax-seals" },
        { name: "Personalised Notes", link: "/category/Packaging-Studio?tag=personal-notes" },
      ],
    },
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

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const customer = useCustomerAuthStore((s) => s.customer);
  
  const handleLoginClick = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://shika-arts-premium-gifts-jmx4i.myshopify.com/account/login?return_url=${returnUrl}`;
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
              className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl px-4 xl:px-12 flex items-center"
            >
              <form onSubmit={handleSearch} className="w-full flex items-center gap-6">
                <Search className="text-destructive" size={24} />
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
                  className="text-[10px] uppercase tracking-ultra font-bold hover:text-destructive transition-colors cursor-pointer"
                >
                  Close
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto flex w-full items-center justify-between px-4 lg:px-6 relative h-[58px] md:min-h-[64px] py-2">
          {/* <img
                src={MainLogo}
                alt="Main Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 2xl:w-32 2xl:h-32 object-contain"
              /> */}
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

          <nav className="hidden lg:flex items-center gap-6">
            <NavLink
              to="/"
              onMouseEnter={() => setActiveMenu(null)}
              className={({ isActive }) =>
                `text-[12px] 2xl:text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-destructive" : "text-foreground hover:text-destructive"}`
              }
            >
              Home
            </NavLink>
            {/* <NavLink
            to="/products"
            onMouseEnter={() => setActiveMenu(null)}
            className={({ isActive }) =>
              `text-[12px] 2xl:text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive ? "text-destructive" : "text-foreground hover:text-destructive"}`
            }
          >
            All Gifts
          </NavLink> */}

            {CATEGORIES.slice(0, 5).map((c) => (
              <div
                key={c.slug}
                onMouseEnter={() => setActiveMenu(c.slug)}
                className="relative py-4 cursor-pointer"
              >
                <NavLink
                  to={`/category/${c.slug}`}
                  className={({ isActive }) =>
                    `flex items-center gap-1 text-[12px] 2xl:text-[16px] uppercase tracking-wider font-semibold transition-colors ${isActive || activeMenu === c.slug ? "text-destructive" : "text-foreground hover:text-destructive"}`
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
              className="text-foreground hover:text-destructive transition-colors p-1"
              aria-label="Search"
            >
              <Search
                className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]"
                strokeWidth={2}
              />
            </button>

            <button
              onClick={() => setWishlistOpen(true)}
              className="group relative flex items-center p-1 text-foreground hover:text-destructive transition-colors hidden sm:flex"
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
                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center bg-destructive text-[8px] sm:text-[9px] font-bold text-primary"
                >
                  {wishlistItems.length}
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
                className="group relative flex items-center p-1 cursor-pointer text-foreground hover:text-destructive transition-colors hidden sm:flex"
                aria-label="Login / Account"
              >
                <User
                  className="h-5 w-5 sm:h-[18px] sm:w-[18px] 2xl:w-[24px] 2xl:h-[24px]"
                  strokeWidth={2}
                />
              </button>
            )}

            <button
              onClick={() => setOpen(true)}
              className="group relative flex items-center p-1 text-foreground hover:text-destructive transition-colors"
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

            {/* Mobile Hamburger Menu (Right Side) */}
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
          {activeMenu && (MENU_ITEMS[activeMenu] || MENU_ITEMS[activeMenu.toLowerCase()]) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute left-0 w-full bg-white/95 backdrop-blur-xl border-b border-border shadow-luxe overflow-hidden hidden lg:block"
            >
              <div className="w-full px-12 py-12 grid grid-cols-4 gap-12">
                <div className="col-span-1">
                  <h3 className="font-serif text-3xl mb-2 italic">The {activeMenu}</h3>
                  <p className="text-[14px] 2xl:text-[16px] text-muted-foreground  tracking-widest leading-relaxed">
                    {activeMenu === "Occasions"
                      ? "Discover thoughtfully curated gifting experiences designed for every occasion."
                      : activeMenu === "Corporate"
                        ? "From onboarding kits to festive campaigns, thoughtfully curated gifting that strengthens every connection."
                        : activeMenu === "Wedding"
                          ? "Craft a wedding celebration that feels uniquely yours with custom invitations, curated hampers, and thoughtful gifting details."
                          : activeMenu === "Customization"
                            ? "From personalised products and custom packaging to curated hampers and branded details, we create gifting experiences designed uniquely around your vision."
                            : "Elevate every gift with beautifully curated packaging designed to leave a lasting impression."}
                  </p>
                  <Link
                    to={`/category/${activeMenu}`}
                    onClick={() => setActiveMenu(null)}
                    className="inline-block mt-3 text-end text-[10px] 2xl:text-[16px] uppercase tracking-ultra font-bold text-destructive border-b border-destructive pb-1"
                  >
                    View All
                  </Link>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-8">
                  {(MENU_ITEMS[activeMenu] || MENU_ITEMS[activeMenu.toLowerCase()]).map(
                    (section, idx) => (
                      <div key={idx} className="flex flex-col gap-4">
                        <h4 className="text-[16px] 2xl:text-[18px] font-semibold  font-serif italic  text-destructive mb-1">
                          {section.category}
                        </h4>
                        <div className="flex flex-col gap-3">
                          {section.subCategory.map((item, i) => (
                            <Link
                              key={i}
                              to={item.link}
                              className="group flex flex-col"
                              onClick={() => setActiveMenu(null)}
                            >
                              <span className="text-[12px] 2xl:text-[16px]  tracking-wider font-semibold text-foreground group-hover:text-destructive transition-colors">
                                {item.name}
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

                {CATEGORIES.slice(0, 5).map((c) => {
                  const menuData = MENU_ITEMS[c.slug] || MENU_ITEMS[c.slug.toLowerCase()];
                  const hasSubMenu = !!menuData;
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
                          {c.productType}
                        </NavLink>
                        {hasSubMenu && (
                          <button
                            onClick={(e) => toggleCategory(c.slug, e)}
                            className="p-1.5 text-destructive hover:text-[#0f1716] transition-colors cursor-pointer"
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
                          className="overflow-hidden flex flex-col gap-4 pl-4 border-l border-destructive/20"
                        >
                          {menuData.map((section, idx) => (
                            <div key={idx} className="flex flex-col gap-2 mt-2">
                              <span className="text-[12px] font-bold uppercase tracking-wider text-destructive">
                                {section.category}
                              </span>
                              <div className="flex flex-col gap-2 pl-2">
                                {section.subCategory.map((item, i) => (
                                  <Link
                                    key={i}
                                    to={item.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-[14px] uppercase tracking-wider text-[#0f1716]/80 hover:text-destructive py-1 transition-colors"
                                  >
                                    {item.name}
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

              {/* Wishlist & Account */}
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

      {/* <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} /> */}
    </>
  );
}
