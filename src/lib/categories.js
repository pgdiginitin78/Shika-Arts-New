// Categories shown in nav + grid.
import CorporateImage from "../assets/homePage/CorporateGifts.webp";
import CustomizedGifts from "../assets/homePage/CustomizedGifts.webp";
import HampersImage from "../assets/categories/Hampers.webp";
import OccasionsImage from "../assets/homePage/OccasionGift.webp";
import WeddingGift from "../assets/homePage/Wedding.webp";


export const CATEGORIES = [
  {
    slug: "Corporate",
    label: "Shop Corporate Gift",
    productType: "Corporate",
    tagline: "Professional excellence",
    icon: "❖",
    image: CorporateImage,
  },
  {
    slug: "Occasions",
    label: "Occasions",
    productType: "Occasions",
    tagline: "Engraved & made for them",
    icon: "✎",
    image: OccasionsImage,
  },
  {
    slug: "Wedding",
    label: "Wedding Gifts",
    productType: "Wedding",
    tagline: "Celebrate their big day",
    icon: "⚭",
    image: WeddingGift,
  },
  {
    slug: "Customization",
    label: "Customization",
    productType: "Customized Gifts",
    tagline: "Personalized thoughtfulness",
    icon: "✎",
    image: CustomizedGifts,
  },
  {
    slug: "Packaging Studio",
    label: "Packaging Studio",
    productType: "Packaging Studio",
    tagline: "Curated luxury sets",
    icon: "✿",
    image: HampersImage,
  },
  // {
  //   slug: "occasions",
  //   label: "Shop By Occasions",
  //   productType: "Occasion",
  //   tagline: "Festive thoughtfulness",
  //   icon: "❈",
  //   image: OccasionsImage,
  // },

  // {
  //   slug: "Baby Shower",
  //   label: "Baby Shower",
  //   productType: "Baby Shower",
  //   tagline: "Welcome the little one",
  //   icon: "👶",
  //   image: BabyShowerGift,
  // },
];
export const getCategoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
