export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white pt-5 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-serif text-4xl text-gray-900 mb-3">Terms &amp; Conditions</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-12">
          Last updated: July 2026
        </p>

        <Section title="1. Acceptance of Terms">
          By accessing or using the Shika Arts website and placing an order, you agree to be
          bound by these Terms &amp; Conditions. If you do not agree, please do not use our
          site or services.
        </Section>

        <Section title="2. Products & Orders">
          All products listed on our site are subject to availability. We reserve the right to
          limit quantities or discontinue any product at any time. Once an order is placed, you
          will receive a confirmation email. We reserve the right to cancel any order due to
          pricing errors, stock issues, or suspected fraud.
        </Section>

        <Section title="3. Pricing & Payment">
          All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes
          unless otherwise stated. We accept all major credit/debit cards and UPI. Payment is
          processed securely through our payment gateway.
        </Section>

        <Section title="4. Shipping & Delivery">
          We aim to dispatch orders within 2–3 business days. Estimated delivery times are
          7 business days for standard shipping. Shika Arts is not liable for delays caused by
          courier partners, weather events, or customs. Risk of loss passes to you upon
          delivery.
        </Section>

        <Section title="5. Returns & Refunds">
          Due to the handcrafted and perishable nature of our products, we do not accept
          returns. If you receive a damaged or incorrect item, please contact us within 48 hours
          of delivery at{" "}
          <a href="mailto:hello@shikaarts.com" className="underline text-gray-700">
            hello@shikaarts.com
          </a>{" "}
          with photographs, and we will resolve the matter promptly.
        </Section>

        <Section title="6. Intellectual Property">
          All content on this website — including text, images, logos, and product designs — is
          the exclusive property of Shika Arts and may not be reproduced, distributed, or used
          without prior written consent.
        </Section>

        <Section title="7. Limitation of Liability">
          Shika Arts shall not be liable for any indirect, incidental, or consequential damages
          arising from the use of our products or website. Our total liability is limited to the
          amount paid for the specific order in question.
        </Section>

        <Section title="8. Governing Law">
          These Terms &amp; Conditions are governed by the laws of India. Any disputes shall be
          subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
        </Section>

        <Section title="9. Contact Us">
          For any questions regarding these terms, please contact us at{" "}
          <a href="mailto:hello@shikaarts.com" className="underline text-gray-700">
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
