import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRazorpay } from "@/hooks/useRazorpay";
import { formatPrice } from "@/lib/woocommerce";
import { cancelWooOrder, clearWooCart, createWooOrder, markOrderPaid } from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, resetCart } = useCartStore();
  const { customer } = useCustomerAuthStore();
  const { openRazorpay } = useRazorpay();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to proceed with payment.");
      return;
    }

    if (!formData.firstName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields (Name, Email, Phone).");
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
            setIsCheckingOut(false);
            navigate(`/order-success/${paidOrderId}?key=${wooOrderKey ?? ""}`);
          } catch (err) {
            console.error("Payment verification failed:", err);
            setIsCheckingOut(false);
            toast.error("We couldn't confirm your payment. Please contact support with your order number.", {
              description: `Order #${paidOrderId}`,
            });
          }
        }
      });
    } catch (err) {
      toast.dismiss("checkout");
      setIsCheckingOut(false);
      toast.error("Could not initiate checkout.", {
        description: err?.message || "Please try again.",
      });

      if (wooOrderId) {
        await cancelWooOrder(wooOrderId);
      }
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

  return (
    <div className="bg-[#FAFAF8] min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-3xl font-serif text-[#1e2321] mb-8">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Billing Details Form */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-serif text-[#1e2321] mb-6 border-b pb-3">Contact Information</h2>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name *</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address *</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Street Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main St, Apartment 4B"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <Input name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <Input name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pincode</label>
                    <Input name="postcode" value={formData.postcode} onChange={handleChange} placeholder="400001" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-serif text-[#1e2321] mb-6 border-b pb-3">Order Summary</h2>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-6">
                {items.map((item) => (
                  <div key={item?.key} className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      {item?.images?.[0]?.src ? (
                        <img src={item.images[0].src} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">✦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item?.name}</h4>
                      <p className="text-xs text-gray-500">{item?.variation?.[0]?.value || ""}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Qty: {item?.quantity}</span>
                        <span className="text-sm font-semibold">
                          {formatPrice(
                            Number(item?.prices?.price || 0) / 10 ** Number(item?.prices?.currency_minor_unit ?? 2),
                            currency
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice, currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-[#1e2321] pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice, currency)}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                disabled={isCheckingOut}
                className="w-full h-12 bg-[#1e2321] text-white hover:bg-[#2d3532] text-sm tracking-widest font-semibold uppercase flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>Pay {formatPrice(totalPrice, currency)}</>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-green-600" />
                Secured by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
