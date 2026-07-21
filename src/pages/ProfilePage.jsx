import { useState, useEffect, useCallback } from "react";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  Pencil,
  ChevronRight,
  Clock,
  Package,
  Loader2,
  Trash2,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import {
  getUserProfile,
  getGuestOrders,
  getWishlistItems,
  removeFromWishlistApi,
} from "@/services/orderService";
import { updateAddress } from "@/services/LoginServices";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { productToNode, formatPrice } from "@/lib/woocommerce";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function formatDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw.replace(" ", "T"));
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(amount, currency) {
  const n = Number(amount || 0);
  const symbol = currency === "INR" ? "₹" : currency + " ";
  return symbol + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function resolveName(account, billing) {
  const fromAccount = `${account.first_name || ""} ${account.last_name || ""}`.trim();
  if (fromAccount) return fromAccount;
  if (account.display_name) return account.display_name;
  const fromBilling = `${billing.first_name || ""} ${billing.last_name || ""}`.trim();
  if (fromBilling) return fromBilling;
  return account.username;
}

function initialOf(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function isRealAvatar(url) {
  return !!url && !url.includes("d=mm") && !url.includes("gravatar.com/avatar/0");
}

function getProductKey(product) {
  const id = product?.id ?? product?.product_id ?? product?.productId ?? null;
  const variationId = product?.variation_id ?? product?.variationId ?? 0;
  return id != null ? `${id}_${variationId}` : null;
}

function getWishlistImage(product) {
  const node = productToNode(product);
  const graphqlImage = node?.images?.edges?.[0]?.node?.url;
  if (graphqlImage) return graphqlImage;
  if (Array.isArray(product?.images) && product.images[0]?.src) return product.images[0].src;
  return null;
}

function getWishlistTitle(product) {
  const node = productToNode(product);
  return node?.title || product?.title || product?.name || "";
}

function getWishlistPrice(product) {
  const node = productToNode(product);
  const variant = node?.variants?.edges?.[0]?.node;
  if (variant?.price?.amount != null) {
    return formatPrice(Number(variant.price.amount), variant.price.currencyCode);
  }
  if (product?.prices?.price != null) {
    const minorUnit = Number(product.prices.currency_minor_unit ?? 2);
    const divisor = 10 ** minorUnit;
    const amount = Number(product.prices.price) / divisor;
    return formatPrice(amount, product.prices.currency_code || "INR");
  }
  return "—";
}

function getWishlistSlug(product) {
  const node = productToNode(product);
  const handle = node?.handle || node?.slug || product?.slug;
  if (handle) return handle;
  if (product?.permalink) {
    const parts = product.permalink.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }
  return product?.id || product?.product_id || null;
}

function Field({ label, value, colSpan2 }) {
  return (
    <div className={colSpan2 ? "col-span-2" : "col-span-2 sm:col-span-1"}>
      <span className="block text-xs font-medium text-[#2B211B] mb-2">{label}</span>
      <div className="border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white">
        {value || "—"}
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all duration-200 w-full text-left
        ${
          active
            ? "bg-[#B8892E] border-[#B8892E] text-white"
            : "bg-white border-[#E7D9B8] text-[#2B211B] hover:bg-[#F3E6C4] hover:border-[#B8892E]"
        }`}
    >
      <Icon size={16} strokeWidth={2} className="shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    processing: { label: "Processing", cls: "bg-blue-100 text-blue-800" },
    "pending-payment": { label: "Pending Payment", cls: "bg-yellow-100 text-yellow-800" },
    pending: { label: "Pending Payment", cls: "bg-yellow-100 text-yellow-800" },
    completed: { label: "Completed", cls: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800" },
    refunded: { label: "Refunded", cls: "bg-slate-100 text-slate-600" },
    "on-hold": { label: "On Hold", cls: "bg-orange-100 text-orange-800" },
  };
  const { label, cls } = map[status] ?? {
    label: status || "Unknown",
    cls: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="w-16 h-16 rounded-full bg-[#F3E6C4] flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-[#7B1E3D]" />
      </div>
      <p className="font-serif text-xl text-[#2B211B] mb-2">{title}</p>
      <p className="text-sm text-[#8A7A63]">{sub}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-14">
      <Loader2 size={32} className="animate-spin text-[#7B1E3D]" />
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [tab, setTab] = useState("personal");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingForm, setBillingForm] = useState({});
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  const logout = useCustomerAuthStore((s) => s.logout);
  const addItemToCart = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    getUserProfile()
      .then((data) => {
        if (!alive) return;
        if (data && data.success) {
          setProfile(data);
          setBillingForm({
            first_name: data.billing?.first_name || data.account?.first_name || "",
            last_name: data.billing?.last_name || data.account?.last_name || "",
            address_1: data.billing?.address_1 || "",
            city: data.billing?.city || "",
            state: data.billing?.state || "",
            postcode: data.billing?.postcode || "",
            country: data.billing?.country || "",
            phone: data.billing?.phone || data.account?.phone || "",
          });
          setStatus("ready");
        } else setStatus("error");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, []);

  const fetchOrders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const userDetailsObj = (() => {
      try {
        return JSON.parse(localStorage.getItem("customerData"));
      } catch {
        return null;
      }
    })();
    if (!userDetailsObj?.id) return;
    setOrdersLoading(true);
    setOrdersError(null);
    getGuestOrders(userDetailsObj.id)
      .then((data) => setOrders(Array.isArray(data?.orders) ? data.orders : []))
      .catch(() => setOrdersError("Could not load your orders. Please try again."))
      .finally(() => setOrdersLoading(false));
  }, []);

  const fetchWishlist = useCallback(() => {
    setWishlistLoading(true);
    getWishlistItems()
      .then((data) => setWishlistItems(Array.isArray(data?.items) ? data.items : []))
      .catch(() => toast.error("Could not load wishlist."))
      .finally(() => setWishlistLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "orders") fetchOrders();
    if (tab === "wishlist") fetchWishlist();
  }, [tab, fetchOrders, fetchWishlist]);

  function handleLogout() {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("customerData");
    useWishlistStore.getState().clearWishlist();
    window.location.href = "/";
  }

  const handleWishlistRemove = async (product) => {
    const id = product?.id || product?.product_id || product?.productId;
    const variationId = product?.variation_id ?? product?.variationId ?? 0;
    const key = getProductKey(product);
    setBusyId(key);
    setWishlistItems((prev) => prev.filter((p) => getProductKey(p) !== key));
    try {
      await removeFromWishlistApi(id, variationId);
      useWishlistStore.getState().fetchWishlist();
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove item. Please try again.");
      fetchWishlist();
    } finally {
      setBusyId(null);
    }
  };

  const handleAddToCart = async (product) => {
    const node = productToNode(product);
    const id = node?.id || product?.id || product?.productId;
    const key = getProductKey(product);
    if (!id) return;
    setBusyId(key);
    setWishlistItems((prev) => prev.filter((p) => getProductKey(p) !== key));
    try {
      await addItemToCart({
        productId: id,
        variationId: product?.variationId,
        handle: node?.handle,
        product: node,
        quantity: product?.quantity || 1,
      });
      await removeFromWishlistApi(id, product?.variation_id ?? 0);
      useWishlistStore.getState().fetchWishlist();
      setCartOpen(true);
      toast.success("Added to cart");
    } catch {
      toast.error("Couldn't add to cart. Please try again.");
      fetchWishlist();
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateBilling = async () => {
    setIsUpdatingAddress(true);
    try {
      const payload = {
        billing: {
          first_name: billingForm.first_name || "",
          last_name: billingForm.last_name || "",
          address_1: billingForm.address_1 || "",
          city: billingForm.city || "",
          state: billingForm.state || "",
          postcode: billingForm.postcode || "",
          country: billingForm.country || "",
          phone: billingForm.phone || "",
        },
      };

      const res = await updateAddress(payload);
      if (res && res.success) {
        toast.success("Address updated successfully");
        setProfile((prev) => ({
          ...prev,
          billing: { ...prev.billing, ...payload.billing },
        }));
        setIsEditingBilling(false);
      } else {
        toast.error(res?.message || "Could not update address. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the address.");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingForm((prev) => ({ ...prev, [name]: value }));
  };

  const name = profile ? resolveName(profile.account, profile.billing) : "";

  const navItems = [
    { key: "personal", icon: User, label: "Personal Information" },
    { key: "orders", icon: ShoppingBag, label: "My Orders" },
    { key: "address", icon: MapPin, label: "Manage Address" },
    { key: "wishlist", icon: Heart, label: "Wishlist" },
    { key: "logout", icon: LogOut, label: "Logout" },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7EF] px-4  md:px-6 py-5 font-sans">
      {status === "loading" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={36} className="animate-spin text-[#7B1E3D]" />
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[#7B1E3D] text-sm uppercase tracking-widest text-center px-4">
            Could not open your profile. Please sign in again.
          </p>
        </div>
      )}

      {status === "ready" && profile && (
        <>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-center text-[#2B211B] mb-8">
            My Account
          </h1>

          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-5 lg:gap-7 lg:items-start">
            <aside className="flex flex-row flex-wrap lg:flex-col gap-2">
              {navItems.map(({ key, icon, label }) => (
                <NavItem
                  key={key}
                  icon={icon}
                  label={label}
                  active={tab === key}
                  onClick={() => setTab(key)}
                />
              ))}
            </aside>

            <div className="bg-white rounded-2xl border border-[#E7D9B8] shadow-sm p-5 sm:p-7 lg:p-9 animate-fadeIn mb-6">
              {tab === "personal" && (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative w-20 h-20 shrink-0">
                      <div className="w-full h-full rounded-full bg-[#F3E6C4] border border-[#E7D9B8] flex items-center justify-center overflow-hidden">
                        {isRealAvatar(profile.account.avatar_url) ? (
                          <img
                            src={profile.account.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif italic font-semibold text-4xl text-[#7B1E3D]">
                            {initialOf(name)}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#7B1E3D] text-white flex items-center justify-center border-2 border-white">
                        <Pencil size={13} />
                      </div>
                    </div>
                    <div>
                      <p className="font-serif font-semibold text-xl text-[#2B211B]">{name}</p>
                      {profile.account.roles?.[0] && (
                        <span className="text-[11px] uppercase tracking-widest text-[#B8892E]">
                          {profile.account.roles[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="First Name"
                      value={
                        profile.account.first_name ||
                        profile.billing.first_name ||
                        profile.shipping?.first_name ||
                        name
                      }
                    />
                    <Field
                      label="Last Name"
                      value={
                        profile.account.last_name ||
                        profile.billing.last_name ||
                        profile.shipping?.last_name
                      }
                    />
                    <Field
                      label="Email"
                      value={profile.account.email || profile.billing.email}
                      colSpan2
                    />
                    <Field
                      label="Phone"
                      value={
                        profile.billing.phone || profile.account.phone || profile.shipping?.phone
                      }
                      colSpan2
                    />
                    <Field label="Username" value={profile.account.username} />
                    <Field
                      label="Member Since"
                      value={formatDate(profile.account.date_registered)}
                    />
                  </div>
                </>
              )}

              {tab === "orders" && (
                <>
                  <h2 className="font-serif font-semibold text-2xl text-[#7B1E3D] mb-6">
                    My Orders
                  </h2>

                  {ordersLoading && <Spinner />}

                  {!ordersLoading && ordersError && (
                    <EmptyState icon={AlertCircle} title="Something went wrong" sub={ordersError} />
                  )}

                  {!ordersLoading && !ordersError && orders.length === 0 && (
                    <EmptyState
                      icon={Package}
                      title="No orders yet"
                      sub="Your past orders will appear here after you make a purchase."
                    />
                  )}

                  {!ordersLoading && !ordersError && orders.length > 0 && (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b border-[#E7D9B8] pb-3">
                        <p className="text-sm font-medium text-[#8A7A63]">
                          Showing <span className="font-semibold text-[#2B211B]">{orders.length}</span> order{orders.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                        {orders.map((order) => {
                          const currency = order?.currency ?? "INR";
                          const total = Number(order?.total ?? 0);
                          const items = order?.items ?? [];
                          const date = order?.date_created
                            ? new Date(order.date_created.replace(" ", "T")).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : null;

                          return (
                            <div
                              key={order.order_id}
                              className="flex flex-col bg-white border border-[#E7D9B8] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                              <div className="bg-[#FAF6ED] px-5 py-4 border-b border-[#E7D9B8] flex flex-wrap items-center justify-between gap-2.5">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="font-serif font-bold text-base text-[#2B211B]">
                                    #{order.order_number ?? order.order_id}
                                  </span>
                                  {date && (
                                    <span className="flex items-center gap-1.5 text-xs text-[#8A7A63] font-medium bg-white px-2.5 py-1 rounded-full border border-[#E7D9B8]">
                                      <Clock size={12} className="text-[#B8892E]" /> {date}
                                    </span>
                                  )}
                                </div>
                                <StatusBadge status={order.status} />
                              </div>

                              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                                <div className="flex items-start gap-4">
                                  <div className="flex gap-2 shrink-0 flex-wrap max-w-[150px]">
                                    {items.slice(0, 3).map((item, i) => (
                                      <div
                                        key={i}
                                        className="w-14 h-14 rounded-xl overflow-hidden bg-[#F3E6C4] border border-[#E7D9B8] shadow-sm shrink-0"
                                      >
                                        {item?.image ? (
                                          <img
                                            src={item.image}
                                            alt={item.name || "Product"}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[#B8892E] text-lg">
                                            ✦
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {items.length > 3 && (
                                      <div className="w-14 h-14 rounded-xl bg-[#FAF6ED] border border-[#E7D9B8] flex items-center justify-center text-xs font-bold text-[#7B1E3D] shrink-0 shadow-sm">
                                        +{items.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                                    <p className="font-serif font-semibold text-base text-[#2B211B] line-clamp-2 leading-snug">
                                      {items
                                        .map((i) => i.name)
                                        .filter(Boolean)
                                        .join(", ")}
                                    </p>
                                    <p className="text-xs text-[#B8892E] font-medium mt-1.5 flex items-center gap-1">
                                      {items.length} item{items.length !== 1 ? "s" : ""} included
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="px-5 py-3.5 bg-[#FCFAFA] border-t border-[#F0E6D2] flex items-center justify-between gap-4 mt-auto">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-[#8A7A63] font-semibold mb-0.5">
                                    Total Amount
                                  </p>
                                  <p className="font-serif font-bold text-lg text-[#7B1E3D]">
                                    {formatMoney(total, currency)}
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    navigate(
                                      `/order-success/${order.order_id}?key=${order.order_key}`,
                                    )
                                  }
                                  className="flex items-center gap-1.5 bg-[#7B1E3D] hover:bg-[#5E1730] text-white text-xs font-semibold px-4 py-2.5 rounded transition-all duration-200 shadow-sm hover:shadow cursor-pointer shrink-0"
                                >
                                  View Details <ChevronRight size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === "address" && (
                <>
                  <h2 className="font-serif font-semibold text-2xl text-[#7B1E3D] mb-6">
                    Manage Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#7B1E3D]">
                          Billing Address
                        </p>
                        {!isEditingBilling ? (
                          <button
                            onClick={() => setIsEditingBilling(true)}
                            className="text-xs text-[#B8892E] font-semibold hover:underline flex items-center gap-1"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setIsEditingBilling(false);
                              setBillingForm({
                                first_name:
                                  profile.billing?.first_name || profile.account?.first_name || "",
                                last_name:
                                  profile.billing?.last_name || profile.account?.last_name || "",
                                address_1: profile.billing?.address_1 || "",
                                city: profile.billing?.city || "",
                                state: profile.billing?.state || "",
                                postcode: profile.billing?.postcode || "",
                                country: profile.billing?.country || "",
                                phone: profile.billing?.phone || profile.account?.phone || "",
                              });
                            }}
                            className="text-xs text-red-600 font-semibold hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {isEditingBilling ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-1">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="first_name"
                              value={billingForm.first_name || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="last_name"
                              value={billingForm.last_name || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              Address
                            </label>
                            <input
                              type="text"
                              name="address_1"
                              value={billingForm.address_1 || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={billingForm.city || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={billingForm.state || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              Postcode
                            </label>
                            <input
                              type="text"
                              name="postcode"
                              value={billingForm.postcode || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              name="country"
                              value={billingForm.country || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-[#2B211B] mb-2">
                              Phone
                            </label>
                            <input
                              type="text"
                              name="phone"
                              value={billingForm.phone || ""}
                              onChange={handleBillingChange}
                              className="w-full border border-[#E7D9B8] rounded-xl px-4 py-3 text-sm text-[#8A7A63] bg-white outline-none focus:border-[#B8892E]"
                            />
                          </div>
                          <div className="col-span-2 mt-2">
                            <button
                              onClick={handleUpdateBilling}
                              disabled={isUpdatingAddress}
                              className="flex items-center justify-center gap-2 w-full bg-[#7B1E3D] hover:bg-[#5E1730] text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isUpdatingAddress && <Loader2 size={16} className="animate-spin" />}
                              {isUpdatingAddress ? "Saving..." : "Save Address"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <Field
                            label="Name"
                            value={
                              `${profile.billing?.first_name || profile.account?.first_name || ""} ${profile.billing?.last_name || profile.account?.last_name || ""}`.trim() ||
                              name
                            }
                            colSpan2
                          />
                          <Field label="Address" value={profile.billing?.address_1} colSpan2 />
                          <Field
                            label="City / State"
                            value={
                              profile.billing?.city || profile.billing?.state
                                ? `${profile.billing?.city || ""}${profile.billing?.city && profile.billing?.state ? ", " : ""}${profile.billing?.state || ""}`
                                : ""
                            }
                            colSpan2
                          />
                          <Field label="Postcode" value={profile.billing?.postcode} />
                          <Field label="Country" value={profile.billing?.country} />
                          <Field
                            label="Phone"
                            value={profile.billing?.phone || profile.account?.phone}
                            colSpan2
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#7B1E3D] mb-4">
                        Shipping Address
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Name"
                          value={
                            `${profile.shipping?.first_name || profile.account?.first_name || ""} ${profile.shipping?.last_name || profile.account?.last_name || ""}`.trim() ||
                            name
                          }
                          colSpan2
                        />
                        <Field label="Address" value={profile.shipping?.address_1} colSpan2 />
                        <Field
                          label="City / State"
                          value={
                            profile.shipping?.city || profile.shipping?.state
                              ? `${profile.shipping?.city || ""}${profile.shipping?.city && profile.shipping?.state ? ", " : ""}${profile.shipping?.state || ""}`
                              : ""
                          }
                          colSpan2
                        />
                        <Field label="Postcode" value={profile.shipping?.postcode} />
                        <Field label="Country" value={profile.shipping?.country} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tab === "wishlist" && (
                <>
                  <h2 className="font-serif font-semibold text-2xl text-[#7B1E3D] mb-6 flex flex-wrap items-baseline gap-2">
                    Wishlist
                    {wishlistItems.length > 0 && (
                      <span className="text-sm font-normal text-[#8A7A63]">
                        ({wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""})
                      </span>
                    )}
                  </h2>

                  {wishlistLoading && <Spinner />}

                  {!wishlistLoading && wishlistItems.length === 0 && (
                    <EmptyState
                      icon={Heart}
                      title="No saved items"
                      sub="Start building your wishlist by clicking the heart on any product."
                    />
                  )}

                  {!wishlistLoading && wishlistItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                      {wishlistItems.map((product) => {
                        const key = getProductKey(product);
                        const image = getWishlistImage(product);
                        const title = getWishlistTitle(product);
                        const price = getWishlistPrice(product);
                        const slug = getWishlistSlug(product);
                        const isBusy = busyId === key;

                        return (
                          <div
                            key={key}
                            className="flex flex-col border border-[#E7D9B8] rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
                          >
                            <div
                              onClick={() => slug && navigate(`/product/${slug}`)}
                              className="relative w-full aspect-square bg-[#F3E6C4] overflow-hidden cursor-pointer"
                            >
                              {image ? (
                                <img
                                  src={image}
                                  alt={title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl text-[#B8892E]">
                                  ✦
                                </div>
                              )}
                            </div>

                            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                              <div
                                onClick={() => slug && navigate(`/product/${slug}`)}
                                className="cursor-pointer"
                              >
                                <p className="font-serif font-semibold text-base text-[#2B211B] line-clamp-1 group-hover:text-[#7B1E3D] transition-colors leading-snug">
                                  {title}
                                </p>
                                <p className="text-sm font-semibold text-[#7B1E3D] mt-1">{price}</p>
                              </div>

                              <div className="flex items-center gap-2 pt-1 mt-auto">
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  disabled={isBusy}
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#7B1E3D] hover:bg-[#5E1730] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2.5 px-3 rounded transition-colors cursor-pointer shadow-sm"
                                >
                                  {isBusy ? (
                                    <Loader2 size={13} className="animate-spin shrink-0" />
                                  ) : (
                                    <ShoppingCart size={13} className="shrink-0" />
                                  )}
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => handleWishlistRemove(product)}
                                  disabled={isBusy}
                                  title="Remove from wishlist"
                                  className="flex items-center justify-center w-9 h-9 rounded border border-[#E7D9B8] text-[#8A7A63] hover:text-red-600 hover:border-red-400 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                                >
                                  {isBusy ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {tab === "logout" && (
                <div className="text-center py-10 px-4">
                  <h2 className="font-serif font-semibold text-2xl text-[#7B1E3D] mb-3">Logout</h2>
                  <p className="text-sm text-[#8A7A63] mb-7">
                    You're about to sign out of your Shika Arts account.
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 bg-[#7B1E3D] hover:bg-[#5E1730] text-white text-sm font-medium px-8 py-3 rounded-full transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    Confirm Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
