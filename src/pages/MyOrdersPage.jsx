import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/woocommerce";
import { getGuestOrders } from "@/services/orderService";
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Package,
  ShoppingBag
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StatusBadge({ status }) {
  const map = {
    processing: { label: "Processing", cls: "bg-blue-100 text-blue-800" },
    "pending-payment": { label: "Pending Payment", cls: "bg-yellow-100 text-yellow-800" },
    pending: { label: "Pending Payment", cls: "bg-yellow-100 text-yellow-800" },
    completed: { label: "Completed", cls: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800" },
    refunded: { label: "Refunded", cls: "bg-gray-100 text-gray-700" },
    "on-hold": { label: "On Hold", cls: "bg-orange-100 text-orange-800" },
  };
  const { label, cls } = map[status] ?? { label: status || "Unknown", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3 w-32 bg-gray-100 rounded" />
      <div className="flex gap-3 pt-2">
        <div className="w-12 h-12 bg-gray-100 rounded-lg" />
        <div className="w-12 h-12 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

function parseStoredUser(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userDetailsObj = parseStoredUser(localStorage.getItem("customerData"));

    if (!userDetailsObj?.id) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);

    getGuestOrders(userDetailsObj.id)
      .then((data) => setOrders(Array.isArray(data?.orders) ? data.orders : []))
      .catch(() => setError("Could not load your orders. Please try again."))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-8 px-4 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-36 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-5">
          <AlertCircle className="mx-auto text-red-400" size={52} />
          <h2 className="text-xl font-serif text-[#1e2321]">Something went wrong</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <Button onClick={() => navigate("/")} className="bg-[#1e2321] text-white hover:bg-[#2d3532]">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-5">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <ShoppingBag className="text-gray-300" size={38} />
          </div>
          <h2 className="text-2xl font-serif text-[#1e2321]">No orders yet</h2>
          <p className="text-gray-400 text-sm">Your past orders will appear here after you make a purchase.</p>
          <Button onClick={() => navigate("/")} className="bg-[#1e2321] text-white hover:bg-[#2d3532]">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#FAFAF8] py-8 px-4 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Package className="text-[#1e2321]" size={24} />
          <h1 className="text-2xl font-serif text-[#1e2321]">My Orders</h1>
          <span className="ml-auto text-sm text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const currency = order?.currency ?? "INR";
            const total = Number(order?.total ?? 0);
            const items = order?.items ?? [];
            const date = order?.date_created
              ? new Date(order.date_created.replace(" ", "T")).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })
              : null;

            return (
              <div
                key={order.order_id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 border-b border-gray-50">
                  <div className="flex items-center gap-3 flex-wrap sm:gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Order</p>
                      <p className="font-semibold text-[#1e2321] text-sm">#{order.order_number ?? order.order_id}</p>
                    </div>
                    {date && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {date}
                      </div>
                    )}
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-semibold text-[#1e2321]">{formatPrice(total, currency)}</p>
                </div>

                <div className="px-4 py-4 sm:px-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex gap-2 flex-wrap flex-1 min-w-0">
                    {items.slice(0, 4).map((item, i) => (
                      <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        {item?.image ? (
                          <img src={item.image} alt={item.name || "Product"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 text-lg">✦</div>
                        )}
                      </div>
                    ))}
                    {items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-gray-400 font-semibold shrink-0">
                        +{items.length - 4}
                      </div>
                    )}
                    <div className="flex-1 min-w-[140px] pl-0 sm:pl-1">
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {items.map((i) => i.name).filter(Boolean).join(", ")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/order-success/${order.order_id}`)
                    }
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1 rounded-lg border border-gray-200 sm:border-none px-4 py-2 sm:px-0 sm:py-0 text-xs font-semibold text-[#1e2321] hover:text-[#7A1F3D] hover:bg-gray-50 sm:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    View Order Details
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-[#1e2321] text-[#1e2321] hover:bg-[#1e2321]/5 w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}