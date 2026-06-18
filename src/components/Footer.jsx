import {
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-24 pb-12">
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-12 2xl:px-0">
   

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24">
          <div className="md:col-span-4">
            <h3 className="font-serif text-4xl mb-6">Shika Arts</h3>
            <p className="text-sm opacity-60 leading-relaxed max-w-xs mb-10">
              A premium gifting atelier crafting heartfelt, handcrafted experiences for every
              occasion. Our mission is to elevate the art of giving through artisanal excellence.
            </p>
            <div className="flex gap-5">
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Instagram size={16} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Twitter size={16} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
              >
                <Youtube size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* LINKS */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-ultra text-accent font-semibold mb-8">
              Ateliers
            </h4>
            <ul className="space-y-4 text-xs opacity-70">
              <li className="hover:text-accent transition-colors cursor-pointer">Floral Design</li>
              <li className="hover:text-accent transition-colors cursor-pointer">Gourmet Cakes</li>
              <li className="hover:text-accent transition-colors cursor-pointer">
                Curated Hampers
              </li>
              <li className="hover:text-accent transition-colors cursor-pointer">Personalized</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-ultra text-accent font-semibold mb-8">
              Service
            </h4>
            <ul className="space-y-4 text-xs opacity-70">
              <li className="hover:text-accent transition-colors cursor-pointer">
                Corporate Gifting
              </li>
              <li className="hover:text-accent transition-colors cursor-pointer">
                Wedding Atelier
              </li>
              <li className="hover:text-accent transition-colors cursor-pointer">
                Shipping Policy
              </li>
              <li className="hover:text-accent transition-colors cursor-pointer">Contact Us</li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] uppercase tracking-ultra text-accent font-semibold mb-8">
              Newsletter
            </h4>
            <p className="text-xs opacity-60 mb-6">
              Sign up to receive curated drops and festive gifting guides from our studio.
            </p>
            <form className="relative group">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent border-b border-white/20 py-3 text-xs outline-none focus:border-accent transition-colors placeholder:text-white/30"
              />
              <button className="absolute right-0 bottom-3 text-[10px] uppercase tracking-ultra text-accent hover:italic transition-all">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] uppercase tracking-ultra opacity-40 text-center">
            © {new Date().getFullYear()} Shika Arts — All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-[9px] uppercase tracking-ultra opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
              Privacy
            </span>
            <span className="text-[9px] uppercase tracking-ultra opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
