import { Link, useLocation } from "wouter";
import { Home, Compass, MessageCircle, PlusCircle, User } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/chat", label: "Chat", icon: MessageCircle },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 group">
            <span className="text-primary group-hover:text-secondary transition-colors">ShopWithElizabeth</span>
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

      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
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

      <footer className="hidden md:block bg-foreground text-background py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-bold mb-3">ShopWithElizabeth 🇰🇪</p>
          <p className="text-background/80 mb-1 font-medium">Contact for Orders: 0715743098</p>
          <p className="text-sm text-background/50">© 2026 ShopWithElizabeth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
