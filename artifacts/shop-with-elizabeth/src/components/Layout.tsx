import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Home,
  Compass,
  MessageCircle,
  PlusCircle,
  User,
  Phone,
  CreditCard,
  ShoppingCart,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createBuyNowItem, useCart, type CartItem } from "@/hooks/useCart";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";

const CONTACT = "+254743035900";
const CONTACT_DISPLAY = "+254 743 035 900";

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { cartCount } = useCart();
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickBuyItem, setQuickBuyItem] = useState<CartItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleBuyNow = (event: Event) => {
      const product = (event as CustomEvent<Omit<CartItem, "quantity">>).detail;
      if (!product) return;
      setQuickBuyItem(createBuyNowItem(product));
      setIsCheckoutOpen(true);
      setIsCartOpen(false);
    };

    window.addEventListener("mkenya:buy-now", handleBuyNow);
    return () => window.removeEventListener("mkenya:buy-now", handleBuyNow);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/chat", label: "Community", icon: MessageCircle },
    { href: "/payment", label: "How to pay", icon: CreditCard },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-primary-foreground">
      <div className="hidden bg-secondary px-4 py-2 text-center font-mono-ui text-[10px] uppercase tracking-[0.22em] text-secondary-foreground md:block">
        Local finds, real makers, delivered across Kenya
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow] duration-300 ${
          isScrolled
            ? "border-border/80 bg-background/95 shadow-float backdrop-blur-xl"
            : "border-foreground/10 bg-background/85 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-testid="link-brand-home"
          >
            <span className="grid h-9 w-9 place-items-center bg-primary font-display text-lg font-extrabold text-primary-foreground transition-transform group-hover:-rotate-6">
              M
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.04em] text-foreground sm:text-2xl">
              Mkenya<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.slice(0, 3).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  location === href
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/explore"
              aria-label="Search the marketplace"
              data-testid="link-search-marketplace"
              className="grid h-10 w-10 place-items-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary sm:w-auto sm:gap-2 sm:px-3"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-sm font-semibold sm:inline">Search</span>
            </Link>
            {user.name && (
              <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground xl:flex">
                <User className="h-4 w-4" />
                {user.name}
              </span>
            )}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 items-center gap-2 bg-secondary px-3 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5 sm:px-4"
              data-testid="button-open-cart"
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span
                  className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center bg-primary px-1 text-[10px] font-black text-primary-foreground"
                  data-testid="cart-count"
                >
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href="/add-product"
              data-testid="link-add-product"
              className="hidden items-center gap-2 bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-colors hover:bg-primary hover:text-primary-foreground md:flex"
            >
              <PlusCircle className="h-4 w-4" />
              Sell a find
            </Link>
          </div>
        </div>
      </header>

      <motion.main
        key={location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex flex-1 flex-col pb-20 md:pb-0"
      >
        {children}
      </motion.main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.slice(0, 3).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            data-testid={`link-mobile-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold ${
              location === href ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
        <Link
          href="/add-product"
          data-testid="link-mobile-add-product"
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold ${
            location === "/add-product" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <PlusCircle className="h-5 w-5" />
          Sell
        </Link>
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          data-testid="button-mobile-cart"
          className="relative flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold text-muted-foreground"
        >
          <ShoppingCart className="h-5 w-5" />
          Cart
          {cartCount > 0 && (
            <span className="absolute right-4 top-2 grid h-4 min-w-4 place-items-center bg-primary px-1 text-[9px] text-primary-foreground">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <footer className="mt-auto bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
            <div>
              <p className="font-display text-3xl font-extrabold tracking-[-0.04em]">
                Mkenya<span className="text-primary">.</span>
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-background/60">
                The lively marketplace for Kenyan style, handmade goods, and the people who make them.
              </p>
              <Link
                href="/explore"
                data-testid="link-footer-explore"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-background transition-colors hover:text-accent"
              >
                Start browsing <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-background/45">Payment desk</p>
              <div className="mt-4 border-l-2 border-primary bg-background/5 p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-bold">M-Pesa / Till support</p>
                    <a
                      href={`tel:${CONTACT}`}
                      data-testid="link-footer-phone"
                      className="mt-1 block font-mono-ui text-sm text-accent hover:underline"
                    >
                      {CONTACT_DISPLAY}
                    </a>
                    <p className="mt-2 text-xs text-background/50">Pay, then send your order details on WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-background/45">Need a hand?</p>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href={`tel:${CONTACT}`} data-testid="link-contact-phone" className="hover:text-accent">
                    Call {CONTACT_DISPLAY}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-accent" />
                  <a
                    href="https://wa.me/254743035900"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-contact-whatsapp"
                    className="font-semibold hover:text-accent"
                  >
                    WhatsApp concierge
                  </a>
                </li>
                <li className="text-xs text-background/45">Orders · questions · returns</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-background/10 pt-5 text-xs text-background/40">
            © 2026 Mkenya Shop. Built for local finds.
          </div>
        </div>
      </footer>

      <motion.a
        href="https://wa.me/254743035900?text=Hi%20Mkenya%20Shop%2C%20I%27d%20like%20some%20help%20shopping."
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-xl shadow-[#25D366]/20 ring-4 ring-background/80 md:bottom-6"
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
        quickBuyItem={quickBuyItem}
        onClose={() => {
          setIsCheckoutOpen(false);
          setQuickBuyItem(null);
        }}
      />
    </div>
  );
}