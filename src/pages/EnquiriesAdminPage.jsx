import { useEffect, useMemo, useState } from "react";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Search, Package, RefreshCcw, Inbox } from "lucide-react";
import { getEnquires } from "@/services/orderService";



function EnquiryCard({ enquiry }) {
  const date = enquiry.created_at
    ? new Date(enquiry.created_at.replace(" ", "T")).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="bg-white border border-gray-100 rounded-[10px] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#F0EAE1] flex items-center justify-center shrink-0">
            <Package size={14} className="text-[#C5A26F]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-serif text-[#1e2321] truncate">{enquiry.product_name}</p>
            <p className="text-[10px] text-gray-400">{date}</p>
          </div>
        </div>
        {enquiry.quantity && (
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[#C5A26F] bg-[#FDF8F1] border border-[#C5A26F]/30 rounded-full px-2 py-1">
            Qty: {enquiry.quantity}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs text-gray-600">
        <p className="font-medium text-[#1e2321]">{enquiry.customer_name}</p>
        <a
          href={`mailto:${enquiry.email}`}
          className="flex items-center gap-1.5 hover:text-[#C5A26F] transition-colors truncate"
        >
          <Mail size={11} className="shrink-0" />
          {enquiry.email}
        </a>
        <a
          href={`tel:${enquiry.phone}`}
          className="flex items-center gap-1.5 hover:text-[#C5A26F] transition-colors"
        >
          <Phone size={11} className="shrink-0" />
          {enquiry.phone}
        </a>
        <a
          href={`https://wa.me/${(enquiry.phone || "").replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#128C7E] hover:underline"
        >
          Message on WhatsApp
        </a>
      </div>

      {(enquiry.customization || enquiry.message) && (
        <div className="border-t border-gray-100 pt-2.5 mt-1 space-y-1.5">
          {enquiry.customization && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-[#1e2321]">Customization: </span>
              {enquiry.customization}
            </p>
          )}
          {enquiry.message && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-[#1e2321]">Message: </span>
              {enquiry.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EnquiriesAdminPage() {
  const token = useCustomerAuthStore((s) => s.customer?.token);

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEnquires();
      setEnquiries(response.data || response || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    if (!search.trim()) return enquiries;
    const q = search.toLowerCase();
    return enquiries.filter(
      (e) =>
        e.product_name?.toLowerCase().includes(q) ||
        e.customer_name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.phone?.toLowerCase().includes(q),
    );
  }, [enquiries, search]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-3 md:px-6 lg:px-10 py-6">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl text-[#1e2321]">Product Enquiries</h1>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? "Loading..." : `${filtered.length} enquir${filtered.length === 1 ? "y" : "ies"}`}
            </p>
          </div>
          <button
            onClick={loadEnquiries}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3 rounded border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:border-[#C5A26F]/50 hover:text-[#C5A26F] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, name, email, or phone"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white text-xs text-[#1e2321] placeholder:text-gray-400 focus:outline-none focus:border-[#C5A26F] transition-colors"
          />
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-[10px]" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-red-100 rounded-[10px] p-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-[10px] p-10 text-center">
            <Inbox size={28} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {search ? "No enquiries match your search." : "No enquiries yet."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((enquiry) => (
              <EnquiryCard key={enquiry.id} enquiry={enquiry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnquiriesAdminPage;
