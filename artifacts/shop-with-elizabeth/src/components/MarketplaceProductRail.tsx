import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Flame, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@workspace/api-client-react";
import { ProductImage } from "@/components/ProductImage";

interface MarketplaceProductRailProps {
  products: Product[];
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getRemaining(target: number) {
  const distance = Math.max(target - Date.now(), 0);
  return {
    hours: Math.floor(distance / (1000 * 60 * 60)),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export function MarketplaceProductRail({ products }: MarketplaceProductRailProps) {
  const saleEndsAt = useMemo(() => {
    const end = new Date();
    end.setHours(end.getHours() + 8, 0, 0, 0);
    return end.getTime();
  }, []);
  const [remaining, setRemaining] = useState(() => getRemaining(saleEndsAt));

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining(saleEndsAt)), 1000);
    return () => window.clearInterval(timer);
  }, [saleEndsAt]);

  if (products.length === 0) return null;

  return (
    <section className="overflow-hidden bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-accent text-accent-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70">Mkenya deals</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.04em]">Flash finds</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono-ui text-xs font-bold">
            <Clock3 className="h-4 w-4 text-accent" />
            <span className="text-primary-foreground/70">Ends in</span>
            <span className="bg-foreground px-2 py-1 text-background">{pad(remaining.hours)}</span>
            <span>:</span>
            <span className="bg-foreground px-2 py-1 text-background">{pad(remaining.minutes)}</span>
            <span>:</span>
            <span className="bg-foreground px-2 py-1 text-background">{pad(remaining.seconds)}</span>
          </div>
        </div>

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.slice(0, 8).map((product, index) => (
            <Link
              key={product.id}
              href={`/explore?category=${encodeURIComponent(product.category)}`}
              className="group min-w-[172px] snap-start overflow-hidden border border-primary-foreground/15 bg-background text-foreground shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:min-w-[205px]"
              data-testid={`link-flash-product-${product.id}`}
            >
              <div className="relative aspect-square overflow-hidden bg-white">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  category={product.category}
                  fit="contain"
                  objectPosition={index % 2 === 0 ? "center 35%" : "center"}
                />
                <span className="absolute left-2 top-2 bg-accent px-2 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-[0.14em] text-accent-foreground">
                  {index < 3 ? "Hot now" : "Local pick"}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{product.category}</p>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-snug">{product.name}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-mono-ui text-sm font-black text-primary">KES {product.price.toLocaleString()}</span>
                  <ShoppingBag className="h-4 w-4 text-secondary transition-transform group-hover:scale-110" />
                </div>
              </div>
            </Link>
          ))}
          <Link
            href="/explore"
            className="grid min-w-[150px] snap-start place-items-center border border-dashed border-primary-foreground/35 p-5 text-center transition-colors hover:bg-primary-foreground/10 sm:min-w-[175px]"
            data-testid="link-flash-see-all"
          >
            <span>
              <ArrowRight className="mx-auto mb-3 h-6 w-6 text-accent" />
              <span className="text-sm font-bold">See all local finds</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}