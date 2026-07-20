import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-24 pb-12">
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-12 2xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* BRAND */}
          <div className="md:col-span-6">
            <h3 className="font-serif text-4xl mb-6">Shika Arts</h3>
            <p className="text-sm opacity-60 leading-relaxed max-w-sm mb-10">
              A premium gifting atelier crafting heartfelt, handcrafted experiences for every
              occasion. Our mission is to elevate the art of giving through artisanal excellence.
            </p>
            <div className="flex gap-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Instagram size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Twitter size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Youtube size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* ATELIERS */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] uppercase tracking-ultra text-accent font-semibold mb-8">
              Ateliers
            </h4>
            <ul className="space-y-4 text-xs opacity-70">
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/category/floral-design">Floral Design</Link>
              </li>
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/category/gourmet-cakes">Gourmet Cakes</Link>
              </li>
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/category/curated-hampers">Curated Hampers</Link>
              </li>
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/category/customizedgifts">Personalized</Link>
              </li>
            </ul>
          </div>

          {/* SERVICE */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] uppercase tracking-ultra text-accent font-semibold mb-8">
              Service
            </h4>
            <ul className="space-y-4 text-xs opacity-70">
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/category/Corporate">Corporate Gifting</Link>
              </li>
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/category/Wedding">Wedding Atelier</Link>
              </li>
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/shipping-policy">Shipping Policy</Link>
              </li>
              <li className="hover:text-accent hover:opacity-100 transition-colors">
                <Link to="/about-us">Contact Us</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] uppercase tracking-ultra opacity-40 text-center">
            © {new Date().getFullYear()} Shika Arts — All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              to="/privacy"
              className="text-[9px] uppercase tracking-ultra opacity-40 hover:opacity-100 transition-opacity"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-[9px] uppercase tracking-ultra opacity-40 hover:opacity-100 transition-opacity"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
