import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRazorpay } from "@/hooks/useRazorpay";
import { formatPrice } from "@/lib/woocommerce";
import {
  cancelWooOrder,
  clearWooCart,
  createWooOrder,
  markOrderPaid,
} from "@/services/orderService";
import { saveAddress } from "@/services/addressService";
import { useCartStore } from "@/stores/cartStore";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PINCODE_STATUS = { IDLE: "idle", LOADING: "loading", VALID: "valid", INVALID: "invalid" };

async function validatePincode(pin) {
  if (!pin || !/^\d{6}$/.test(pin)) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return { city: po.District, state: po.State, valid: true };
    }
    return { valid: false };
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, resetCart } = useCartStore();
  const { customer, token } = useCustomerAuthStore();
  const { openRazorpay } = useRazorpay();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(null);

  const [pincodeStatus, setPincodeStatus] = useState(PINCODE_STATUS.IDLE);
  const [pincodeInfo, setPincodeInfo] = useState(null); 
  const debounceRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: customer?.first_name || customer?.display_name?.split(" ")[0] || "",
    lastName: customer?.last_name || customer?.display_name?.split(" ").slice(1).join(" ") || "",
    email: customer?.email || "",
    phone: customer?.billing?.phone || "",
    address: customer?.billing?.address_1 || "",
    city: customer?.billing?.city || "",
    state: customer?.billing?.state || "",
    postcode: customer?.billing?.postcode || "",
  });

  const suggestions = [];
  const billing = customer?.billing;
  if (billing?.address_1 || billing?.city) {
    suggestions.push({
      label: "Saved Billing Address",
      address: billing.address_1 || "",
      city: billing.city || "",
      state: billing.state || "",
      postcode: billing.postcode || "",
      phone: billing.phone || "",
    });
  }

  const locationPick = (() => {
    try { return JSON.parse(localStorage.getItem("shika_delivery_location") || "null"); }
    catch { return null; }
  })();

  const locationCityParts = locationPick?.city
    ? locationPick.city.split(",").map((s) => s.trim())
    : [];
  const locationCityOnly = locationCityParts[0] || "";
  const locationStateOnly = locationCityParts[1] || "";

  if (locationCityOnly) {
    const alreadyExists = suggestions.some(
      (s) => s.city?.toLowerCase() === locationCityOnly.toLowerCase()
    );
    if (!alreadyExists) {
      suggestions.push({
        label: "Selected Delivery Location",
        address: "",
        city: locationCityOnly,
        state: locationStateOnly,
        postcode: locationPick.pincode || "",
        phone: "",
      });
    }
  }

  useEffect(() => {
    if (!locationCityOnly) return;
    setFormData((prev) => ({
      ...prev,
      city: prev.city || locationCityOnly,
      state: prev.state || locationStateOnly,
      postcode: prev.postcode || locationPick?.pincode || "",
    }));
  }, []);

  useEffect(() => {
    const initial = customer?.billing?.postcode || locationPick?.pincode || "";
    if (/^\d{6}$/.test(initial)) triggerPincodeValidation(initial);
  }, []);

  const triggerPincodeValidation = useCallback((pin) => {
    clearTimeout(debounceRef.current);
    if (!pin) { setPincodeStatus(PINCODE_STATUS.IDLE); setPincodeInfo(null); return; }
    if (!/^\d{6}$/.test(pin)) { setPincodeStatus(PINCODE_STATUS.INVALID); setPincodeInfo(null); return; }
    setPincodeStatus(PINCODE_STATUS.LOADING);
    debounceRef.current = setTimeout(async () => {
      const result = await validatePincode(pin);
      if (result === null) {
        setPincodeStatus(PINCODE_STATUS.IDLE);
        setPincodeInfo(null);
      } else if (result.valid) {
        setPincodeStatus(PINCODE_STATUS.VALID);
        setPincodeInfo({ city: result.city, state: result.state });
        setFormData((prev) => ({
          ...prev,
          city: result.city,
          state: result.state,
        }));
      } else {
        setPincodeStatus(PINCODE_STATUS.INVALID);
        setPincodeInfo(null);
      }
    }, 600);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSelectedAddressIdx(null);
    if (name === "postcode") triggerPincodeValidation(value);
  };

  const handleUseAddress = (idx) => {
    const s = suggestions[idx];
    setSelectedAddressIdx(idx);
    setFormData((prev) => ({
      ...prev,
      address: s.address || prev.address,
      city: s.city || prev.city,
      state: s.state || prev.state,
      postcode: s.postcode || prev.postcode,
      phone: s.phone || prev.phone,
    }));
    if (s.postcode) triggerPincodeValidation(s.postcode);
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalItems = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  const totalPrice = items.reduce((sum, item) => {
    const minorUnit = Number(item?.prices?.currency_minor_unit ?? 2);
    const lineTotalMinor =
      item?.totals?.line_total != null
        ? Number(item.totals.line_total)
        : Number(item?.prices?.price || 0) * Number(item?.quantity || 0);
    return sum + lineTotalMinor / 10 ** minorUnit;
  }, 0);
  const currency = items?.[0]?.prices?.currency_code || "INR";

  const canPay = pincodeStatus !== PINCODE_STATUS.INVALID;

  // ── Checkout handler ──────────────────────────────────────────────────────
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!items.length) { toast.error("Your cart is empty."); return; }

    const authToken = token || localStorage.getItem("token");
    if (!authToken) { toast.error("Please log in to proceed with payment."); return; }
    if (!formData.firstName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields (Name, Email, Phone).");
      return;
    }

    if (pincodeStatus === PINCODE_STATUS.INVALID) {
      toast.error("Please enter a valid 6-digit pincode before proceeding.");
      return;
    }
    if (pincodeStatus === PINCODE_STATUS.LOADING) {
      toast.info("Verifying pincode, please wait...");
      return;
    }

    setIsCheckingOut(true);
    let wooOrderId = null;
    let wooOrderKey = null;

    try {
      toast.loading("Preparing your order...", { id: "checkout" });

      const customerData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
      };

      const order = await createWooOrder(items, customerData);
      wooOrderId = order.orderId;
      wooOrderKey = order.orderKey;

      toast.dismiss("checkout");

      openRazorpay({
        wooOrderId: order.orderId,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency,
        name: "Shikaarts",
        description: `Order #${order.orderId}`,
        customerName: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        onSuccess: async ({ wooOrderId: paidOrderId, razorpayPaymentId, razorpayOrderId, razorpaySignature }) => {
          try {
            await markOrderPaid(paidOrderId, razorpayPaymentId, razorpayOrderId, razorpaySignature);
            await clearWooCart();
            resetCart();
            localStorage.removeItem("cart_token");
            localStorage.removeItem("wc_cart_token");

            if (authToken) {
              saveAddress(authToken, {
                address_1: formData.address,
                city: formData.city,
                state: formData.state,
                postcode: formData.postcode,
                phone: formData.phone,
                country: "IN",
              }).catch(() => {});
            }

            setIsCheckingOut(false);
            navigate(`/order-success/${paidOrderId}?key=${wooOrderKey ?? ""}`);
          } catch (err) {
            console.error("Payment verification failed:", err);
            setIsCheckingOut(false);
            toast.error("We couldn't confirm your payment. Please contact support.", {
              description: `Order #${paidOrderId}`,
            });
          }
        },
      });
    } catch (err) {
      toast.dismiss("checkout");
      setIsCheckingOut(false);
      toast.error("Could not initiate checkout.", {
        description: err?.message || "Please try again.",
      });
      if (wooOrderId) await cancelWooOrder(wooOrderId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate("/")} className="bg-[#1e2321] text-white hover:bg-[#2d3532]">
          Continue Shopping
        </Button>
      </div>
    );
  }

  const pincodeIcon = {
    [PINCODE_STATUS.LOADING]: <Loader2 size={14} className="animate-spin text-gray-400" />,
    [PINCODE_STATUS.VALID]: <CheckCircle2 size={14} className="text-green-500" />,
    [PINCODE_STATUS.INVALID]: <XCircle size={14} className="text-red-500" />,
    [PINCODE_STATUS.IDLE]: null,
  }[pincodeStatus];

  const pincodeHint = {
    [PINCODE_STATUS.LOADING]: <span className="text-[11px] text-gray-400">Verifying pincode…</span>,
    [PINCODE_STATUS.VALID]: (
      <span className="text-[11px] text-green-600 font-medium">
        ✓ {pincodeInfo?.city}{pincodeInfo?.state ? `, ${pincodeInfo.state}` : ""}
      </span>
    ),
    [PINCODE_STATUS.INVALID]: (
      <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
        <AlertCircle size={10} /> Invalid pincode — delivery not available
      </span>
    ),
    [PINCODE_STATUS.IDLE]: null,
  }[pincodeStatus];

  const OrderItems = () => (
    <div className="space-y-0 divide-y divide-gray-100">
      {items.map((item) => {
        const unitPrice =
          Number(item?.prices?.price || 0) / 10 ** Number(item?.prices?.currency_minor_unit ?? 2);
        const lineTotal = unitPrice * Number(item?.quantity || 1);
        return (
          <div key={item?.key} className="flex items-center gap-3 py-2.5">
            <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
              {item?.images?.[0]?.src ? (
                <img
                  src={item.images[0].src}
                  alt={item?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">✦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate leading-snug">{item?.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {item?.variation?.[0]?.value ? `${item.variation[0].value} · ` : ""}
                Qty {item?.quantity}
              </p>
            </div>
            <span className="text-xs font-bold text-[#1e2321] shrink-0 tabular-nums">
              {formatPrice(lineTotal, currency)}
            </span>
          </div>
        );
      })}
    </div>
  );

  const OrderTotals = () => (
    <div className="space-y-1.5 pt-3 border-t border-gray-100">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
        <span className="font-semibold text-gray-700 tabular-nums">{formatPrice(totalPrice, currency)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Shipping</span>
        <span>Calculated at next step</span>
      </div>
      <div className="flex justify-between items-baseline pt-2.5 mt-1 border-t border-gray-100">
        <span className="text-sm font-bold text-[#1e2321]">Total</span>
        <span className="text-base font-black text-[#1e2321] tabular-nums">{formatPrice(totalPrice, currency)}</span>
      </div>
    </div>
  );

  const PayButton = ({ size = "desktop" }) => (
    <div className="space-y-2">
      <Button
        type="submit"
        form="checkout-form"
        disabled={isCheckingOut || pincodeStatus === PINCODE_STATUS.INVALID || pincodeStatus === PINCODE_STATUS.LOADING}
        className={`w-full bg-[#1e2321] text-white hover:bg-[#2d3532] active:scale-[0.99] text-sm tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all ${
          size === "mobile" ? "h-12 rounded-xl shadow-lg" : "h-11 rounded-lg shadow-md"
        } shadow-[#1e2321]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isCheckingOut ? (
          <><Loader2 size={15} className="animate-spin" /> Processing…</>
        ) : pincodeStatus === PINCODE_STATUS.INVALID ? (
          <>Invalid Pincode — Cannot Pay</>
        ) : pincodeStatus === PINCODE_STATUS.LOADING ? (
          <><Loader2 size={15} className="animate-spin" /> Verifying Pincode…</>
        ) : (
          <>Pay {formatPrice(totalPrice, currency)}</>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck size={11} className="text-green-500" /> Secured by Razorpay — 256-bit SSL
      </p>
    </div>
  );

  return (
    <div className="bg-[#F7F5F2] min-h-screen">

      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1560px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1e2321] transition-colors font-medium"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back to Cart</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-base sm:text-lg font-serif text-[#1e2321] tracking-wide">Secure Checkout</h1>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <ShieldCheck size={13} className="text-green-500" />
            <span className="hidden sm:inline">SSL Secured</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="lg:hidden mb-5">
          <details className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none list-none">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1e2321]">
                <span>Order Summary</span>
                <span className="bg-[#7A1F3D]/10 text-[#7A1F3D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#1e2321] tabular-nums">
                  {formatPrice(totalPrice, currency)}
                </span>
                <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
              <OrderItems />
              <OrderTotals />
            </div>
          </details>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 xl:gap-10 items-start">

          <div className="w-full lg:flex-1 space-y-5">

            {suggestions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={13} className="text-[#7A1F3D]" /> Saved Addresses
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((s, idx) => {
                    const isSelected = selectedAddressIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUseAddress(idx)}
                        className={`text-left p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-200 w-full ${
                          isSelected
                            ? "border-[#7A1F3D] bg-[#7A1F3D]/5 shadow-sm"
                            : "border-gray-200 hover:border-[#7A1F3D]/40 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className={`text-[9px] font-black uppercase tracking-widest mb-1 block ${isSelected ? "text-[#7A1F3D]" : "text-gray-400"}`}>
                              {s.label}
                            </span>
                            {s.address && <p className="text-xs text-gray-700 font-medium truncate">{s.address}</p>}
                            <p className="text-xs text-gray-500">{[s.city, s.state, s.postcode].filter(Boolean).join(", ")}</p>
                            {s.phone && <p className="text-[11px] text-gray-400 mt-0.5">{s.phone}</p>}
                          </div>
                          {isSelected
                            ? <CheckCircle2 size={16} className="text-[#7A1F3D] shrink-0" />
                            : <span className="text-[10px] font-bold text-[#7A1F3D] shrink-0 mt-0.5">USE →</span>
                          }
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-serif text-[#1e2321]">Contact Information</h2>
              </div>
              <form id="checkout-form" onSubmit={handleCheckout} className="px-5 sm:px-6 py-5 space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      First Name <span className="text-[#7A1F3D]">*</span>
                    </label>
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Jane"
                      className="h-10 text-sm border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Name</label>
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe"
                      className="h-10 text-sm border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email <span className="text-[#7A1F3D]">*</span>
                    </label>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jane@example.com"
                      className="h-10 text-sm border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone <span className="text-[#7A1F3D]">*</span>
                    </label>
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210"
                      className="h-10 text-sm border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Street Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder={"House / Flat No., Building Name\nStreet, Area, Landmark"}
                    className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F3D]/20 focus:border-[#7A1F3D] transition-colors leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">City</label>
                    <Input name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai"
                      className="h-10 text-sm border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20" />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">State</label>
                    <Input name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra"
                      className="h-10 text-sm border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20" />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pincode <span className="text-[#7A1F3D]">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleChange}
                        placeholder="400001"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="\d{6}"
                        className={`h-10 text-sm pr-8 transition-colors ${
                          pincodeStatus === PINCODE_STATUS.INVALID
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 bg-red-50"
                            : pincodeStatus === PINCODE_STATUS.VALID
                            ? "border-green-400 focus:border-green-400 focus:ring-green-400/20 bg-green-50/30"
                            : "border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20"
                        }`}
                      />
                      {pincodeIcon && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {pincodeIcon}
                        </span>
                      )}
                    </div>
                    {pincodeHint && <div className="mt-1">{pincodeHint}</div>}
                  </div>
                </div>

                {pincodeStatus === PINCODE_STATUS.INVALID && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 leading-snug">
                      The pincode <strong>{formData.postcode}</strong> is not recognised. Please double-check and enter a valid 6-digit Indian pincode to proceed with payment.
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="lg:hidden">
              <PayButton size="mobile" />
            </div>
          </div>

          <div className="hidden lg:block w-[340px] xl:w-[380px] shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-[72px] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-serif text-[#1e2321]">Order Summary</h2>
                <span className="bg-[#7A1F3D]/10 text-[#7A1F3D] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="px-5 pt-3 pb-1 max-h-[240px] overflow-y-auto">
                <OrderItems />
              </div>
              <div className="px-5 pt-2 pb-5">
                <OrderTotals />
                <div className="mt-4">
                  <PayButton size="desktop" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
