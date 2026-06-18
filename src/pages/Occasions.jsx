import { ProductCard } from "@/components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GanpatiImage from "../assets/categories/ganpati.jpg";
import OccasionHero from "../assets/corporate/OccasionHeroBg.webp";
import { useNavbarMenus } from "../context/NavbarContext";
import { getProductsByCategory, getProductsByParentCategory } from "../services/LoginServices";

// GRID — All categories
const AllGridIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

// BIRTHDAY CAKE with CANDLES — Birthdays
const BirthdayCakeIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="9" cy="8" rx="1.2" ry="1.8" fill="currentColor" stroke="none" />
    <ellipse cx="15" cy="8" rx="1.2" ry="1.8" fill="currentColor" stroke="none" />
    <rect x="8" y="9.5" width="2" height="5" fill="currentColor" stroke="none" />
    <rect x="14" y="9.5" width="2" height="5" fill="currentColor" stroke="none" />
    <path d="M4 14.5 Q7 12 10 14.5 Q13 17 16 14.5 Q19 12 20 14.5" />
    <rect x="4" y="14.5" width="16" height="7" rx="1" />
  </svg>
);

// GRADUATION CAP — Graduation
const GradCapIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 10 L12 5 L22 10 L12 15 Z" />
    <path d="M7 12.5 V18 Q12 21 17 18 V12.5" />
    <path d="M22 10 V16" />
    <circle cx="22" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// HEART — Valentine's Day
const HeartIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21 C12 21 3 15 3 9 C3 6 5 4 8 4 C10 4 11 5 12 7 C13 5 14 4 16 4 C19 4 21 6 21 9 C21 15 12 21 12 21 Z" />
  </svg>
);

// PARTY POPPER — Celebrations
const PartyPopperIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 22 L10 14" />
    <path d="M2 22 L8 20 L4 16 Z" fill="currentColor" stroke="none" />
    <path d="M10 14 L15 4 L20 9 Z" />
    <path d="M15 4 L20 9" />
    <path d="M14 2 L16 4" />
    <path d="M20 8 L22 10" />
    <path d="M19 2 L20 4" />
    <path d="M21 14 L22 16" />
    <circle cx="19" cy="6" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// CHRISTMAS TREE — Christmas
const ChristmasTreeIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2 L6 10 H9 L4 16 H9 L5 22 H19 L15 16 H20 L15 10 H18 Z" />
    <path d="M10 22 V24 H14 V22" />
    <circle cx="12" cy="5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

// SUN — New Year / Summer
const SunIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2 V4" />
    <path d="M12 20 V22" />
    <path d="M2 12 H4" />
    <path d="M20 12 H22" />
    <path d="M4.9 4.9 L6.3 6.3" />
    <path d="M17.7 17.7 L19.1 19.1" />
    <path d="M4.9 19.1 L6.3 17.7" />
    <path d="M17.7 6.3 L19.1 4.9" />
  </svg>
);

// FAMILY — Family occasions
const FamilyIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="5" r="2" />
    <circle cx="16" cy="5" r="2" />
    <circle cx="12" cy="9" r="1.5" />
    <path d="M5 10 Q5 8 8 8 Q11 8 11 10 L11 16 H5 Z" />
    <path d="M13 10 Q13 8 16 8 Q19 8 19 10 L19 16 H13 Z" />
    <path d="M10 12 Q10 10.5 12 10.5 Q14 10.5 14 12 L14 16 H10 Z" />
  </svg>
);

// GIFT BOX — Gift occasions
const GiftBoxIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="9" width="18" height="3" rx="0.5" />
    <rect x="5" y="12" width="14" height="9" rx="1" />
    <path d="M12 9 V21" />
    <path d="M12 9 C12 9 9 3 6 5 C4 6 5 9 8 9" />
    <path d="M12 9 C12 9 15 3 18 5 C20 6 19 9 16 9" />
  </svg>
);

// CIRCLE DOT — Default fallback
const DefaultIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

// BABY — Baby occasions fallback
const BabyIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="6" r="3" />
    <path d="M9 10 Q7 10 6 12 Q5 16 6 18 Q7 19 9 19" />
    <path d="M15 10 Q17 10 18 12 Q19 16 18 18 Q17 19 15 19" />
    <path d="M9 19 Q12 21 15 19" />
    <path d="M10 14 H14" />
    <path d="M6 12 L4 10" />
    <path d="M18 12 L20 10" />
  </svg>
);

const DiyaIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2 C12 2 9 6 9 9 C9 10.65 10.35 12 12 12 C13.65 12 15 10.65 15 9 C15 6 12 2 12 2 Z" />
    <path d="M4 14 H20 C20 18.42 16.42 22 12 22 C7.58 22 4 18.42 4 14 Z" />
    <path d="M12 12 V14" />
    <path d="M6 14 C6 14 9 12 12 12 C15 12 18 14 18 14" />
  </svg>
);

const HoliIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8 L8 20 Q12 22 16 20 L18 8 Z" />
    <ellipse cx="12" cy="8" rx="6" ry="2" />
    <path d="M8 8 C8 12 10 14 12 14 C14 14 16 12 16 8" fill="currentColor" stroke="none" />
    <path d="M5 14 H5.01" />
    <path d="M19 12 H19.01" />
    <path d="M17 18 H17.01" />
  </svg>
);

const RakhiIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12 C3 10 5 14 7 12" />
    <path d="M22 12 C21 14 19 10 17 12" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M12 7 V5" />
    <path d="M12 19 V17" />
    <path d="M7 12 H5" />
    <path d="M19 12 H17" />
    <path d="M15.5 8.5 L17 7" />
    <path d="M8.5 15.5 L7 17" />
    <path d="M8.5 8.5 L7 7" />
    <path d="M15.5 15.5 L17 17" />
  </svg>
);

// MEGAPHONE — Baby Announcement (universal symbol for announcement/news)
const AnnouncementIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9 H8 L20 4 L20 20 L8 15 H3 Z" />
    <path d="M8 15 L8 20 L11 20 L11 15" />
    <circle cx="20" cy="12" r="2" />
  </svg>
);

// GIFT BOX WITH BOW — Baby Shower (showering the parents-to-be with gifts)
const BabyShowerGiftIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="10" width="16" height="11" rx="1" />
    <rect x="3" y="7" width="18" height="4" rx="1" />
    <path d="M12 7 L12 21" />
    <path d="M12 7 Q9 2 7 4 Q5 6 9 7" />
    <path d="M12 7 Q15 2 17 4 Q19 6 15 7" />
  </svg>
);

// BABY FOOTPRINTS — Naming Ceremony (beginning of a new life's journey)
const FootprintsIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="8" cy="17" rx="3.5" ry="5" fill="currentColor" stroke="none" />
    <circle cx="5" cy="11" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="11" cy="11" r="1.5" fill="currentColor" stroke="none" />
    <ellipse cx="16" cy="10" rx="3" ry="4" fill="currentColor" stroke="none" />
    <circle cx="13" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="4.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="19" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

// BABY PRAM/STROLLER — New Parent Gifts (most iconic new parent symbol)
const PramIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 6 L8 6 Q18 6 18 14 H4 Q4 14 4 12 L4 9" />
    <path d="M2 6 L2 3" />
    <path d="M4 14 L3 18" />
    <path d="M18 14 L19 18" />
    <circle cx="7" cy="20" r="2" />
    <circle cx="16" cy="20" r="2" />
  </svg>
);

// TWO WEDDING RINGS — Anniversaries (classic anniversary symbol)
const WeddingRingsIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8.5" cy="12" r="5.5" />
    <circle cx="15.5" cy="12" r="5.5" />
  </svg>
);

// HOUSE WITH HEART — Housewarming (home + love)
const HouseHeartIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11 L12 3 L21 11" />
    <path d="M5 11 V20 Q5 21 6 21 H18 Q19 21 19 20 V11" />
    <path d="M12 15 Q10 12 9 13 Q8 14 9 15 Q10 17 12 18 Q14 17 15 15 Q16 14 15 13 Q14 12 12 15 Z" />
  </svg>
);

// CLEAN BRIEFCASE — New Job (starting a new career)
const NewJobIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M8 10 L8 7 Q8 5 10 5 H14 Q16 5 16 7 L16 10" />
    <path d="M3 16 H21" />
    <path d="M10 16 H14" strokeWidth="2.5" />
  </svg>
);

// SUNSET — Retirement (freedom, leisure, horizon of new life)
const SunsetIcon = ({ size = 15, className, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 18 H22" />
    <path d="M2 22 H22" />
    <path d="M6 18 A6 6 0 0 1 18 18" />
    <path d="M12 6 V4" />
    <path d="M4.5 8.5 L3 7" />
    <path d="M19.5 8.5 L21 7" />
    <path d="M3.5 14 L2 14" />
    <path d="M20.5 14 L22 14" />
  </svg>
);

export default function Occasions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [occasionCat, setOccasionCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navbarMenus = useNavbarMenus();

  const tagParam = searchParams.get("tag");
  const [activeTag, setActiveTag] = useState(tagParam || "");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState("occasions");
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState("parent");

  useEffect(() => {
    if (navbarMenus?.length > 0) {
      const found = navbarMenus.find((menu) => menu?.name === "Occasions");
      setOccasionCat(found);
    }
  }, [navbarMenus]);

  useEffect(() => {
    if (tagParam && occasionCat) {
      setActiveTag(tagParam);
      occasionCat?.children?.forEach((menu) => {
        const matched = menu.children?.find((s) => s.slug === tagParam);
        if (matched) {
          setActiveCategory(menu.name);
          setSelectedSlug(matched.slug);
          setSelectedId(matched.id);
          setFilterMode("exact");
        }
      });
    } else {
      setActiveTag("");
      setActiveCategory("All");
      setSelectedSlug("occasions");
      setSelectedId(null);
      setFilterMode("parent");
    }
  }, [tagParam, occasionCat]);

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
      if (!selectedSlug) {
        setIsLoading(false);
        return;
      }
      getProductsByParentCategory(selectedSlug)
        .then((res) => {
          setProducts(res.products);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [selectedSlug, selectedId, filterMode]);

  const subCategoriesToShow =
    activeCategory === "All"
      ? occasionCat?.children?.flatMap((category) => category.children || []) || []
      : occasionCat?.children?.find((c) => c.name === activeCategory)?.children || [];

  const decodeHtml = (text) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  };

  const getOccasionIcon = (name) => {
    const n = (name || "").toLowerCase();
    
    // All
    if (n.includes("all")) return <AllGridIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    // Baby & Family
    if (n.includes("announcement")) return <AnnouncementIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("shower")) return <BabyShowerGiftIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("naming")) return <FootprintsIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("parent")) return <PramIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("baby")) return <BabyIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("family")) return <FamilyIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    // Milestones
    if (n.includes("anniversar")) return <WeddingRingsIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("birthday") || n.includes("cake")) return <BirthdayCakeIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("graduation")) return <GradCapIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("housewarming") || n.includes("house") || n.includes("home")) return <HouseHeartIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("job") || n.includes("career") || n.includes("work")) return <NewJobIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("retirement")) return <SunsetIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    // Festive
    if (n.includes("ganpati") || n.includes("ganesh")) return <img src={GanpatiImage} alt="Ganpati" style={{ width: 20, height: 20, transform: "scale(1.6)" }} className="opacity-90 mix-blend-multiply" />;
    if (n.includes("holi")) return <HoliIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("diwali") || n.includes("festive") || n.includes("seasonal")) return <DiyaIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("raksha") || n.includes("rakhi")) return <RakhiIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("christmas")) return <ChristmasTreeIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("new year") || n.includes("summer")) return <SunIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("valentine")) return <HeartIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    // Generic
    if (n.includes("celebr") || n.includes("party")) return <PartyPopperIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    if (n.includes("gift")) return <GiftBoxIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
    return <DefaultIcon size={20} strokeWidth={1.5} className="opacity-90 text-[#1e2321]" />;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#0f1716]">
      <div className="relative w-full h-[60vh] md:h-[80vh] lg:h-screen min-h-[400px] flex items-center justify-center md:justify-start overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={OccasionHero}
            alt="Occasions"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-b md:from-black/30 md:via-black/20 md:to-black/35" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-16  2xl:px-2 flex flex-col items-center md:items-start mt-16 md:mt-0">
          <div className="max-w-2xl flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-white uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold mb-4 md:mb-6 block">
              CELEBRATE EVERY MOMENT
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-serif text-white mb-6 leading-[1.15]">
              Occasion Gifts
              <br />
              Made with Love
            </h1>
            <div className="flex items-center gap-3 mb-6 max-w-[280px]">
              <div className="h-[1px] bg-[#C5A26F]/40 flex-1"></div>
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
              <div className="h-[1px] bg-[#C5A26F]/40 flex-1"></div>
            </div>
            <p className="text-white/80 text-xs md:text-sm 2xl:text-lg max-w-[550px] 2xl:max-w-[700px] leading-relaxed font-medium">
              From birthdays to anniversaries, baby showers to festive celebrations — find the
              perfect gift for every special occasion.
            </p>
          </div>
        </div>
      </div>

      <div
        id="product-grid"
        className="mx-auto w-full px-4 md:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8 lg:gap-10"
      >
        <aside className="w-full lg:w-[260px] shrink-0">
          {/* ── Browse Collections ── */}
          <div className="mb-10">
            <h3 className="font-bold text-[11px] uppercase tracking-widest mb-6 text-[#1e2321]">
              Browse Collections
            </h3>
            <div className="space-y-1">
              <label
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors rounded-[4px] ${activeCategory === "All" ? "bg-[#F0EAE1] text-[#1e2321] font-medium" : "text-gray-500 hover:bg-[#F3EFE8]/50"}`}
                onClick={() => {
                  setActiveCategory("All");
                  setActiveTag("");
                  setSelectedSlug("occasions");
                  setSelectedId(null);
                  setFilterMode("parent");
                  setSearchParams({});
                }}
              >
                <div className="flex items-center justify-center w-5 h-5">
                  {getOccasionIcon("all")}
                </div>
                <span className="text-[13px] tracking-wide">All Categories</span>
              </label>

              {occasionCat?.children?.map((section, idx) => {
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
                      {getOccasionIcon(section.name)}
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
              OCCASIONS
            </h4>
            <div className="space-y-3">
              {subCategoriesToShow.map((item, idx) => {
                const isActive = activeTag === item.slug;
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-[4px] transition-all ${
                      isActive
                        ? "bg-[#F5EFE6] border-l-[3px] border-[#C5A26F]"
                        : "border-l-[3px] border-transparent hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setActiveTag(item.slug);
                      setSelectedSlug(item.slug);
                      setSelectedId(item.id);
                      setFilterMode("exact");
                      setSearchParams({ tag: item.slug });
                    }}
                  >
                    <div
                      className={`flex items-center justify-center w-5 h-5 ${isActive ? "text-[#C5A26F]" : ""}`}
                      style={isActive ? { filter: "none" } : {}}
                    >
                      <span className={isActive ? "[&>svg]:stroke-[#C5A26F]" : ""}>
                        {getOccasionIcon(item.name)}
                      </span>
                    </div>
                    <span
                      className={`text-[13px] transition-colors flex-1 ${isActive ? "text-[#1e2321] font-semibold" : "text-gray-500 group-hover:text-[#1e2321]"}`}
                    >
                      {decodeHtml(item.name)}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold tracking-wider text-[#C5A26F] uppercase">
                        ✓
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <button
              className="w-full mt-6 py-3 border border-gray-200 text-[11px] font-semibold tracking-widest text-gray-600 uppercase hover:bg-gray-50 transition-colors"
              onClick={() => {
                setActiveTag("");
                setActiveCategory("All");
                setSelectedSlug("occasions");
                setSelectedId(null);
                setFilterMode("parent");
                setSearchParams({});
              }}
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <p className="text-[13px] text-muted-foreground">
              Showing 1–{products.length} of {products.length} results
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[13px] text-muted-foreground mr-2">Active Filter</span>
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
                        ? occasionCat?.children?.find((c) => c.name === activeCategory)?.slug ||
                            "occasions"
                        : "occasions",
                    );
                    setSearchParams({});
                  }}
                  className="hover:text-gray-200"
                >
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
                setSelectedSlug("occasions");
                setSelectedId(null);
                setFilterMode("parent");
                setSearchParams({});
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-10 "
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
  );
}
