import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/woocommerce";
import { cancelOrder, downloadInvoice, getOrderDetails } from "@/services/orderService";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CANCELLABLE_STATUSES = ["pending", "pending-payment", "processing", "on-hold"];

function statusLabel(status) {
  const map = {
    processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
    "pending-payment": { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800" },
    pending: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800" },
    completed: { label: "Completed", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700" },
    "on-hold": { label: "On Hold", color: "bg-orange-100 text-orange-800" },
  };
  return map[status] ?? { label: status || "Unknown", color: "bg-gray-100 text-gray-600" };
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
      if (order?.invoice_url) {
        window.open(order.invoice_url, "_blank", "noopener,noreferrer");
      } else {
        const result = await downloadInvoice(orderId);
        if (result?.invoice_url) {
          window.open(result.invoice_url, "_blank", "noopener,noreferrer");
        } else {
          throw new Error("Invoice not available");
        }
      }
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
        err?.response?.data?.message ||
        "Could not cancel this order. Please contact support.";
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
          <p className="text-gray-500 text-sm leading-relaxed">{error ?? "We couldn't fetch your order details."}</p>
          <Button onClick={() => navigate("/")} className="bg-[#1e2321] text-white hover:bg-[#2d3532] tracking-wide">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const { label: statusText, color: statusColor } = statusLabel(order?.status ?? "");
  const currency = order?.currency ?? "INR";
  const totalPrice = Number(order?.total ?? 0);
  const billingAddr = formatAddress(order?.billing);
  const shippingAddr = formatAddress(order?.shipping);
  const items = order?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item?.price ?? 0) * Number(item?.quantity ?? 1), 0);
  const canCancel = CANCELLABLE_STATUSES.includes(order?.status);

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-10 px-4 sm:py-16">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">

        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full ring-1 ring-green-200 scale-110" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={36} strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-[26px] sm:text-4xl font-serif text-[#1e2321] tracking-tight">Order Confirmed</h1>
            <p className="text-gray-500 text-sm sm:text-[15px] px-4 max-w-md mx-auto leading-relaxed">
              Thank you for your purchase. We will notify you the moment your order ships.
            </p>
          </div>
          <span className={`inline-block px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold ${statusColor}`}>
            {statusText}
          </span>
        </div>

        <div className="bg-white border border-[#1e2321]/10 rounded-2xl shadow-sm p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-sm">
            <div>
              <Eyebrow>Order ID</Eyebrow>
              <p className="font-semibold text-[#1e2321] text-[15px]">#{order?.order_number ?? orderId}</p>
            </div>
            <div>
              <Eyebrow>Payment Method</Eyebrow>
              <p className="font-semibold text-[#1e2321] text-[15px]">{order?.payment_method ?? "Razorpay"}</p>
            </div>
            <div>
              <Eyebrow>Order Total</Eyebrow>
              <p className="font-semibold text-[#1e2321] text-base sm:text-lg tabular-nums">{formatPrice(totalPrice, currency)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 border-t border-[#1e2321]/8 pt-5">
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="flex-1 h-11 border-[#1e2321]/30 text-[#1e2321] hover:bg-[#1e2321]/5 hover:border-[#1e2321] text-sm tracking-wide flex items-center justify-center gap-2"
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
            </Button>

            {canCancel && (
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
                className="flex-1 h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-sm tracking-wide flex items-center justify-center gap-2"
              >
                <XCircle size={16} strokeWidth={1.75} />
                Cancel Order
              </Button>
            )}
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
                This will cancel order #{order?.order_number ?? orderId}. This action cannot be undone,
                and any payment made may take a few business days to be refunded.
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
            <Package size={18} className="text-[#1e2321]" strokeWidth={1.75} />
            <h2 className="font-serif text-lg sm:text-xl text-[#1e2321]">Items Ordered</h2>
            <span className="ml-auto text-xs uppercase tracking-wider text-gray-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-[#1e2321]/6">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No items found.</div>
            ) : (
              items.map((item, i) => {
                const itemPrice = Number(item?.price ?? 0);
                const lineTotal = itemPrice * Number(item?.quantity ?? 1);

                return (
                  <div key={item?.product_id ?? i} className="flex items-center gap-4 sm:gap-5 px-5 py-4 sm:px-7 sm:py-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-[#FAFAF8] border border-[#1e2321]/10">
                      {item?.image ? (
                        <img src={item.image} alt={item.name || "Product"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">✦</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-[15px] font-medium text-[#1e2321] leading-snug break-words">{item?.name}</h3>

                      {Array.isArray(item?.attributes) && item.attributes.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 tracking-wide">
                          {item.attributes
                            .map((attr) => stripHtml(attr?.value))
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1.5 tracking-wide">Qty {item?.quantity}</p>
                    </div>

                    <div className="text-sm sm:text-[15px] font-semibold text-[#1e2321] shrink-0 tabular-nums">
                      {formatPrice(lineTotal, currency)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-5 py-5 sm:px-7 sm:py-6 bg-[#FAFAF8] space-y-2.5 text-sm border-t border-[#1e2321]/8">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[#1e2321] text-base sm:text-lg pt-3 border-t border-[#1e2321]/15">
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
                  {billingAddr.map((line, i) => <p key={i} className="break-words">{line}</p>)}
                  {order?.billing?.email && <p className="mt-2.5 text-gray-400 break-words">{order.billing.email}</p>}
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
                  {shippingAddr.map((line, i) => <p key={i} className="break-words">{line}</p>)}
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