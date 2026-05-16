// Categories shown in nav + grid. Slug must match Shopify productType (case-insensitive lookup).
import CorporateImage from "../assets/categories/premiumGift.png";
import CustomizedGifts from "../assets/categories/CustomizedGifts.jpg";
import HampersImage from "../assets/categories/Hampers.jpg";
import OccasionsImage from "../assets/categories/OccasionGift.jpg";
import WeddingGift from "../assets/categories/WeddingGift.png";
import BabyShowerGift from "../assets/categories/BabyShower.png";

export const CATEGORIES = [
  // {
  //   slug: "personalized",
  //   label: "Personalized",
  //   productType: "Personalized",
  //   tagline: "Engraved & made for them",
  //   icon: "✎",
  //   image: PersonalizedImage,
  // },
  {
    slug: "customization",
    label: "Customization",
    productType: "Customized Gifts",
    tagline: "Personalized thoughtfulness",
    icon: "✎",
    image: CustomizedGifts,
  },
  {
    slug: "hampers",
    label: "Shop By Hampers",
    productType: "Hampers",
    tagline: "Curated luxury sets",
    icon: "✿",
    image: HampersImage,
  },
  {
    slug: "occasions",
    label: "Shop By Occasions",
    productType: "Occasion",
    tagline: "Festive thoughtfulness",
    icon: "❈",
    image: OccasionsImage,
  },
  {
    slug: "corporate",
    label: "Shop Corporate Gift",
    productType: "Corporate",
    tagline: "Professional excellence",
    icon: "❖",
    image: CorporateImage,
  },
  {
    slug: "wedding",
    label: "Wedding Gifts",
    productType: "Wedding",
    tagline: "Celebrate their big day",
    icon: "⚭",
    image: WeddingGift,
  },
  {
    slug: "baby-shower",
    label: "Baby Shower",
    productType: "Baby Shower",
    tagline: "Welcome the little one",
    icon: "👶",
    image: BabyShowerGift,
  },
];
export const getCategoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const getCategoryByType = (type) =>
  CATEGORIES.find((c) => c.productType.toLowerCase() === type.toLowerCase());
