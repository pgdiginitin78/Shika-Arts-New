import { formatPrice, productToNode } from "@/lib/woocommerce";
import { getProductBySlug } from "@/services/LoginServices";
import { addToWishlistApi } from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
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
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

function VariationPicker({ variationDetails, node, selectedPack, setSelectedPack }) {
  const attr0Name = node.attributes?.[0]?.name || "Option";
  const attr1Name = node.attributes?.[1]?.name || "";

  const colorGroups = [];
  variationDetails.forEach((vd) => {
    const colorVal = vd.attributes?.[0]?.value || vd.attributes?.[0]?.option || "Option";
    let group = colorGroups.find((g) => g.value === colorVal);
    if (!group) {
      group = { value: colorVal, items: [] };
      colorGroups.push(group);
    }
    group.items.push(vd);
  });

  const selectedColor =
    selectedPack?.attributes?.[0]?.value || selectedPack?.attributes?.[0]?.option || null;
  const activeGroup = colorGroups.find((g) => g.value === selectedColor) || null;

  return (
    <div className="space-y-3">
      <div>
        {attr0Name && (
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">
            {attr0Name}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {colorGroups.map((group) => {
            const isActive = group.value === selectedColor;
            const anyInStock = group.items.some((i) => i.inStock);
            return (
              <button
                key={group.value}
                onClick={() => {
                  const firstAvailable = group.items.find((i) => i.inStock) || group.items[0];
                  setSelectedPack(isActive ? null : firstAvailable);
                }}
                disabled={!anyInStock}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-[#C5A26F] bg-[#FDF8F1] text-[#1e2321] shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-[#C5A26F]/50 hover:bg-gray-50"
                } ${!anyInStock ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {group.value}
              </button>
            );
          })}
        </div>
      </div>

      {activeGroup && (
        <div>
          {attr1Name && (
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">
              {attr1Name}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {activeGroup.items.map((vd) => {
              const isSelected = selectedPack?.id === vd.id;
              const isOnSale = vd.regularPrice > 0 && vd.regularPrice !== vd.price;
              const packLabel =
                vd.attributes?.[1]?.value ||
                vd.attributes?.[1]?.option ||
                vd.attributes[0]?.value ||
                "";
              console.log("112334334", vd.attributes[0]?.value);
              return (
                <button
                  key={vd.id}
                  onClick={() => setSelectedPack(isSelected ? null : vd)}
                  disabled={!vd.inStock}
                  className={`w-full border rounded-lg p-3 flex flex-col items-start gap-1 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[#C5A26F] bg-[#FDF8F1] shadow-sm"
                      : "border-gray-200 hover:border-[#C5A26F]/50 hover:bg-gray-50"
                  } ${!vd.inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "border-[#C5A26F]" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#C5A26F]" />}
                      </div>
                      {packLabel && (
                        <span className="text-xs font-medium text-[#1e2321]">{packLabel}</span>
                      )}
                    </div>
                    {!vd.inStock && (
                      <span className="text-[9px] text-red-400 uppercase tracking-wider">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 pl-6">
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
        </div>
      )}
    </div>
  );
}

function ProductDetailPage() {
  const { handle } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const isLoading = useCartStore((s) => s.isLoading);
  const navigate = useNavigate();

  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isWishlisting, setIsWishlisting] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      const p = await getProductBySlug(handle);
      if (!p) return null;
      const node = productToNode(p);
      return { node, raw: p };
    },
  });

  useEffect(() => {
    if (
      data?.node?.productVariationType === "variable" &&
      data?.node?.variationDetails?.length > 0 &&
      !selectedPack
    ) {
      setSelectedPack(data.node.variationDetails[0]);
    }
  }, [data, selectedPack]);

  const isInWishlist = useWishlistStore((s) => s.isInWishlist(data?.node?.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] px-3 md:px-6 lg:px-10 py-6">
        <div className="max-w-[1000px] mx-auto">
          <Skeleton className="h-3 w-24 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div className="flex gap-3">
              <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
              <Skeleton className="flex-1 aspect-square" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
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
  const rawProduct = data.raw;
  const variant = node.variants?.edges?.[0]?.node;
  const allImages = node.images?.edges || [];
  const currentImage = allImages[activeImg]?.node;
  const categories = node.productType ? node.productType.split(",").map((c) => c.trim()) : [];

  const isVariable = node.productVariationType === "variable";
  const variationDetails = node.variationDetails || [];
  const hasVariationPrices = variationDetails.length > 0;

  const displayPrice = selectedPack ? selectedPack.price : Number(variant?.price?.amount || 0);
  const displayRegularPrice = selectedPack
    ? selectedPack.regularPrice
    : Number(variant?.regularPrice || 0);
  const displayCurrency = selectedPack
    ? selectedPack.currencyCode
    : variant?.price?.currencyCode || "INR";

  const handleAdd = async () => {
    if (isVariable && !selectedPack) return;
    if (!variant && !isVariable) return;

    const variationAttributes =
      isVariable && selectedPack
        ? (selectedPack.attributes || []).map((attr) => ({
            attribute: attr.name || attr.attribute || "",
            value: attr.value || "",
          }))
        : [];

    await addItem({
      productId: node.id,
      variationId: isVariable && selectedPack ? selectedPack.id : null,
      variationAttributes,
      handle: node.handle,
      product: node,
      quantity: qty,
    });
    setOpen(true);
  };

  const handleBuyNow = async () => {
    if (isVariable && !selectedPack) {
      toast.error("Please select an option first");
      return;
    }

    const variationAttributes =
      isVariable && selectedPack
        ? (selectedPack.attributes || []).map((attr) => ({
            attribute: attr.name || attr.attribute || "",
            value: attr.value || "",
          }))
        : [];

    await addItem({
      productId: node.id,
      variationId: isVariable && selectedPack ? selectedPack.id : null,
      variationAttributes,
      handle: node.handle,
      product: node,
      quantity: qty,
    });

    navigate("/checkout");
  };

  const handleWishlist = async () => {
    if (isWishlisting) return;

    setIsWishlisting(true);
    try {
      if (isInWishlist) {
        toggleWishlist(data);
        toast.success("Removed from wishlist");
      } else {
        if (isVariable && !selectedPack) {
          toast.error("Please select an option first");
          return;
        }

        const resolvedId = Number(
          isVariable && selectedPack ? selectedPack.id : rawProduct?.id || node?.id || 0,
        );

        if (!resolvedId) {
          toast.error("Couldn't add to wishlist — missing product info.");
          return;
        }

        const basePermalink =
          rawProduct?.permalink || `${window.location.origin}/product/${node?.handle}/`;

        const variationAttrs =
          isVariable && selectedPack
            ? (selectedPack.attributes || []).map((attr) => {
                const attrName = attr.name || attr.attribute || "";
                const attrValue = attr.value || attr.option || "";
                const slug = `attribute_${attrName.toLowerCase().replace(/\s+/g, "-")}`;
                return { raw_attribute: slug, attribute: attrName, value: attrValue };
              })
            : [];

        const permalink =
          variationAttrs.length > 0
            ? `${basePermalink}${basePermalink.includes("?") ? "&" : "?"}${variationAttrs
                .map((v) => `${v.raw_attribute}=${encodeURIComponent(v.value)}`)
                .join("&")}`
            : basePermalink;

        const payload = rawProduct
          ? {
              ...rawProduct,
              quantity: qty,
              product_id: resolvedId,
              variation_id: 0,
              permalink,
              variation: variationAttrs,
            }
          : null;

        if (!payload) {
          toast.error("Couldn't add to wishlist — missing product info.");
          return;
        }

        await addToWishlistApi(payload);
        await useWishlistStore.getState().fetchWishlist();
        toggleWishlist(data);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Couldn't update wishlist. Please try again.");
    } finally {
      setIsWishlisting(false);
    }
  };

  const prevImage = () => setActiveImg((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextImage = () => setActiveImg((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const getPriceSuffix = (title) => {
    if (!title) return "";
    const t = title.toLowerCase();
    if (
      t.includes("candle") ||
      t.includes("diya") ||
      t.includes("charm") ||
      t.includes("tealight") ||
      t.includes("peony") ||
      t.includes("seashell") ||
      t.includes("trio") ||
      t.includes("quarter") ||
      t.includes("mini-cake") ||
      t.includes("medley") ||
      t.includes("bar") ||
      t.includes("sachet") ||
      t.includes("bags") ||
      t.includes("bag")||
       t.includes("badges")
    )
      return "/ pp";

    if (
      t.includes("hamper") ||
      t.includes("gift box") ||
      t.includes("gift set") ||
      t.includes("celebration") ||
      t.includes("keepsake") ||
      t.includes("box print")
    )
      return "";

    if (t.includes("set") || t.includes("box") || t.includes("trough") || t.includes("kit"))
      return "/ set";
    return "";
  };

  return (
    <div className="min-h-screen font-sans bg-[#FAF7F2]">
      <div className="px-3 pt-4 pb-2 mx-auto max-w-[1200px]">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-[10px] 2xl:text-[14px] text-gray-500 hover:text-[#1e2321] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft /> Back to all gifts
        </Link>
      </div>
      <div className="px-3 py-2 pb-8 mx-auto max-w-[1200px]">
        <div className="overflow-hidden bg-white rounded-[10px] shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="flex flex-col sm:flex-row gap-2 p-3 sm:p-4 self-start">
              <div className="flex sm:flex-col gap-2 order-2 sm:order-1 sm:w-[50px] shrink-0 overflow-x-auto sm:overflow-y-auto md:h-[400px] pb-1 sm:pb-0 pr-0 sm:pr-1">
                {allImages.length > 0
                  ? allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`shrink-0 w-[45px] cursor-pointer h-[45px] sm:w-full sm:aspect-square overflow-hidden rounded border transition-all duration-200 ${
                          activeImg === i
                            ? "border-[#C5A26F] shadow-sm"
                            : "border-transparent opacity-60 hover:opacity-90"
                        }`}
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
                        className={`shrink-0 w-[45px] h-[45px] sm:w-full sm:aspect-square rounded border bg-gray-100 ${
                          i === 0 ? "border-[#C5A26F]" : "border-transparent"
                        }`}
                      />
                    ))}
              </div>
              <div className="relative flex-1 order-1 sm:order-2 aspect-square sm:aspect-auto h-[490px] overflow-hidden rounded-lg bg-gray-50">
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
                        <span className="text-sm font-sans font-normal ml-1 text-gray-500">
                          {getPriceSuffix(node.title)}
                        </span>
                      </span>
                      {displayRegularPrice > 0 && displayRegularPrice !== displayPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(displayRegularPrice, displayCurrency)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-[#1e2321] italic">
                      Contact Us for Pricing & Customization
                    </span>
                  )}
                </div>
              )}

              {isVariable && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">
                      Choose an option
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
                    <VariationPicker
                      variationDetails={variationDetails}
                      node={node}
                      selectedPack={selectedPack}
                      setSelectedPack={setSelectedPack}
                    />
                  ) : (
                    <div className="space-y-2">
                      {(node.attributes?.[0]?.terms || []).map((term) => {
                        const isSelected = selectedPack?.slug === term.slug;
                        return (
                          <button
                            key={term.slug}
                            onClick={() =>
                              setSelectedPack(
                                isSelected ? null : { id: term.slug, slug: term.slug, price: null },
                              )
                            }
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
                            <span className="text-xs font-medium text-[#1e2321]">{term.name}</span>
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
                        disabled={
                          isLoading || (isVariable && !selectedPack) || (!variant && !isVariable)
                        }
                        className="flex-1 h-9 cursor-pointer flex items-center justify-center gap-1.5 bg-[#1e2321] text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#2d3532] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <ShoppingBag size={14} />
                            {isVariable && !selectedPack ? "Select an Option" : "Add to Cart"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    disabled={
                      isLoading || (isVariable && !selectedPack) || (!variant && !isVariable)
                    }
                    className="w-full h-9 cursor-pointer flex items-center justify-center gap-1.5 border border-[#C5A26F] text-[#C5A26F] rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#FDF8F1] transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </>
              )}
              <button
                onClick={handleWishlist}
                disabled={isWishlisting}
                className={`flex items-center cursor-pointer justify-center gap-1.5 w-full py-2 rounded text-[11px] font-medium border transition-all duration-200 mb-4 disabled:opacity-60 ${
                  isInWishlist
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {isWishlisting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Heart size={12} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
                )}
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
