import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/woocommerce";
import { cancelOrder, downloadInvoice, getOrderDetails } from "@/services/orderService";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Hourglass,
  Loader2,
  MapPin,
  Sparkles,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  XCircle,
  RotateCcw,
  PauseCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ShopingSvgIocn from "../assets/ShopingSvgIcon.svg";
import ItemOrderdSvgIocn from "../assets/ItemOrderdIcon.svg";
import RazorpayIcon from "../assets/razorpay-icon.png";
import mandalaBg from "../assets/mandalaBg.png";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const iconPop = {
  hidden: { opacity: 0, scale: 0.4 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.05 },
  },
};

const CANCELLABLE_STATUSES = ["pending", "pending-payment", "processing", "on-hold"];

function statusLabel(status) {
  const map = {
    processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
    "pending-payment": { label: "Pending Payment", color: "bg-[#f4ebd9] text-[#700c14]" },
    pending: { label: "Pending Payment", color: "bg-[#f4ebd9] text-[#700c14]" },
    completed: { label: "Completed", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700" },
    "on-hold": { label: "On Hold", color: "bg-orange-100 text-orange-800" },
  };
  return map[status] ?? { label: status || "Unknown", color: "bg-gray-100 text-gray-600" };
}

function statusHero(status) {
  const map = {
    completed: {
      Icon: CheckCircle2,
      title: "Order Confirmed",
      subtitle: "Thank you for your purchase. We'll notify you the moment your order ships.",
      accent: "green",
      glow: "bg-green-400/25",
      ring: "ring-green-200/70",
      iconBg: "from-white to-green-50 border-green-100",
      iconColor: "text-green-600",
      shadow: "shadow-[0_4px_20px_-4px_rgba(34,197,94,0.35)]",
      pulse: true,
    },
    processing: {
      Icon: PackageCheck,
      title: "Order Processing",
      subtitle: "We've received your order and it's being prepared for shipment.",
      accent: "blue",
      glow: "bg-blue-400/25",
      ring: "ring-blue-200/70",
      iconBg: "from-white to-blue-50 border-blue-100",
      iconColor: "text-blue-600",
      shadow: "shadow-[0_4px_20px_-4px_rgba(59,130,246,0.35)]",
      pulse: true,
    },
    pending: {
      Icon: Hourglass,
      title: "Payment Pending",
      subtitle: "We're waiting for your payment to be confirmed. This won't take long.",
      accent: "amber",
      glow: "bg-amber-400/25",
      ring: "ring-amber-200/70",
      iconBg: "from-white to-amber-50 border-amber-100",
      iconColor: "text-amber-600",
      shadow: "shadow-[0_4px_20px_-4px_rgba(245,158,11,0.35)]",
      pulse: true,
    },
    "pending-payment": {
      Icon: Hourglass,
      title: "Payment Pending",
      subtitle: "We're waiting for your payment to be confirmed. This won't take long.",
      accent: "amber",
      glow: "bg-amber-400/25",
      ring: "ring-amber-200/70",
      iconBg: "from-white to-amber-50 border-amber-100",
      iconColor: "text-amber-600",
      shadow: "shadow-[0_4px_20px_-4px_rgba(245,158,11,0.35)]",
      pulse: true,
    },
    cancelled: {
      Icon: XCircle,
      title: "Order Cancelled",
      subtitle: "This order has been cancelled. Any payment made will be refunded shortly.",
      accent: "red",
      glow: "bg-red-400/20",
      ring: "ring-red-200/60",
      iconBg: "from-white to-red-50 border-red-100",
      iconColor: "text-red-600",
      shadow: "shadow-[0_4px_20px_-4px_rgba(239,68,68,0.3)]",
      pulse: false,
    },
    refunded: {
      Icon: RotateCcw,
      title: "Order Refunded",
      subtitle: "Your payment for this order has been refunded to your original payment method.",
      accent: "gray",
      glow: "bg-gray-400/15",
      ring: "ring-gray-200/60",
      iconBg: "from-white to-gray-50 border-gray-200",
      iconColor: "text-gray-600",
      shadow: "shadow-[0_4px_20px_-4px_rgba(107,114,128,0.25)]",
      pulse: false,
    },
    "on-hold": {
      Icon: PauseCircle,
      title: "Order On Hold",
      subtitle: "Your order is currently on hold. We'll update you as soon as it moves forward.",
      accent: "orange",
      glow: "bg-orange-400/20",
      ring: "ring-orange-200/60",
      iconBg: "from-white to-orange-50 border-orange-100",
      iconColor: "text-orange-600",
      shadow: "shadow-[0_4px_20px_-4px_rgba(249,115,22,0.3)]",
      pulse: true,
    },
  };

  return (
    map[status] ?? {
      Icon: AlertCircle,
      title: "Order Status Unknown",
      subtitle: "We couldn't determine the current status of this order. Please contact support.",
      accent: "gray",
      glow: "bg-gray-400/15",
      ring: "ring-gray-200/60",
      iconBg: "from-white to-gray-50 border-gray-200",
      iconColor: "text-gray-500",
      shadow: "shadow-[0_4px_20px_-4px_rgba(107,114,128,0.25)]",
      pulse: false,
    }
  );
}

function formatAddress(addr) {
  if (!addr) return null;
  const parts = [
    addr.first_name && addr.last_name && `${addr.first_name} ${addr.last_name}`,
    addr.address_1,
    addr.address_2,
    addr.city && addr.state && `${addr.city}, ${addr.state} – ${addr.postcode}`,
    addr.country,
  ].filter(Boolean);
  return parts.length ? parts : null;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />;
}

function Eyebrow({ children }) {
  return (
    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-gray-400 font-medium mb-1.5">
      {children}
    </p>
  );
}

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order link. Order ID or key is missing.");
      setLoading(false);
      return;
    }

    getOrderDetails(orderId)
      .then((data) => setOrder(data?.success ? data : null))
      .catch(() => setError("We couldn't fetch your order details. Please contact support."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    if (!orderId || isDownloading) return;
    setIsDownloading(true);
    try {
      const blobUrl = await downloadInvoice(orderId);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      toast.error("Invoice isn't ready yet. Please try again in a bit.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelWooOrder = async () => {
    if (!orderId || isCancelling) return;
    setIsCancelling(true);
    try {
      const data = await cancelOrder(orderId);
      setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));

      if (data.refunded) {
        toast.success("Your order has been cancelled and refunded.");
      } else {
        toast.success("Your order has been cancelled.");
      }

      setCancelDialogOpen(false);

      setTimeout(() => {
        navigate("/my-orders");
      }, 800);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Could not cancel this order. Please contact support.";
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-10 px-4 sm:py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3 mb-10">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-5">
          <AlertCircle className="mx-auto text-red-400" size={52} strokeWidth={1.5} />
          <h2 className="text-xl font-serif text-[#1e2321]">Something went wrong</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {error ?? "We couldn't fetch your order details."}
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-[#1e2321] text-white hover:bg-[#2d3532] tracking-wide"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }


  const hero = statusHero(order?.status ?? "");
  const HeroIcon = hero.Icon;
  const currency = order?.currency ?? "INR";
  const totalPrice = Number(order?.total ?? 0);
  const billingAddr = formatAddress(order?.billing);
  const shippingAddr = formatAddress(order?.shipping);
  const items = order?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item?.price ?? 0) * Number(item?.quantity ?? 1),
    0,
  );
  const canCancel = CANCELLABLE_STATUSES.includes(order?.status);

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-10 px-4 sm:py-16">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center space-y-6"
        >
          <motion.div
            variants={iconPop}
            className="relative inline-flex items-center justify-center"
          >
            <motion.div
              className={`absolute inset-0 rounded-full ${hero.glow} blur-xl`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                hero.pulse
                  ? { scale: [1, 1.3, 1], opacity: [0.6, 0.15, 0.6] }
                  : { scale: 1, opacity: 0.35 }
              }
              transition={{ duration: 2.4, repeat: hero.pulse ? Infinity : 0, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute inset-0 rounded-full ring-1 ${hero.ring}`}
              animate={
                hero.pulse
                  ? { scale: [1.1, 1.3, 1.1], opacity: [0.8, 0, 0.8] }
                  : { scale: 1.1, opacity: 0.5 }
              }
              transition={{ duration: 2, repeat: hero.pulse ? Infinity : 0, ease: "easeOut" }}
            />
            <div
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b border flex items-center justify-center ${hero.iconBg} ${hero.shadow}`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              >
                <HeroIcon className={hero.iconColor} size={36} strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              variants={fadeUp}
              className="text-[26px] sm:text-4xl font-serif text-[#1e2321] tracking-tight"
            >
              {hero.title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-gray-500 text-sm sm:text-[15px] px-4 max-w-md mx-auto leading-relaxed"
            >
              {hero.subtitle}
            </motion.p>
          </div>

          {order?.status === "completed" && (
            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center gap-2 text-gray-400 text-xs pt-1"
            >
              <PackageCheck size={14} strokeWidth={1.5} />
              <span>Confirmation sent to your email</span>
              <Sparkles size={12} strokeWidth={1.5} className="text-amber-400" />
            </motion.div>
          )}
        </motion.div>

        <div className="bg-[#FAF9F6] border border-[#1e2321]/10 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="relative w-full md:w-[240px] shrink-0 bg-[#6E0B13] flex items-center justify-center py-12 md:py-0 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
            <div
              className="absolute inset-0 opacity-[0.25] animate-pulse pointer-events-none bg-[length:180px] bg-left bg-no-repeat mix-blend-screen"
              style={{ backgroundImage: `url(${mandalaBg})` }}
            />

            <img src={ShopingSvgIocn} className="h-20" />
          </div>

          <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-sm mb-6">
              <div className="text-center sm:text-left">
                <Eyebrow>ORDER ID</Eyebrow>
                <p className="font-semibold text-[#700c14] text-[18px] sm:text-[22px] mt-1">
                  #{order?.order_number ?? orderId}
                </p>
              </div>
              <div className="text-center sm:border-l sm:border-[#1e2321]/10 sm:px-6">
                <Eyebrow>PAYMENT METHOD</Eyebrow>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-2">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 bg-[#151917] rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    {order?.payment_method?.toLowerCase() === "razorpay" ||
                    !order?.payment_method ? (
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] bg-white rounded-sm flex items-center justify-center p-[2px]">
                        <img
                          src={RazorpayIcon}
                          alt="Razorpay"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {order?.payment_method?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </span>
                  <p className="font-bold text-[#1e2321] text-[16px] sm:text-[18px]">
                    {order?.payment_method ?? "Razorpay"}
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right sm:border-l sm:border-[#1e2321]/10 sm:pl-6">
                <Eyebrow>ORDER TOTAL</Eyebrow>
                <p className="font-semibold text-[#700c14] text-[18px] sm:text-[22px] tabular-nums mt-1">
                  {formatPrice(totalPrice, currency)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-[#1e2321]/10 pt-6 mt-auto">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="flex-1 h-12 bg-[#1a1f1d] cursor-pointer hover:bg-[#252b28] border-transparent text-[#e2b975] hover:text-[#e2b975] text-sm tracking-wide flex items-center justify-center gap-2 rounded-lg transition-colors"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Preparing Invoice…
                  </>
                ) : (
                  <>
                    <Download size={16} strokeWidth={1.75} />
                    Download Invoice
                  </>
                )}
              </button>

              {canCancel && (
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex-1 h-12 border-[#700c14]/30 text-[#700c14] hover:bg-[#700c14]/5 hover:border-[#700c14] hover:text-[#700c14] text-sm tracking-wide flex items-center justify-center gap-2 rounded-lg transition-colors bg-transparent"
                >
                  <XCircle size={16} strokeWidth={1.75} />
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>

        {cancelDialogOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2321]/50 backdrop-blur-sm px-4"
            onClick={() => !isCancelling && setCancelDialogOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 sm:p-7 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-serif text-[#1e2321]">Cancel this order?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                This will cancel order #{order?.order_number ?? orderId}. This action cannot be
                undone, and any payment made may take a few business days to be refunded.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={isCancelling}
                  className="flex-1 border-gray-300 text-[#1e2321] tracking-wide"
                >
                  Keep Order
                </Button>
                <Button
                  onClick={handleCancelWooOrder}
                  disabled={isCancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white tracking-wide flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    "Yes, Cancel Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-[#1e2321]/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-[#1e2321]/8 flex items-center gap-2.5">
            <img src={ItemOrderdSvgIocn} className="h-7" />
            <h2 className="font-serif text-lg sm:text-xl text-[#1e2321]">Items Ordered</h2>
            <span className="ml-auto text-xs uppercase tracking-wider text-gray-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-[#1e2321]/6 max-h-[360px] overflow-y-auto custom-scrollbar">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No items found.</div>
            ) : (
              items.map((item, i) => {
                const itemPrice = Number(item?.price ?? 0);
                const lineTotal = itemPrice * Number(item?.quantity ?? 1);

                return (
                  <div
                    key={item?.product_id ?? i}
                    className="flex items-center gap-4 sm:gap-5 px-5 py-4 sm:px-7 sm:py-5"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-[#FAFAF8] border border-[#1e2321]/10">
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                          ✦
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-[15px] font-medium text-[#1e2321] leading-snug break-words">
                        {item?.name}
                      </h3>

                      {Array.isArray(item?.attributes) && item.attributes.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 tracking-wide">
                          {item.attributes
                            .map((attr) => stripHtml(attr?.value))
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1.5 tracking-wide">
                        Qty {item?.quantity}
                      </p>
                    </div>

                    <div className="text-sm sm:text-[15px] font-semibold text-[#1e2321] shrink-0 tabular-nums">
                      {formatPrice(lineTotal, currency)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-5 py-5 sm:px-7 sm:py-6 bg-[#FAFAF8] text-sm border-t border-[#1e2321]/8">
            <div className="flex justify-between text-gray-500 mb-4">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="relative border-t border-[#1e2321]/15 pt-4 flex justify-between font-semibold text-[#1e2321] text-base sm:text-lg">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAFAF8] px-3 flex items-center justify-center">
                <span className="text-[10px] text-[#DFB574]">✦</span>
              </div>
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(totalPrice, currency)}</span>
            </div>
          </div>
        </div>

        {(billingAddr || shippingAddr) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {billingAddr && (
              <div className="bg-white border border-[#1e2321]/10 rounded-2xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-8 h-8 rounded-full bg-[#1e2321]/5 flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-[#1e2321]" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-serif text-[#1e2321] text-[15px]">Billing Address</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-500 leading-relaxed">
                  {billingAddr.map((line, i) => (
                    <p key={i} className="break-words">
                      {line}
                    </p>
                  ))}
                  {order?.billing?.email && (
                    <p className="mt-2.5 text-gray-400 break-words">{order.billing.email}</p>
                  )}
                  {order?.billing?.phone && <p className="text-gray-400">{order.billing.phone}</p>}
                </div>
              </div>
            )}
            {shippingAddr && (
              <div className="bg-white border border-[#1e2321]/10 rounded-2xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-8 h-8 rounded-full bg-[#1e2321]/5 flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-[#1e2321]" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-serif text-[#1e2321] text-[15px]">Shipping Address</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-500 leading-relaxed">
                  {shippingAddr.map((line, i) => (
                    <p key={i} className="break-words">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            onClick={() => navigate("/")}
            className="flex-1 h-12 bg-[#1e2321] text-white hover:bg-[#2d3532] text-xs sm:text-sm tracking-[0.15em] font-semibold uppercase flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} strokeWidth={1.75} />
            Continue Shopping
          </Button>
          <Button
            onClick={() => navigate("/products")}
            variant="outline"
            className="flex-1 h-12 border-[#1e2321]/30 text-[#1e2321] hover:bg-[#1e2321]/5 hover:border-[#1e2321] text-xs sm:text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2"
          >
            Browse All Products
            <ChevronRight size={16} strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  );
}
