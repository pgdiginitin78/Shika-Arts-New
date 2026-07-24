import { forwardRef } from "react";

const RED = "#7A1F3D";
const GOLD = "#B8860B";
const INK = "#1c1c1c";
const MUTED = "#6b6b6b";
const BORDER = "#e5e0dc";
const PAPER = "#fffdfb";
const SOFT_BG = "#faf6f3";

function fmt(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function fmtDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const InvoiceTemplate = forwardRef(function InvoiceTemplate({ order }, ref) {
  if (!order) return null;

  const items = order.items ?? [];
  const billing = order.billing ?? {};
  const shipping = order.shipping ?? {};
  const currency = order.currency ?? "INR";
  const total = Number(order.total ?? 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item?.price ?? 0), 0);
  const shippingCost = Math.max(0, total - subtotal);
  const orderNum = order.order_number ?? order.order_id ?? "—";
  const invoiceNum = `INV-${String(orderNum).padStart(4, "0")}`;
  const invoiceDate = fmtDate(order.date_created);
  const paymentStatus = ["completed", "processing"].includes(order.status) ? "Paid" : "Pending";

  const shipFirst = shipping.first_name || billing.first_name || "";
  const shipLast = shipping.last_name || billing.last_name || "";
  const shipAddr1 = shipping.address_1 || billing.address_1 || "";
  const shipCity = shipping.city || billing.city || "";
  const shipState = shipping.state || billing.state || "";
  const shipPost = shipping.postcode || billing.postcode || "";
  const shipCountry = shipping.country || billing.country || "";

  const tdBase = {
    padding: "10px 14px",
    fontSize: "11.5px",
    color: "#333",
    borderBottom: `1px solid ${BORDER}`,
    verticalAlign: "middle",
  };

  const sectionLabel = {
    fontWeight: "700",
    fontSize: "10.5px",
    color: RED,
    margin: "0 0 8px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: PAPER,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: INK,
        boxSizing: "border-box",
        overflow: "hidden",
        border: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: "6px", background: `linear-gradient(90deg, ${RED}, ${GOLD})`, flexShrink: 0 }} />

      <div style={{ padding: "34px 40px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: "28px", fontWeight: "800", color: RED, margin: "0 0 4px", fontFamily: "Georgia, serif", letterSpacing: "0.03em" }}>
            SHIKA ARTS
          </p>
          <p style={{ fontSize: "11px", color: MUTED, margin: 0, letterSpacing: "0.03em" }}>
            Handcrafted with Love, Made for You
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "26px", fontWeight: "800", color: INK, margin: "0 0 6px", letterSpacing: "0.08em" }}>
            INVOICE
          </p>
          <p style={{ fontSize: "12.5px", fontWeight: "700", color: RED, margin: "0 0 2px" }}>
            {invoiceNum}
          </p>
          <p style={{ fontSize: "10.5px", color: MUTED, margin: 0, fontStyle: "italic" }}>
            Thank you for your order
          </p>
        </div>
      </div>

      <div style={{ padding: "0 40px 20px", display: "flex", justifyContent: "space-between", gap: "24px" }}>
        <div style={{ flex: 1.2 }}>
          <p style={{ fontWeight: "700", fontSize: "12.5px", margin: "0 0 6px", color: INK }}>
            Shika Arts
          </p>
          <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 2px", lineHeight: "1.5" }}>
            15 Sujay, Canal Rd, behind Shriram Bhavan, Ramdaspeth, Nagpur, Maharashtra 440010
          </p>
          <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 2px" }}>
            +91 93704 40001 · +91 86984 74999
          </p>
          <p style={{ fontSize: "11px", color: MUTED, margin: 0 }}>info@shikaarts.com</p>
        </div>

        <div style={{ width: "270px" }}>
          {[
            ["Invoice Date", invoiceDate],
            ["Order Number", `#ORD-${orderNum}`],
            ["Order Date", invoiceDate],
            ["Payment Method", order.payment_method ?? "Razorpay"],
            ["Payment Status", paymentStatus],
          ].map(([label, value], idx, arr) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                padding: "6px 0",
                borderBottom: idx === arr.length - 1 ? "none" : `1px solid ${BORDER}`,
              }}
            >
              <span style={{ color: MUTED, fontWeight: "600" }}>{label}</span>
              <span
                style={{
                  color:
                    label === "Payment Status"
                      ? paymentStatus === "Paid"
                        ? "#1a7a3c"
                        : "#b3720c"
                      : INK,
                  fontWeight: "700",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "1px", background: BORDER, margin: "0 40px" }} />

      <div style={{ padding: "22px 40px", display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <p style={sectionLabel}>Billing Address</p>
          <p style={{ fontWeight: "700", fontSize: "12px", margin: "0 0 4px", color: INK }}>
            {billing.first_name} {billing.last_name}
          </p>
          {billing.address_1 && (
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 2px", lineHeight: "1.5" }}>
              {billing.address_1}
            </p>
          )}
          {billing.city && (
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 2px" }}>
              {billing.city}
              {billing.state ? `, ${billing.state}` : ""} - {billing.postcode}
            </p>
          )}
          {billing.country && (
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 6px" }}>{billing.country}</p>
          )}
          {billing.email && (
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 2px" }}>
              Email: {billing.email}
            </p>
          )}
          {billing.phone && (
            <p style={{ fontSize: "11px", color: MUTED, margin: 0 }}>Phone: {billing.phone}</p>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <p style={sectionLabel}>Shipping Address</p>
          <p style={{ fontWeight: "700", fontSize: "12px", margin: "0 0 4px", color: INK }}>
            {shipFirst} {shipLast}
          </p>
          {shipAddr1 && (
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 2px", lineHeight: "1.5" }}>
              {shipAddr1}
            </p>
          )}
          {shipCity && (
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 2px" }}>
              {shipCity}
              {shipState ? `, ${shipState}` : ""} - {shipPost}
            </p>
          )}
          {shipCountry && (
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 6px" }}>{shipCountry}</p>
          )}
          {billing.phone && (
            <p style={{ fontSize: "11px", color: MUTED, margin: 0 }}>Phone: {billing.phone}</p>
          )}
        </div>

        <div style={{ width: "190px" }}>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ background: RED, padding: "10px 14px" }}>
              <p style={{ color: "#fff", fontSize: "11.5px", fontWeight: "700", margin: 0, letterSpacing: "0.03em" }}>
                ORDER SUMMARY
              </p>
            </div>
            <div style={{ padding: "12px 14px", background: SOFT_BG }}>
              {[
                ["Items", `${items.length}`],
                ["Shipping", shippingCost > 0 ? "Standard" : "Free"],
              ].map(([k, v], idx) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    marginBottom: idx === 0 ? "8px" : 0,
                    color: MUTED,
                  }}
                >
                  <span>{k}</span>
                  <span style={{ color: INK, fontWeight: "700" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 40px 18px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: `1px solid ${BORDER}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: RED }}>
              {[
                { label: "#", align: "center", w: "34px" },
                { label: "Product", align: "left" },
                { label: "SKU", align: "center", w: "100px" },
                { label: "Unit Price", align: "right", w: "95px" },
                { label: "Qty", align: "right", w: "45px" },
                { label: "Total", align: "right", w: "95px" },
              ].map(({ label, align, w }) => (
                <th
                  key={label}
                  style={{
                    padding: "12px 14px",
                    fontSize: "10.5px",
                    fontWeight: "700",
                    color: "#fff",
                    textAlign: align,
                    border: "none",
                    width: w,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const itemTotal = Number(item?.price ?? 0);
              const qty = Number(item?.quantity ?? 1);
              const unitPrice = qty > 0 ? itemTotal / qty : itemTotal;
              const attrs =
                Array.isArray(item?.attributes) && item.attributes.length > 0
                  ? item.attributes
                      .map((a) => stripHtml(a?.value))
                      .filter(Boolean)
                      .join(" · ")
                  : null;
              const sku = attrs || `SKU-${String(item?.product_id ?? i + 1).padStart(3, "0")}`;

              return (
                <tr key={item?.product_id ?? i} style={{ background: i % 2 === 0 ? PAPER : SOFT_BG }}>
                  <td style={{ ...tdBase, textAlign: "center", color: "#999", fontSize: "11px" }}>
                    {i + 1}
                  </td>
                  <td style={{ ...tdBase }}>
                    <p style={{ margin: 0, fontWeight: "600", color: INK, fontSize: "11.5px" }}>
                      {item?.name}
                    </p>
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", color: "#888", fontSize: "10.5px" }}>
                    {sku}
                  </td>
                  <td style={{ ...tdBase, textAlign: "right" }}>{fmt(unitPrice, currency)}</td>
                  <td style={{ ...tdBase, textAlign: "right" }}>{qty}</td>
                  <td style={{ ...tdBase, textAlign: "right", fontWeight: "700", color: INK }}>
                    {fmt(itemTotal, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "0 40px 28px", display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <p style={sectionLabel}>Notes</p>
          <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 4px", lineHeight: "1.6" }}>
            Thank you for shopping with us.
          </p>
          <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 14px", lineHeight: "1.6" }}>
            If you have any questions, please contact our support.
          </p>
          <div
            style={{
              background: SOFT_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: "6px",
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: "11.5px", fontWeight: "700", color: INK, margin: "0 0 6px" }}>
              Need Help?
            </p>
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 3px" }}>
              Email: info@shikaarts.com
            </p>
            <p style={{ fontSize: "11px", color: MUTED, margin: "0 0 3px" }}>
              Phone: +91 93704 40001
            </p>
            <p style={{ fontSize: "11px", color: MUTED, margin: 0 }}>Phone: +91 86984 74999</p>
          </div>
        </div>

        <div style={{ width: "260px" }}>
          {[
            ["Subtotal", fmt(subtotal, currency)],
            ["Shipping Charges", shippingCost > 0 ? fmt(shippingCost, currency) : "Free"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11.5px",
                padding: "9px 0",
                borderBottom: `1px solid ${BORDER}`,
                color: MUTED,
              }}
            >
              <span>{label}</span>
              <span style={{ color: INK, fontWeight: "600" }}>{value}</span>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              marginTop: "12px",
              background: RED,
              borderRadius: "6px",
            }}
          >
            <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#fff", letterSpacing: "0.06em" }}>
              GRAND TOTAL
            </span>
            <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>
              {fmt(total, currency)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", flexShrink: 0 }}>
        <div style={{ height: "1px", background: BORDER, margin: "0 40px" }} />

        <div style={{ padding: "22px 40px 26px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "14px",
              fontStyle: "italic",
              color: RED,
              fontFamily: "Georgia, serif",
              fontWeight: "700",
              margin: "0 0 4px",
            }}
          >
            Thank you for your purchase!
          </p>
          <p style={{ fontSize: "10px", color: MUTED, margin: 0, letterSpacing: "0.04em" }}>
            Shika Arts · info@shikaarts.com
          </p>
        </div>

        <div style={{ height: "6px", background: `linear-gradient(90deg, ${GOLD}, ${RED})` }} />
      </div>
    </div>
  );
});

export default InvoiceTemplate;