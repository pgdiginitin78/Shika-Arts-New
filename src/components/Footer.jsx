import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-24 pb-12">
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-12 2xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* BRAND */}
          <div className="md:col-span-7">
            <h3 className="font-serif text-4xl mb-6">Shika Arts</h3>
            <p className="text-sm opacity-60 leading-relaxed max-w-sm mb-10">
              A premium gifting atelier crafting heartfelt, handcrafted experiences for every
              occasion. Our mission is to elevate the art of giving through artisanal excellence.
            </p>
            <div className="flex gap-5">
              <a
                href="https://www.instagram.com/shikaarts_/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Instagram size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100063892390349"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://www.linkedin.com/company/shika-arts/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Linkedin size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* CONTACT */}
          <div className="md:col-span-5">
            <h4 className="text-[11px] uppercase tracking-ultra text-accent font-semibold mb-8">
              Contact
            </h4>
            <ul className="space-y-5">
              <li>
                <a
                  href="tel:+919370440001"
                  className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 hover:text-accent transition-all"
                >
                  <Phone size={13} strokeWidth={1.5} className="shrink-0" />
                  +91 93704 40001
                </a>
              </li>
              <li>
                <a
                  href="tel:+918698474999"
                  className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 hover:text-accent transition-all"
                >
                  <Phone size={13} strokeWidth={1.5} className="shrink-0" />
                  +91 86984 74999
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@shikaarts.com"
                  className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 hover:text-accent transition-all"
                >
                  <Mail size={13} strokeWidth={1.5} className="shrink-0" />
                  info@shikaarts.com
                </a>
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
