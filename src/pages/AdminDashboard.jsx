import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getAdminOrders,
  getAdminOrderDetail,
  getAdminOrdersSummary,
} from "@/services/orderService";

function IconBase({ size = 18, className, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {children}
    </svg>
  );
}

const GEAR_TEETH_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function SearchIcon({ size = 16, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle cx="10.5" cy="10.5" r="6.4" fill="currentColor" fillOpacity="0.12" />
      <circle cx="10.5" cy="10.5" r="6.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="10.5" cy="10.5" r="1.2" fill="currentColor" />
      <line
        x1="15.4"
        y1="15.4"
        x2="20.4"
        y2="20.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function RefreshIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="3 3"
        opacity="0.45"
      />
      <path
        d="M12 5.2a6.8 6.8 0 1 1-6 3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <polyline
        points="4.6 4.6 5.4 9 9.8 8.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function CloseIcon({ size = 16, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" />
      <line
        x1="8.5"
        y1="8.5"
        x2="15.5"
        y2="15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="15.5"
        y1="8.5"
        x2="8.5"
        y2="15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function FilterIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <line
        x1="6"
        y1="4"
        x2="6"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="4"
        x2="18"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="6" cy="9" r="2.2" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="15" r="2.2" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="7" r="2.2" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
    </IconBase>
  );
}

function ChevronLeftIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <polyline
        points="15.5 5.5 8.5 12 15.5 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function ChevronRightIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <polyline
        points="8.5 5.5 15.5 12 8.5 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function ChevronDownIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <polyline
        points="5.5 8.5 12 15.5 18.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function CrateIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <polygon
        points="12,3 20,7.2 12,11.4 4,7.2"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <polygon
        points="4,7.2 12,11.4 12,20 4,15.8"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <polygon
        points="20,7.2 12,11.4 12,20 20,15.8"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line
        x1="8"
        y1="5.1"
        x2="16"
        y2="9.3"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.6"
      />
    </IconBase>
  );
}

function RupeeIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <text
        x="12"
        y="16.4"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        fontFamily="Georgia, serif"
      >
        ₹
      </text>
    </IconBase>
  );
}

function CheckSealIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.4"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.6 2.4"
      />
      <polyline
        points="8 12.4 11 15.4 16 9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function ClockIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.4"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="7.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="12"
        x2="15.4"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
      <line
        x1="12"
        y1="3.6"
        x2="12"
        y2="4.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="19.4"
        x2="12"
        y2="20.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="3.6"
        y1="12"
        x2="4.6"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="19.4"
        y1="12"
        x2="20.4"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function CancelSealIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.4"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.6 2.4"
      />
      <line
        x1="9"
        y1="9"
        x2="15"
        y2="15"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="9"
        x2="9"
        y2="15"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function RefundIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <path
        d="M6 8a7 7 0 1 1-1.4 5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <polyline
        points="4 4.6 4.6 8.4 8.4 7.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13"
        r="2.6"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </IconBase>
  );
}

function GearIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle cx="12" cy="12" r="5.2" fill="currentColor" fillOpacity="0.16" />
      <circle cx="12" cy="12" r="5.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      {GEAR_TEETH_ANGLES.map((angle) => (
        <rect
          key={angle}
          x="10.9"
          y="1.6"
          width="2.2"
          height="3.4"
          rx="0.6"
          fill="currentColor"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </IconBase>
  );
}

function DraftIcon({ size = 18, className }) {
  return (
    <IconBase size={size} className={className}>
      <path
        d="M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15 3v3h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="7.5"
        y1="12"
        x2="14.5"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="2.2 2"
        strokeLinecap="round"
      />
      <line
        x1="7.5"
        y1="15.5"
        x2="12.5"
        y2="15.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="2.2 2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function PhoneIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle
        cx="7"
        cy="7"
        r="3"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle
        cx="17"
        cy="17"
        r="3"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="9.1"
        y1="9.1"
        x2="14.9"
        y2="14.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function MailIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <polyline
        points="3.5 7 12 13 20.5 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="1.3" fill="currentColor" />
    </IconBase>
  );
}

function PinIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <path
        d="M12 2.4c-4 0-7.2 3.1-7.2 7.4 0 5.4 7.2 12 7.2 12s7.2-6.6 7.2-12c0-4.3-3.2-7.4-7.2-7.4z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <polygon
        points="12 6.6 14.6 9.6 12 12.6 9.4 9.6"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function CardIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <rect
        x="2.5"
        y="5.5"
        width="19"
        height="13"
        rx="2.2"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="5"
        y="9"
        width="4.4"
        height="3.2"
        rx="0.7"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line
        x1="5"
        y1="15.4"
        x2="12"
        y2="15.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M16 9.5a2.6 2.6 0 0 1 0 5"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M18.2 8.3a4.6 4.6 0 0 1 0 7.4"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </IconBase>
  );
}

function UserIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <circle
        cx="12"
        cy="8.5"
        r="3.4"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function TruckIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <rect
        x="2.5"
        y="8"
        width="11"
        height="8"
        rx="1.2"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M13.5 11h3.6l3.4 3v2h-7z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle
        cx="7"
        cy="17.4"
        r="1.6"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle
        cx="17"
        cy="17.4"
        r="1.6"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </IconBase>
  );
}

function ReceiptIcon({ size = 14, className }) {
  return (
    <IconBase size={size} className={className}>
      <path
        d="M6 2.5h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line
        x1="8.5"
        y1="7"
        x2="15.5"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="8.5"
        y1="10.5"
        x2="15.5"
        y2="10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="8.5"
        y1="14"
        x2="12.5"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "on-hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  processing: "bg-sky-50 text-sky-700 ring-sky-600/20",
  "on-hold": "bg-orange-50 text-orange-700 ring-orange-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
  refunded: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
};

const ACCENTS = {
  gold: { from: "#EAD08A", to: "#C9A227", glow: "rgba(201,162,39,0.32)" },
  olive: { from: "#B7C395", to: "#71804A", glow: "rgba(113,128,74,0.28)" },
  slate: { from: "#A9C0D6", to: "#5C7A94", glow: "rgba(92,122,148,0.28)" },
  terracotta: { from: "#E7A98A", to: "#C1613F", glow: "rgba(193,97,63,0.30)" },
  maroon: { from: "#B4677C", to: "#7A2438", glow: "rgba(122,36,56,0.30)" },
  plum: { from: "#C79FC0", to: "#8B4B7F", glow: "rgba(139,75,127,0.28)" },
  sand: { from: "#D8C6A6", to: "#9C8258", glow: "rgba(156,130,88,0.28)" },
};

const STATUS_ICON_MAP = {
  processing: GearIcon,
  completed: CheckSealIcon,
  cancelled: CancelSealIcon,
  refunded: RefundIcon,
  pending: ClockIcon,
  "on-hold": ClockIcon,
  failed: CancelSealIcon,
  "checkout-draft": DraftIcon,
};

const STATUS_ACCENT_MAP = {
  processing: "slate",
  completed: "olive",
  cancelled: "maroon",
  refunded: "plum",
  pending: "terracotta",
  "on-hold": "terracotta",
  failed: "maroon",
  "checkout-draft": "sand",
};

function formatMoney(value, currency = "INR") {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stripHtml(value) {
  if (value == null) return "";
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function formatAddress(target) {
  if (!target) return "";
  const line1 = [target.address_1, target.address_2].filter(Boolean).join(", ");
  const line2 = [target.city, target.state, target.postcode].filter(Boolean).join(", ");
  const line3 = target.country || "";
  return [line1, line2, line3].filter(Boolean).join(" · ");
}

function formatStatusLabel(key) {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatusBadge({ status, label }) {
  const style = STATUS_STYLES[status] || "bg-stone-100 text-stone-700 ring-stone-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}

function useCountUp(target, { duration = 1000, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  const start = useRef(null);

  useEffect(() => {
    const numeric = Number(target) || 0;
    start.current = null;
    cancelAnimationFrame(raf.current);

    function tick(ts) {
      if (start.current === null) start.current = ts;
      const progress = Math.min(1, (ts - start.current) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(numeric * eased);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
      else setValue(numeric);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return decimals ? value.toFixed(decimals) : Math.round(value);
}

function StatusMiniCard({
  icon: Icon,
  label,
  count,
  total,
  currency,
  accent = "slate",
  delay = 0,
}) {
  const palette = ACCENTS[accent] || ACCENTS.slate;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-3.5"
    >
      <div
        className="pointer-events-none absolute -right-5 -bottom-6 h-20 w-20 rounded-full opacity-[0.12]"
        style={{ background: `radial-gradient(circle, ${palette.to}, transparent 70%)` }}
      />
      <div className="relative flex items-center gap-2.5">
        <div className="relative h-8 w-8 shrink-0 sm:h-9 sm:w-9">
          <div
            className="absolute inset-0 rounded-lg"
            style={{ background: `linear-gradient(145deg, ${palette.from}, ${palette.to})` }}
          />
          <div className="relative flex h-full w-full items-center justify-center">
            <Icon size={14} className="text-white" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-stone-700 sm:text-sm">{label}</p>
          <p className="text-[10px] text-stone-400 sm:text-[11px]">
            {count} order{count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <p
        className="relative mt-2 text-right text-sm font-bold text-stone-900 sm:text-base"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatMoney(total, currency)}
      </p>
    </motion.div>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-stone-500">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-rose-800 focus:ring-2 focus:ring-rose-100";

function OrderDetailModal({ orderId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getAdminOrderDetail(orderId)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch(() => {
        if (active) setError("Couldn't load order details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A0E16]/55 p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white sm:h-auto sm:max-h-[88vh] sm:max-w-2xl sm:rounded-2xl"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Order</p>
            <p className="text-lg font-semibold text-stone-900">
              #{detail?.order_number || orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition hover:bg-rose-50 hover:text-rose-800"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <RefreshIcon size={22} className="animate-spin text-stone-300" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-rose-700">{error}</p>
          ) : detail ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={detail.status} label={detail.status_name} />
                  <span className="text-xs text-stone-400">
                    Placed {formatDate(detail.date_created)}
                  </span>
                </div>
                {detail.date_paid && (
                  <span className="text-xs text-stone-400">
                    Paid {formatDate(detail.date_paid)}
                  </span>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-100 p-3.5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                    <UserIcon size={12} /> Billing details
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    {detail.billing.first_name} {detail.billing.last_name}
                  </p>
                  <div className="mt-1.5 space-y-1.5 text-xs text-stone-500">
                    <p className="flex items-center gap-1.5">
                      <MailIcon size={12} /> {detail.billing.email || "—"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <PhoneIcon size={12} /> {detail.billing.phone || "—"}
                    </p>
                    <p className="flex items-start gap-1.5">
                      <PinIcon size={12} className="mt-0.5 shrink-0" />
                      <span>{formatAddress(detail.billing) || "—"}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-100 p-3.5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                    <TruckIcon size={12} /> Shipping details
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    {detail.shipping?.first_name || detail.billing.first_name}{" "}
                    {detail.shipping?.last_name || detail.billing.last_name}
                  </p>
                  <div className="mt-1.5 space-y-1.5 text-xs text-stone-500">
                    <p className="flex items-start gap-1.5">
                      <PinIcon size={12} className="mt-0.5 shrink-0" />
                      <span>
                        {formatAddress(detail.shipping) || formatAddress(detail.billing) || "—"}
                      </span>
                    </p>
                    {detail.customer_id != null && (
                      <p className="flex items-center gap-1.5">
                        <UserIcon size={12} /> Customer ID #{detail.customer_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-stone-100 p-3.5">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                  <CardIcon size={12} /> Payment
                </p>
                <p className="text-sm font-medium text-stone-800">
                  {detail.payment_method_title || detail.payment_method || "—"}
                </p>
                <div className="mt-2 grid gap-1 text-xs text-stone-500 sm:grid-cols-2">
                  <p className="truncate">Order Id : {detail.razorpay_order_id || "—"}</p>
                  <p className="truncate">Payment Id : {detail.razorpay_payment_id || "—"}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                  Items ({detail.items.length})
                </p>
                <div className="space-y-2">
                  {detail.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl border border-stone-100 p-2.5"
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-stone-50">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-stone-300">
                            <CrateIcon size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-800">{item.name}</p>
                        {item.attributes?.length > 0 && (
                          <p className="truncate text-xs text-stone-400">
                            {item.attributes
                              .map((a) => `${stripHtml(a.key)}: ${stripHtml(a.value)}`)
                              .join(" / ")}
                          </p>
                        )}
                        <p className="truncate text-xs text-stone-400">
                          {item.sku ? `SKU ${item.sku} · ` : ""}
                          Qty {item.quantity} × {formatMoney(item.unit_price, detail.currency)}
                          {Number(item.tax) > 0
                            ? ` · Tax ${formatMoney(item.tax, detail.currency)}`
                            : ""}
                        </p>
                      </div>
                      <p
                        className="text-sm font-medium text-stone-800"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatMoney(item.total, detail.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-stone-100 p-3.5">
                <div className="flex items-center justify-between py-1 text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(detail.subtotal, detail.currency)}
                  </span>
                </div>
                {Number(detail.discount_total) > 0 && (
                  <div className="flex items-center justify-between py-1 text-sm text-stone-500">
                    <span>Discount</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      -{formatMoney(detail.discount_total, detail.currency)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 text-sm text-stone-500">
                  <span>Shipping</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(detail.shipping_total, detail.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 text-sm text-stone-500">
                  <span>Tax</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(detail.tax_total, detail.currency)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between border-t border-stone-100 pt-2 text-sm font-semibold text-stone-900">
                  <span>Total</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(detail.total, detail.currency)}
                  </span>
                </div>
              </div>

              {detail.refunds?.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                    <ReceiptIcon size={12} /> Refunds
                  </p>
                  <div className="space-y-2">
                    {detail.refunds.map((refund, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-fuchsia-50/60 p-2.5 text-xs text-stone-600"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex-1">{refund.reason || "Refund issued"}</span>
                          <span
                            className="shrink-0 font-semibold text-stone-800"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {formatMoney(refund.amount, detail.currency)}
                          </span>
                        </div>
                        <p className="mt-1 text-stone-400">{formatDate(refund.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.notes?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                    Order notes ({detail.notes.length})
                  </p>
                  <div className="space-y-2">
                    {detail.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-amber-50/60 p-2.5 text-xs text-stone-600"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex-1">{note.content}</p>
                          {note.added_by && (
                            <span className="shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-stone-400 ring-1 ring-inset ring-stone-200">
                              {note.added_by === "system" ? "System" : note.added_by}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-stone-400">{formatDate(note.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrdersDashboard() {
  const [filters, setFilters] = useState({
    status: [],
    search: "",
    date_from: "",
    date_to: "",
    min_amount: "",
    max_amount: "",
    payment_method: "",
    orderby: "date",
    order: "DESC",
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const requestId = useRef(0);

  const loadOrders = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");

    getAdminOrders({
      page,
      per_page: perPage,
      status: filters.status.join(","),
      search: filters.search,
      date_from: filters.date_from,
      date_to: filters.date_to,
      min_amount: filters.min_amount,
      max_amount: filters.max_amount,
      payment_method: filters.payment_method,
      orderby: filters.orderby,
      order: filters.order,
    })
      .then((data) => {
        if (id !== requestId.current) return;
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setError("Couldn't load orders. Check your connection and try again.");
      })
      .finally(() => {
        if (id !== requestId.current) return;
        setLoading(false);
      });
  }, [page, perPage, filters]);

  const loadSummary = useCallback(() => {
    getAdminOrdersSummary({
      date_from: filters.date_from,
      date_to: filters.date_to,
    })
      .then((data) => setSummary(data.summary))
      .catch(() => {});
  }, [filters.date_from, filters.date_to]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  function toggleStatus(value) {
    setFilters((f) => {
      const exists = f.status.includes(value);
      return {
        ...f,
        status: exists ? f.status.filter((s) => s !== value) : [...f.status, value],
      };
    });
    setPage(1);
  }

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({
      status: [],
      search: "",
      date_from: "",
      date_to: "",
      min_amount: "",
      max_amount: "",
      payment_method: "",
      orderby: "date",
      order: "DESC",
    });
    setSearchInput("");
    setPage(1);
  }

  const activeFilterCount =
    filters.status.length +
    (filters.search ? 1 : 0) +
    (filters.date_from ? 1 : 0) +
    (filters.date_to ? 1 : 0) +
    (filters.min_amount ? 1 : 0) +
    (filters.max_amount ? 1 : 0) +
    (filters.payment_method ? 1 : 0);

  const breakdownEntries = summary?.status_breakdown
    ? Object.entries(summary.status_breakdown)
    : [];

  return (
    <div className="min-h-screen bg-stone-50 px-3 py-5 sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 sm:text-2xl">Orders</h1>
          </div>
          <button
            onClick={() => {
              loadOrders();
              loadSummary();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-amber-50 hover:text-rose-900"
          >
            <RefreshIcon size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {summary && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
              <StatCard
                icon={CrateIcon}
                label="Orders"
                value={summary.total_orders}
                accent="gold"
                delay={0}
                caption="All-time orders placed"
              />
              <StatCard
                icon={RupeeIcon}
                label="Revenue"
                value={summary.total_revenue}
                format={formatMoney}
                accent="olive"
                delay={0.03}
                caption="Total paid revenue"
              />
              <StatCard
                icon={CheckSealIcon}
                label="Paid"
                value={summary.paid_orders}
                accent="slate"
                delay={0.06}
                caption="Successfully paid"
              />
              <StatCard
                icon={ClockIcon}
                label="Pending"
                value={summary.pending_orders}
                accent="terracotta"
                delay={0.09}
                caption="Awaiting payment"
              />
              <StatCard
                icon={CancelSealIcon}
                label="Cancelled"
                value={summary.cancelled_orders}
                accent="maroon"
                delay={0.12}
                caption="Orders cancelled"
              />
              <StatCard
                icon={RefundIcon}
                label="Refunded"
                value={summary.refunded_orders}
                accent="plum"
                delay={0.15}
                caption="Returned & refunded"
              />
            </div>

            {breakdownEntries.length > 0 && (
              <div className="mt-4 sm:mt-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:text-[11px]">
                  Status
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4">
                  {breakdownEntries.map(([key, data], idx) => {
                    const Icon = STATUS_ICON_MAP[key] || CrateIcon;
                    const accent = STATUS_ACCENT_MAP[key] || "slate";
                    return (
                      <StatusMiniCard
                        key={key}
                        icon={Icon}
                        label={formatStatusLabel(key)}
                        count={data.count}
                        total={data.total}
                        currency="INR"
                        accent={accent}
                        delay={idx * 0.03}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-5 rounded-2xl border border-stone-200 bg-white sm:mt-6">
          <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 p-4">
            <div className="relative min-w-[200px] flex-1">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by order number, name or email"
                className={`${inputClass} pl-9`}
              />
            </div>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-amber-50"
            >
              <FilterIcon size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-rose-950 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDownIcon
                size={14}
                className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-stone-400 transition hover:text-rose-900"
              >
                Clear all
              </button>
            )}
          </div>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-b border-stone-100"
              >
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => toggleStatus(s.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
                          filters.status.includes(s.value)
                            ? "bg-rose-950 text-white ring-rose-950"
                            : "bg-white text-stone-500 ring-stone-200 hover:bg-amber-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FilterField label="From date">
                      <input
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => updateFilter("date_from", e.target.value)}
                        className={inputClass}
                      />
                    </FilterField>
                    <FilterField label="To date">
                      <input
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => updateFilter("date_to", e.target.value)}
                        className={inputClass}
                      />
                    </FilterField>
                    <FilterField label="Min amount">
                      <input
                        type="number"
                        value={filters.min_amount}
                        onChange={(e) => updateFilter("min_amount", e.target.value)}
                        placeholder="0"
                        className={inputClass}
                      />
                    </FilterField>
                    <FilterField label="Max amount">
                      <input
                        type="number"
                        value={filters.max_amount}
                        onChange={(e) => updateFilter("max_amount", e.target.value)}
                        placeholder="No limit"
                        className={inputClass}
                      />
                    </FilterField>
                    <FilterField label="Payment method">
                      <select
                        value={filters.payment_method}
                        onChange={(e) => updateFilter("payment_method", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">All methods</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="cod">Cash on delivery</option>
                        <option value="bacs">Bank transfer</option>
                      </select>
                    </FilterField>
                    <FilterField label="Sort by">
                      <select
                        value={filters.orderby}
                        onChange={(e) => updateFilter("orderby", e.target.value)}
                        className={inputClass}
                      >
                        <option value="date">Date</option>
                        <option value="total">Order total</option>
                      </select>
                    </FilterField>
                    <FilterField label="Direction">
                      <select
                        value={filters.order}
                        onChange={(e) => updateFilter("order", e.target.value)}
                        className={inputClass}
                      >
                        <option value="DESC">Newest first</option>
                        <option value="ASC">Oldest first</option>
                      </select>
                    </FilterField>
                    <FilterField label="Rows per page">
                      <select
                        value={perPage}
                        onChange={(e) => {
                          setPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                        className={inputClass}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </FilterField>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-4">
              <p className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>
            </div>
          )}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {!loading &&
                    orders.map((order, idx) => (
                      <motion.tr
                        key={order.order_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        onClick={() => setActiveOrderId(order.order_id)}
                        className="cursor-pointer border-b border-stone-50 transition hover:bg-amber-50/50"
                      >
                        <td className="px-4 py-3 font-medium text-stone-800">
                          #{order.order_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-stone-800">{order.customer_name || "Guest"}</p>
                          <p className="text-xs text-stone-400">{order.customer_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} label={order.status_name} />
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          {order.payment_method_title || "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-500">{order.items_count}</td>
                        <td
                          className="px-4 py-3 text-right font-medium text-stone-800"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {formatMoney(order.total, order.currency)}
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-400">
                          {formatDate(order.date_created)}
                        </td>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </tbody>
            </table>

            {loading && (
              <div className="flex h-40 items-center justify-center">
                <RefreshIcon size={22} className="animate-spin text-stone-300" />
              </div>
            )}

            {!loading && orders.length === 0 && !error && (
              <div className="flex h-40 flex-col items-center justify-center text-stone-400">
                <CrateIcon size={28} className="mb-2 opacity-40" />
                <p className="text-sm">No orders match these filters</p>
              </div>
            )}
          </div>

          <div className="space-y-2 p-3 lg:hidden">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <RefreshIcon size={22} className="animate-spin text-stone-300" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-stone-400">
                <CrateIcon size={26} className="mb-2 opacity-40" />
                <p className="text-sm">No orders match these filters</p>
              </div>
            ) : (
              orders.map((order, idx) => (
                <motion.div
                  key={order.order_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  onClick={() => setActiveOrderId(order.order_id)}
                  className="rounded-xl border border-stone-100 p-3.5 transition active:bg-amber-50/60"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-stone-800">#{order.order_number}</p>
                    <StatusBadge status={order.status} label={order.status_name} />
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{order.customer_name || "Guest"}</p>
                  <p className="text-xs text-stone-400">{order.customer_email}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-stone-400">
                      {order.items_count} item{order.items_count !== 1 ? "s" : ""} ·{" "}
                      {formatDate(order.date_created)}
                    </span>
                    <span
                      className="font-semibold text-stone-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatMoney(order.total, order.currency)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 p-4">
            <p className="text-xs text-stone-400">
              {total > 0
                ? `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`
                : "No results"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeftIcon size={14} />
                Prev
              </button>
              <span className="text-sm text-stone-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white"
              >
                Next
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeOrderId && (
          <OrderDetailModal orderId={activeOrderId} onClose={() => setActiveOrderId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
