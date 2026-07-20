export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white pt-5 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-serif text-4xl text-gray-900 mb-3">Shipping Policy</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-12">
          Last updated: July 2026
        </p>

        <Section title="1. Processing Time">
          All orders are processed within 2–3 business days. Orders placed on weekends or public
          holidays will be processed on the next working day. You will receive a confirmation
          email once your order has been dispatched.
        </Section>

        <Section title="2. Delivery Time">
          Standard delivery takes 5–7 business days from the date of dispatch. Express delivery
          (2–3 business days) is available at checkout for an additional charge. Delivery times
          may vary during peak seasons, festivals, or due to unforeseen circumstances.
        </Section>

        <Section title="3. Shipping Charges">
          We offer free standard shipping on all orders above ₹999. For orders below ₹999, a
          flat shipping fee of ₹99 applies. Express shipping charges vary based on the delivery
          location and will be displayed at checkout.
        </Section>

        <Section title="4. Delivery Locations">
          We currently ship across India. For international shipping enquiries, please contact us
          at{" "}
          <a href="mailto:info@shikaarts.com" className="underline text-gray-700">
            info@shikaarts.com
          </a>
          .
        </Section>

        <Section title="5. Tracking Your Order">
          Once your order is dispatched, you will receive a tracking number via email and SMS.
          You can use this to track your shipment through our courier partner's website.
        </Section>

        <Section title="6. Damaged or Lost Shipments">
          If your order arrives damaged, please contact us within 48 hours of delivery at{" "}
          <a href="mailto:info@shikaarts.com" className="underline text-gray-700">
            info@shikaarts.com
          </a>{" "}
          with photographs of the damage. For lost shipments, please allow 2 additional business
          days beyond the estimated delivery date before reporting.
        </Section>

        <Section title="7. Contact Us">
          For any shipping-related queries, please reach out to us at{" "}
          <a href="mailto:info@shikaarts.com" className="underline text-gray-700">
            info@shikaarts.com
          </a>
          .
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
