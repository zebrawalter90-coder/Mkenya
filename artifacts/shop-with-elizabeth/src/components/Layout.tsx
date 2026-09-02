import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Home, Compass, MessageCircle, PlusCircle, User, Phone, CreditCard, ShoppingCart } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";

const CONTACT = "+254743035900";
const CONTACT_DISPLAY = "+254 743 035 900";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { cartCount } = useCart();
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/payment", label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans selection:bg-primary selection:text-white">

      {/* ── Main header ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 group">
            <span className="text-primary group-hover:text-secondary transition-colors">Mkenya Shop</span>
            <span>🇰🇪</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  location === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user.name && (
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <User className="w-4 h-4" />
                {user.name}
              </span>
            )}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 text-sm font-bold bg-secondary text-white hover:bg-secondary/90 px-4 py-2 rounded-full transition-colors shadow-sm"
              data-testid="button-open-cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href="/add-product"
              className="flex items-center gap-1.5 text-sm font-bold bg-foreground text-background hover:bg-primary px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Link>
          </div>
        </div>

      </header>

      <motion.main
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex-1 flex flex-col pb-16 md:pb-0"
      >
        {children}
      </motion.main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold transition-colors ${
              location === href ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
        <Link
          href="/add-product"
          className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold transition-colors ${
            location === "/add-product" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          Add
        </Link>
      </nav>

      {/* ── Footer ── */}
      <footer className="bg-foreground text-background py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

            {/* Brand */}
            <div>
              <p className="text-xl font-black mb-2">Mkenya Shop 🇰🇪</p>
              <p className="text-background/60 text-sm leading-relaxed">
                Your trusted Kenyan fashion marketplace. Authentic African style delivered to your door.
              </p>
            </div>

            {/* Payment info */}
            <div>
              <p className="font-black text-sm uppercase tracking-widest text-background/50 mb-3">Payment</p>
              <div className="flex items-start gap-3 bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                <CreditCard className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-white mb-0.5">M-Pesa Till / Mpesa</p>
                  <a
                    href={`tel:${CONTACT}`}
                    className="text-green-300 font-black text-xl hover:text-green-200 transition-colors"
                  >
                    {CONTACT_DISPLAY}
                  </a>
                  <p className="text-background/50 text-xs mt-1">Send payment then WhatsApp us your order</p>
                </div>
              </div>
            </div>

            {/* Contact & info */}
            <div>
              <p className="font-black text-sm uppercase tracking-widest text-background/50 mb-3">Contact & Info</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a href={`tel:${CONTACT}`} className="hover:text-primary transition-colors font-semibold">
                    {CONTACT_DISPLAY}
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-400 shrink-0 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <a
                    href={`https://wa.me/254743035900`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-400 transition-colors font-semibold"
                  >
                    WhatsApp Us
                  </a>
                </li>
                <li className="text-sm text-background/50">Orders · Inquiries · Returns</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/10 pt-6 text-center text-sm text-background/40">
            © 2026 Mkenya Shop. All rights reserved.
          </div>
        </div>
      </footer>

      <motion.a
        href="https://wa.me/254743035900?text=Hi%20Mkenya%20Shop%2C%20I%27d%20like%20some%20help%20shopping."
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ y: { repeat: Infinity, duration: 3.2, ease: "easeInOut" } }}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-xl shadow-[#25D366]/25 ring-4 ring-white/70"
        aria-label="Chat with Mkenya Shop on WhatsApp"
        data-testid="button-whatsapp-concierge"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Need help?</span>
        <span className="sm:hidden">WhatsApp</span>
      </motion.a>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => setIsCheckoutOpen(true)} 
      />
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}
