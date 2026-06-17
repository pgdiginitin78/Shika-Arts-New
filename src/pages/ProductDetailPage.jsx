import { formatPrice, productToNode } from "@/lib/woocommerce";
import { getProductBySlug } from "@/services/LoginServices";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Gift,
  Heart,
  Loader2,
  Minus,
  Pen,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

function AccordionItem({ icon, label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1e2321]">
            {label}
          </span>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        )}
      </button>
      {open && <div className="pb-3 text-xs text-gray-500 leading-relaxed">{children}</div>}
    </div>
  );
}

function ProductDetailPage() {
  const { handle } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoading = useCartStore((s) => s.isLoading);

  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPack, setSelectedPack] = useState(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      const p = await getProductBySlug(handle);
      if (!p) return null;
      const node = productToNode(p);
      return { node };
    },
  });

  // Automatically select the first pack size by default for variable products
  useEffect(() => {
    if (data?.node?.productVariationType === "variable" && data?.node?.variationDetails?.length > 0 && !selectedPack) {
      setSelectedPack(data.node.variationDetails[0]);
    }
  }, [data, selectedPack]);

  const isInWishlist = useWishlistStore((s) => s.isInWishlist(data?.node?.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] px-3 md:px-6 lg:px-10 py-6">
        <div className="max-w-[1000px] mx-auto animate-pulse">
          <div className="h-3 w-24 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div className="flex gap-3">
              <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded" />
                ))}
              </div>
              <div className="flex-1 aspect-square bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-3">
              <div className="h-2 w-32 bg-gray-200 rounded" />
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-6 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <p className="text-gray-500 text-xs uppercase tracking-widest">Product not found</p>
      </div>
    );

  const node = data.node;
  const variant = node.variants?.edges?.[0]?.node;
  const allImages = node.images?.edges || [];
  const currentImage = allImages[activeImg]?.node;
  const categories = node.productType ? node.productType.split(",").map((c) => c.trim()) : [];

  // Variable product data
  const isVariable = node.productVariationType === "variable";
  const variationDetails = node.variationDetails || []; // pre-fetched with prices
  const hasVariationPrices = variationDetails.length > 0;

  // Price to display — use selected pack price if available, else default variant price
  const displayPrice = selectedPack
    ? selectedPack.price
    : Number(variant?.price?.amount || 0);
  const displayRegularPrice = selectedPack
    ? selectedPack.regularPrice
    : Number(variant?.regularPrice || 0);
  const displayCurrency = selectedPack
    ? selectedPack.currencyCode
    : (variant?.price?.currencyCode || "INR");

  const handleAdd = async () => {
    if (isVariable && !selectedPack) return; // require pack selection for variable products
    if (!variant && !isVariable) return;
    const productIdToAdd = selectedPack ? String(selectedPack.id) : node.id;
    await addItem({
      productId: productIdToAdd,
      handle: node.handle,
      product: node,
      quantity: qty,
    });
    setOpen(true);
  };

  const prevImage = () => setActiveImg((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextImage = () => setActiveImg((i) => (i === allImages.length - 1 ? 0 : i + 1));
  
  console.log("variationDetails",variationDetails)

  const getPriceSuffix = (title) => {
    if (!title) return "";
    const t = title.toLowerCase();
    if (t.includes("candle") || t.includes("diya") || t.includes("charm") || t.includes("tealight") || t.includes("peony") || t.includes("seashell") || t.includes("trio") || t.includes("quarter") || t.includes("mini-cake") || t.includes("medley") || t.includes("bar") || t.includes("sachet")) return "/ piece";
    
    if (t.includes("hamper") || t.includes("gift box") || t.includes("gift set") || t.includes("celebration") || t.includes("keepsake") || t.includes("box print")) return "";

    if (t.includes("set") || t.includes("box") || t.includes("trough") || t.includes("kit")) return "/ set";
    return "";
  };

  return (
    <div className="min-h-screen font-sans bg-[#FAF7F2]">
      <div className="px-3 pt-4 pb-2 mx-auto max-w-[1000px]">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-[#1e2321] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={12} /> Back to all gifts
        </Link>
      </div>
      <div className="px-3 py-2 pb-8 mx-auto max-w-[1000px]">
        <div className="overflow-hidden bg-white rounded-[10px] shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="flex flex-col sm:flex-row gap-2 p-3 sm:p-4 self-start">
              <div className="flex sm:flex-col gap-2 order-2 sm:order-1 sm:w-[50px] shrink-0 overflow-x-auto sm:overflow-y-auto h-[350px] pb-1 sm:pb-0 pr-0 sm:pr-1">
                {allImages.length > 0
                  ? allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`shrink-0 w-[45px] cursor-pointer h-[45px] sm:w-full sm:aspect-square overflow-hidden rounded border transition-all duration-200 ${activeImg === i ? "border-[#C5A26F] shadow-sm" : "border-transparent opacity-60 hover:opacity-90"}`}
                      >
                        <img
                          src={img.node.url}
                          alt={img.node.altText || `Image ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))
                  : [0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`shrink-0 w-[45px] h-[45px] sm:w-full sm:aspect-square rounded border bg-gray-100 ${i === 0 ? "border-[#C5A26F]" : "border-transparent"}`}
                      />
                    ))}
              </div>
              <div className="relative flex-1 order-1 sm:order-2 aspect-square sm:aspect-auto h-[430px] overflow-hidden rounded-lg bg-gray-50">
                {currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.altText || node.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-stone-100">
                    <span className="font-serif text-5xl text-[#C5A26F] opacity-30">✦</span>
                  </div>
                )}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute cursor-pointer left-2 bottom-3 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={14} className="text-[#1e2321]" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute cursor-pointer right-2 bottom-3 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight size={14} className="text-[#1e2321]" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col px-3 sm:px-4 lg:px-6 py-4 border-t lg:border-t-0 lg:border-l border-gray-100">
              {categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {categories.map((c, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#C5A26F]"
                    >
                      {i > 0 && <span className="mr-1.5 text-gray-300">•</span>}
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="font-serif text-xl sm:text-2xl lg:text-[26px] leading-tight text-[#1e2321] mb-2">
                {node.title}
              </h1>
              {(variant || selectedPack) && (
                <div className="flex items-baseline gap-2 mb-2">
                  {displayPrice > 0 ? (
                    <>
                      <span className="text-xl font-serif font-semibold text-[#1e2321]">
                        {formatPrice(displayPrice, displayCurrency)}
                        <span className="text-sm font-sans font-normal ml-1 text-gray-500">{getPriceSuffix(node.title)}</span>
                      </span>
                      {displayRegularPrice > 0 &&
                        displayRegularPrice !== displayPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(displayRegularPrice, displayCurrency)}
                          </span>
                        )}
                      {/* {!selectedPack && isVariable && (
                        <span className="text-[9px] text-gray-400 italic">Starting price</span>
                      )} */}
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-[#1e2321] italic">
                      Contact Us for Pricing & Customization
                    </span>
                  )}
                </div>
              )}
              {/* <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s <= 4 ? "text-[#C5A26F] fill-[#C5A26F]" : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">(32 reviews)</span>
              </div> */}
              {/* <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">
                    Personalization
                  </span>
                  <button className="cursor-pointer flex items-center gap-1 text-[10px] text-[#C5A26F] hover:underline">
                    <Pen size={10} />
                    Make it special
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PERSONALIZATIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() =>
                        setActivePersonalization(activePersonalization === p ? null : p)
                      }
                      className={`px-2 cursor-pointer py-1 rounded border text-[10px] tracking-wide transition-all duration-200 ${activePersonalization === p ? "border-[#C5A26F] bg-[#FDF8F1] text-[#1e2321] font-medium" : "border-gray-200 text-gray-500 hover:border-[#C5A26F]/50"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Pack Size Selection — only shown for variable products */}
              {isVariable && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">
                      {node.attributes?.[0]?.name ? `Select ${node.attributes[0].name}` : "Select Option"}
                    </span>
                    {selectedPack && (
                      <button
                        onClick={() => setSelectedPack(null)}
                        className="text-[9px] text-[#C5A26F] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {hasVariationPrices ? (
                    <div className="grid grid-cols-2 gap-2">
                      {variationDetails.map((vd) => {
                        // Find label from attributes array on the variation detail
                        const packAttr = vd.attributes?.[0];
                        
                        // Fallback: check the main product's variation list for this ID
                        const mainVariation = node.variations?.find(v => v.id === vd.id);
                        const mainPackAttr = mainVariation?.attributes?.[0];
                        
                        const attrIndex = variationDetails.indexOf(vd);
                        const fallbackTerm = node.attributes?.[0]?.terms?.[attrIndex]?.name || node.attributes?.[0]?.options?.[attrIndex];
                        
                        const label = packAttr?.value || packAttr?.terms?.[0]?.name || mainPackAttr?.value || packAttr?.option || fallbackTerm || `${node.attributes?.[0]?.name || "Option"} ${vd.id}`;
                        const isSelected = selectedPack?.id === vd.id;
                        const isOnSale = vd.regularPrice > 0 && vd.regularPrice !== vd.price;

                        return (
                          <button
                            key={vd.id}
                            onClick={() => setSelectedPack(isSelected ? null : vd)}
                            className={`w-full border rounded-lg p-3 flex items-center justify-between transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-[#C5A26F] bg-[#FDF8F1] shadow-sm"
                                : "border-gray-200 hover:border-[#C5A26F]/50 hover:bg-gray-50"
                            } ${!vd.inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={!vd.inStock}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected ? "border-[#C5A26F]" : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-[#C5A26F]" />
                                )}
                              </div>
                              <span className="text-xs font-medium text-[#1e2321]">
                                {label}
                              </span>
                              {!vd.inStock && (
                                <span className="text-[9px] text-red-400 uppercase tracking-wider">
                                  Out of stock
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isOnSale && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  {formatPrice(vd.regularPrice, vd.currencyCode)}
                                </span>
                              )}
                              <span
                                className={`text-xs font-semibold ${
                                  isOnSale ? "text-[#C5A26F]" : "text-[#1e2321]"
                                }`}
                              >
                                {formatPrice(vd.price, vd.currencyCode)}
                              </span>
                              {isOnSale && (
                                <span className="text-[9px] bg-[#C5A26F]/10 text-[#C5A26F] px-1 py-0.5 rounded">
                                  Sale
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Fallback: show attribute terms without prices (variation prices still loading or unavailable)
                    <div className="space-y-2">
                      {(node.attributes?.[0]?.terms || []).map((term) => {
                        const isSelected = selectedPack?.slug === term.slug;
                        return (
                          <button
                            key={term.slug}
                            onClick={() => setSelectedPack(isSelected ? null : { id: term.slug, slug: term.slug, price: null })}
                            className={`w-full border rounded-lg p-3 flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-[#C5A26F] bg-[#FDF8F1]"
                                : "border-gray-200 hover:border-[#C5A26F]/50"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? "border-[#C5A26F]" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#C5A26F]" />}
                            </div>
                            <span className="text-xs font-medium text-[#1e2321]">
                              {term.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isVariable && !selectedPack && (
                    <p className="mt-1.5 text-[9px] text-amber-600 flex items-center gap-1">
                      <span>⚠</span> Please select an option to add to cart
                    </p>
                  )}
                </div>
              )}
              {displayPrice > 0 && (
                <>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500 block">
                        Quantity
                      </span>
                      {qty > 1 && (
                        <span className="text-[11px] font-semibold text-[#C5A26F] tracking-wide">
                          Total: {formatPrice(displayPrice * qty, displayCurrency)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden w-fit">
                        <button
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className="w-8 h-9 cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors text-[#1e2321]"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-10 h-9 flex items-center justify-center font-semibold text-[#1e2321] text-xs border-x border-gray-200">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(qty + 1)}
                          className="w-8 h-9 cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors text-[#1e2321]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={handleAdd}
                        disabled={isLoading || (isVariable && !selectedPack) || (!variant && !isVariable)}
                        className="flex-1 h-9 cursor-pointer flex items-center justify-center gap-1.5 bg-[#1e2321] text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#2d3532] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <ShoppingBag size={14} />
                            {isVariable && !selectedPack
                              ? "Select an Option"
                              : "Add to Cart"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href =
                        "https://lawngreen-marten-717862.hostingersite.com/checkout";
                    }}
                    className="w-full h-9 cursor-pointer flex items-center justify-center gap-1.5 border border-[#C5A26F] text-[#C5A26F] rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#FDF8F1] transition-colors mb-4"
                  >
                    Buy Now
                  </button>
                </>
              )}
              <button
                onClick={() => toggleWishlist(data)}
                className={`flex items-center cursor-pointer justify-center gap-1.5 w-full py-2 rounded text-[11px] font-medium border transition-all duration-200 mb-4 ${isInWishlist ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`}
              >
                <Heart size={12} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
                {isInWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
              </button>
              <div className="border-b border-gray-100">
                <AccordionItem icon={<ShoppingBag size={14} />} label="Description">
                  {node.description ||
                    "A beautifully crafted gift, made with premium materials and finished by hand. Perfect for every occasion."}
                </AccordionItem>
                <AccordionItem icon={<Gift size={14} />} label="What's Included">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Premium gift box</li>
                    <li>Personalised message card</li>
                    <li>Tissue paper & ribbon</li>
                    <li>Shika Arts certificate of quality</li>
                  </ul>
                </AccordionItem>
                <AccordionItem icon={<Truck size={14} />} label="Shipping & Delivery">
                  Standard delivery in 7 business days. Express delivery available at checkout.
                </AccordionItem>
                {/* <AccordionItem icon={<Star size={14} />} label="Reviews">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={10}
                            className={s <= 5 ? "text-[#C5A26F] fill-[#C5A26F]" : "text-gray-200"}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-[#1e2321]">
                        Beautiful packaging!
                      </span>
                    </div>
                    <p className="text-[11px]">
                      "Loved the quality and attention to detail. Will definitely order again."
                    </p>
                    <p className="text-[9px] uppercase tracking-wider">
                      — Priya S., Verified Buyer
                    </p>
                  </div>
                </AccordionItem> */}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 px-3 sm:px-4 py-3 border-t border-gray-100 bg-[#FAFAF8]">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2">
              <div className="w-7 h-7 rounded-full bg-[#F0EAE1] flex items-center justify-center shrink-0">
                <Truck size={12} className="text-[#C5A26F]" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-semibold text-[#1e2321] leading-tight">
                  Same-day delivery
                </p>
                <p className="text-[8px] sm:text-[9px] text-gray-400 leading-tight">
                  Order before 2 PM
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2">
              <div className="w-7 h-7 rounded-full bg-[#F0EAE1] flex items-center justify-center shrink-0">
                <Sparkles size={12} className="text-[#C5A26F]" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-semibold text-[#1e2321] leading-tight">
                  Hand-finished
                </p>
                <p className="text-[8px] sm:text-[9px] text-gray-400 leading-tight">
                  Crafted with care
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2">
              <div className="w-7 h-7 rounded-full bg-[#F0EAE1] flex items-center justify-center shrink-0">
                <ShieldCheck size={12} className="text-[#C5A26F]" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-semibold text-[#1e2321] leading-tight">
                  Quality guaranteed
                </p>
                <p className="text-[8px] sm:text-[9px] text-gray-400 leading-tight">
                  Premium materials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
