export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white pt-5 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-serif text-4xl text-gray-900 mb-3">Privacy Policy</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-12">
          Last updated: July 2026
        </p>

        <Section title="1. Information We Collect">
          We collect personal information that you voluntarily provide when placing an order,
          creating an account, or contacting us — including your name, email address, shipping
          address, and payment details. We also collect usage data automatically through cookies
          and similar technologies.
        </Section>

        <Section title="2. How We Use Your Information">
          Your information is used to process and fulfil orders, send order confirmations and
          updates, respond to customer enquiries, improve our website and services, and — with
          your consent — send you marketing communications about new products and promotions.
        </Section>

        <Section title="3. Sharing Your Information">
          We do not sell your personal data. We share it only with trusted service providers
          (payment processors, courier partners, email platforms) strictly for the purpose of
          fulfilling your order or operating our services. All partners are bound by
          confidentiality obligations.
        </Section>

        <Section title="4. Cookies">
          We use essential cookies to keep your cart and session active, and optional analytics
          cookies to understand how visitors use our site. You can manage or disable cookies
          through your browser settings at any time.
        </Section>

        <Section title="5. Data Retention">
          We retain your personal data only as long as necessary to fulfil the purposes outlined
          in this policy or as required by applicable law. Order records are kept for up to
          7 years for accounting purposes.
        </Section>

        <Section title="6. Your Rights">
          You have the right to access, correct, or delete your personal data at any time. To
          exercise any of these rights, please contact us at{" "}
          <a href="mailto:hello@shikaarts.com" className="underline text-gray-700">
            hello@shikaarts.com
          </a>
          . We will respond within 30 days.
        </Section>

        <Section title="7. Security">
          We implement industry-standard security measures including SSL encryption and secure
          payment gateways to protect your information. However, no method of transmission over
          the internet is 100% secure.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy from time to time. Changes will be posted on this
          page with an updated date. Continued use of our site after changes constitutes
          acceptance of the revised policy.
        </Section>

        <Section title="9. Contact Us">
          If you have any questions about this Privacy Policy, please reach out to us at{" "}
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
