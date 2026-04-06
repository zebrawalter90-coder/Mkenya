import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 group">
            <span className="text-primary group-hover:text-secondary transition-colors">ShopWithElizabeth</span> 🇰🇪
          </Link>
          <nav>
            <Link href="/add-product" className="text-sm font-medium bg-foreground text-background hover:bg-primary hover:text-white px-4 py-2 rounded-full transition-colors shadow-sm">
              Add Product
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
            ShopWithElizabeth 🇰🇪
          </p>
          <p className="text-background/80 mb-2 font-medium">Contact: 0715743098</p>
          <p className="text-sm text-background/50">© 2026 ShopWithElizabeth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}