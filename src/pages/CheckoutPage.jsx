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
  ArrowRight,
  Building2,
  CheckCircle2,
  Landmark,
  Leaf,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Ticket,
  Truck,
  User,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    try {
      return JSON.parse(localStorage.getItem("shika_delivery_location") || "null");
    } catch {
      return null;
    }
  })();

  const locationCityParts = locationPick?.city
    ? locationPick.city.split(",").map((s) => s.trim())
    : [];
  const locationCityOnly = locationCityParts[0] || "";
  const locationStateOnly = locationCityParts[1] || "";

  if (locationCityOnly) {
    const alreadyExists = suggestions.some(
      (s) => s.city?.toLowerCase() === locationCityOnly.toLowerCase(),
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
    if (!pin) {
      setPincodeStatus(PINCODE_STATUS.IDLE);
      setPincodeInfo(null);
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setPincodeStatus(PINCODE_STATUS.INVALID);
      setPincodeInfo(null);
      return;
    }
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
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      toast.error("Please log in to proceed with payment.");
      return;
    }
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
        onSuccess: async ({
          wooOrderId: paidOrderId,
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        }) => {
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
        onFailure: (err) => {
          setIsCheckingOut(false);
          toast.error(err?.message || "Payment failed or cancelled.");
          if (wooOrderId) cancelWooOrder(wooOrderId);
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F5F2]">
        <h2 className="text-2xl font-serif mb-4 text-[#1e2321]">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-[#1e2321] text-white hover:bg-[#2d3532]"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  const pincodeIcon = {
    [PINCODE_STATUS.LOADING]: <Loader2 size={15} className="animate-spin text-gray-400" />,
    [PINCODE_STATUS.VALID]: <CheckCircle2 size={15} className="text-green-500" />,
    [PINCODE_STATUS.INVALID]: <XCircle size={15} className="text-red-500" />,
    [PINCODE_STATUS.IDLE]: null,
  }[pincodeStatus];

  const pincodeHint = {
    [PINCODE_STATUS.LOADING]: <span className="text-[11px] text-gray-400">Verifying pincode…</span>,
    [PINCODE_STATUS.VALID]: (
      <span className="text-[11px] text-green-600 font-medium">
        ✓ {pincodeInfo?.city}
        {pincodeInfo?.state ? `, ${pincodeInfo.state}` : ""}
      </span>
    ),
    [PINCODE_STATUS.INVALID]: (
      <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
        <AlertCircle size={10} /> Invalid pincode — delivery not available
      </span>
    ),
    [PINCODE_STATUS.IDLE]: null,
  }[pincodeStatus];

  // ── Sub-components (styling only) ───────────────────────────────────────
  const OrderItems = () => (
    <div className="space-y-0 divide-y divide-gray-100">
      {items.map((item, i) => {
        const unitPrice =
          Number(item?.prices?.price || 0) / 10 ** Number(item?.prices?.currency_minor_unit ?? 2);
        const lineTotal = unitPrice * Number(item?.quantity || 1);
        return (
          <motion.div
            key={item?.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
            className="flex items-center gap-3 py-3"
          >
            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
              {item?.images?.[0]?.src ? (
                <img
                  src={item.images[0].src}
                  alt={item?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  ✦
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-snug">
                {item?.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item?.variation?.[0]?.value ? `${item.variation[0].value} · ` : ""}
                Qty {item?.quantity}
              </p>
            </div>
            <span className="text-sm font-bold text-[#1e2321] shrink-0 tabular-nums">
              {formatPrice(lineTotal, currency)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );

  const OrderTotals = () => (
    <div className="space-y-2 pt-4 border-t border-gray-100">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Subtotal ({totalItems} items)</span>
        <span className="font-semibold text-gray-700 tabular-nums">
          {formatPrice(totalPrice, currency)}
        </span>
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Shipping</span>
        <span className="text-gray-400">Calculated at next step</span>
      </div>
      {/* <div className="flex justify-between text-sm">
        <span className="text-gray-500">Discount</span>
        <button type="button" className="text-[#7A1F3D] font-medium hover:underline">
          Apply promo code
        </button>
      </div> */}
      <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-gray-100">
        <div>
          <span className="text-lg font-bold text-[#1e2321]">Total</span>
          <p className="text-[11px] text-gray-400">Inclusive of all taxes</p>
        </div>
        <span className="text-2xl font-black text-[#7A1F3D] tabular-nums">
          {formatPrice(totalPrice, currency)}
        </span>
      </div>
    </div>
  );

  const PayButton = ({ size = "desktop" }) => (
    <div className="space-y-2">
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          form="checkout-form"
          disabled={
            isCheckingOut ||
            pincodeStatus === PINCODE_STATUS.INVALID ||
            pincodeStatus === PINCODE_STATUS.LOADING
          }
          className={`w-full bg-[#6B1029] text-white hover:bg-[#7A1F3D] text-sm tracking-wide font-bold flex items-center justify-center gap-2 transition-all ${
            size === "mobile" ? "h-13 rounded-xl shadow-lg" : "h-12 rounded-xl shadow-lg"
          } shadow-[#6B1029]/30 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isCheckingOut ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Processing…
            </>
          ) : pincodeStatus === PINCODE_STATUS.INVALID ? (
            <>Invalid Pincode — Cannot Pay</>
          ) : pincodeStatus === PINCODE_STATUS.LOADING ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Verifying Pincode…
            </>
          ) : (
            <>
              <Lock size={15} />
              Proceed to Payment
              <span className="ml-1">{formatPrice(totalPrice, currency)}</span>
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </motion.div>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 my-3">
        <ShieldCheck size={12} className="text-green-500" /> Secured by Razorpay — 256-bit SSL
      </p>
    </div>
  );

  // Reusable input field with a leading icon, mirrors the mockup
  const Field = ({ icon: Icon, label, required, children }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-[#7A1F3D]">*</span>}
      </label>
      {children}
    </div>
  );

  const iconInputClass =
    "h-11 pl-10 text-sm rounded-lg border-gray-200 bg-white focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20";

  return (
    <div className="bg-[#F7F5F2] min-h-screen">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 sm:px-6 pt-6 pb-4"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-[#7A1F3D] hover:opacity-75 transition-opacity font-medium"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Back</span>
            </button>

            <h1 className="text-2xl sm:text-4xl font-serif text-[#1e2321] tracking-wide text-center absolute left-1/2 -translate-x-1/2 hidden sm:block">
              Secure Checkout
            </h1>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A1F3D] border border-[#7A1F3D]/30 rounded-full px-3 py-1.5">
              <ShieldCheck size={13} />
              <span>SSL Secured</span>
            </div>
          </div>

          <h1 className="text-2xl font-serif text-[#1e2321] tracking-wide text-center mt-3 sm:hidden">
            Secure Checkout
          </h1>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2">
            <ShieldCheck size={13} className="text-[#7A1F3D]" />
            Your order is safe and encrypted
          </p>
        </div>
      </motion.div>

      <div className="max-w-[1580px] mx-auto px-4 sm:px-6 pb-10">
        {/* Mobile order summary accordion */}
        <div className="lg:hidden mb-5">
          <details className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none list-none">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1e2321]">
                <span>Order Summary</span>
                <span className="bg-[#7A1F3D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalItems} Items
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#7A1F3D] tabular-nums">
                  {formatPrice(totalPrice, currency)}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
              </div>
            </summary>
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
              <OrderItems />
              <OrderTotals />
            </div>
          </details>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 xl:gap-4 items-start">
          {/* ── Delivery Information card ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="w-full lg:flex-1 space-y-5"
          >
            {suggestions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-3.5 border-b border-gray-100">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={13} className="text-[#7A1F3D]" /> Saved Addresses
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((s, idx) => {
                    const isSelected = selectedAddressIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUseAddress(idx)}
                        className={`text-left p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 w-full ${
                          isSelected
                            ? "border-[#7A1F3D] bg-[#7A1F3D]/5 shadow-sm"
                            : "border-gray-200 hover:border-[#7A1F3D]/40 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest mb-1 block ${isSelected ? "text-[#7A1F3D]" : "text-gray-400"}`}
                            >
                              {s.label}
                            </span>
                            {s.address && (
                              <p className="text-xs text-gray-700 font-medium truncate">
                                {s.address}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {[s.city, s.state, s.postcode].filter(Boolean).join(", ")}
                            </p>
                            {s.phone && (
                              <p className="text-[11px] text-gray-400 mt-0.5">{s.phone}</p>
                            )}
                          </div>
                          {isSelected ? (
                            <CheckCircle2 size={16} className="text-[#7A1F3D] shrink-0" />
                          ) : (
                            <span className="text-[10px] font-bold text-[#7A1F3D] shrink-0 mt-0.5">
                              USE →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 sm:px-8 pt-7 pb-5 flex items-start gap-3">
                <div className="w-14 h-14 shrink-0 rounded-full bg-[#6B1029] flex items-center justify-center shadow-md">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#1e2321]">Delivery Information</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Please provide your details to receive your order
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 sm:px-8">
                <div className="flex-1 h-px bg-[#7A1F3D]/15" />
                <Leaf size={16} className="text-[#7A1F3D]" />
                <div className="flex-1 h-px bg-[#7A1F3D]/15" />
              </div>

              <form
                id="checkout-form"
                onSubmit={handleCheckout}
                className="px-6 sm:px-8 py-6 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={User} label="First Name" required>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1F3D]/60"
                      />
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Jane"
                        className={iconInputClass}
                      />
                    </div>
                  </Field>
                  <Field icon={User} label="Last Name">
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1F3D]/60"
                      />
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className={iconInputClass}
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={Mail} label="Email Address" required>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1F3D]/60"
                      />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="jane@example.com"
                        className={iconInputClass}
                      />
                    </div>
                  </Field>
                  <Field icon={Phone} label="Phone Number" required>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1F3D]/60"
                      />
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 98765 43210"
                        className={iconInputClass}
                      />
                    </div>
                  </Field>
                </div>

                <Field icon={MapPin} label="Street Address" required>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-[#7A1F3D]/60" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder={"House / Flat No., Building Name, Street, Area, Landmark"}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F3D]/20 focus:border-[#7A1F3D] transition-colors leading-relaxed"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Field icon={Building2} label="City" required>
                    <div className="relative">
                      <Building2
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1F3D]/60"
                      />
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Mumbai"
                        className={iconInputClass}
                      />
                    </div>
                  </Field>
                  <Field icon={Landmark} label="State" required>
                    <div className="relative">
                      <Landmark
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1F3D]/60"
                      />
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Maharashtra"
                        className={`${iconInputClass} pr-8`}
                      />
                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                      />
                    </div>
                  </Field>
                  <Field icon={Ticket} label="Pincode" required>
                    <div className="relative">
                      <Ticket
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1F3D]/60"
                      />
                      <Input
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleChange}
                        placeholder="400001"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="\d{6}"
                        className={`h-11 pl-10 pr-8 text-sm rounded-lg transition-colors ${
                          pincodeStatus === PINCODE_STATUS.INVALID
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 bg-red-50"
                            : pincodeStatus === PINCODE_STATUS.VALID
                              ? "border-green-400 focus:border-green-400 focus:ring-green-400/20 bg-green-50/30"
                              : "border-gray-200 focus:border-[#7A1F3D] focus:ring-[#7A1F3D]/20"
                        }`}
                      />
                      <AnimatePresence mode="wait">
                        {pincodeIcon && (
                          <motion.span
                            key={pincodeStatus}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          >
                            {pincodeIcon}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {pincodeHint && <div className="mt-1">{pincodeHint}</div>}
                  </Field>
                </div>

                <AnimatePresence>
                  {pincodeStatus === PINCODE_STATUS.INVALID && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 overflow-hidden"
                    >
                      <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 leading-snug">
                        The pincode <strong>{formData.postcode}</strong> is not recognised. Please
                        double-check and enter a valid 6-digit Indian pincode to proceed with
                        payment.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Trust badges strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 sm:px-8 pb-7 pt-2">
                {[
                  { icon: ShieldCheck, title: "100% Secure", sub: "SSL Encrypted" },
                  { icon: Lock, title: "Secure Payments", sub: "Razorpay Protected" },
                  { icon: Truck, title: "Fast Delivery", sub: "Across India" },
                  { icon: RefreshCw, title: "Easy Returns", sub: "7 Day Return" },
                ].map(({ icon: Icon, title, sub }, i) => (
                  <div
                    key={title}
                    className="flex items-center gap-2.5 rounded-xl bg-[#F7F5F2] border border-gray-100 px-3 py-3"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-full bg-white border border-[#7A1F3D]/20 flex items-center justify-center">
                      <Icon size={16} className="text-[#7A1F3D]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1e2321] leading-tight truncate">
                        {title}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-tight truncate">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:hidden">
              <PayButton size="mobile" />
            </div>
          </motion.div>

          {/* ── Order Summary card ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="hidden lg:block w-[360px] xl:w-[400px] 2xl:w-[460px] shrink-0"
          >
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-6 overflow-hidden">
              <div className="px-6 py-5 bg-[#6B1029] flex items-center justify-between">
                <h2 className="text-xl font-serif text-white">Order Summary</h2>
                <span className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {totalItems} Items
                </span>
              </div>
              <div className="px-6 pt-3 pb-1 max-h-[280px] overflow-y-auto">
                <OrderItems />
              </div>
              <div className="px-6 pt-2 pb-6">
                <OrderTotals />
                <div className="mt-12">
                  <PayButton size="desktop" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
