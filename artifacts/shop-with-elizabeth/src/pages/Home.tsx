import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  CircleDot,
  Footprints,
  Gem,
  Layers3,
  MessageCircle,
  Search,
  Shirt,
  Sparkles,
  Truck,
} from "lucide-react";
import { getGetProductsQueryKey, useGetProducts } from "@workspace/api-client-react";
import { useUser } from "@/hooks/useUser";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { SEED_PRODUCTS } from "@/lib/seed";

const categorySpotlight = [
  { label: "Clothing", caption: "Kitenge, dresses and everyday looks", icon: Shirt, tone: "bg-primary text-primary-foreground" },
  { label: "Accessories", caption: "Small details with a big point of view", icon: Gem, tone: "bg-accent text-accent-foreground" },
  { label: "Fabric", caption: "Prints ready for your next chapter", icon: Layers3, tone: "bg-secondary text-secondary-foreground" },
  { label: "Footwear", caption: "Comfortable steps, standout style", icon: Footprints, tone: "bg-foreground text-background" },
];

const trustCues = [
  { icon: BadgeCheck, title: "Local sellers", text: "Meet the creative community behind every piece." },
  { icon: Truck, title: "Simple ordering", text: "Pay with M-Pesa, then confirm your order on WhatsApp." },
  { icon: MessageCircle, title: "Human help", text: "Ask a question before you buy. We are right here." },
];

export default function Home() {
  const { user } = useUser();
  const params = user.id ? { userId: user.id } : undefined;
  const { data: products, isLoading, isError } = useGetProducts(params, {
    query: { enabled: true, queryKey: getGetProductsQueryKey(params) },
  });

  const showSeeds = !isLoading && !isError && (!products || products.length === 0);
  const displayProducts = showSeeds ? SEED_PRODUCTS : products ?? [];
  const leadProduct = displayProducts[0];

  return (
    <Layout>
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-accent/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[-8rem] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 md:grid-cols-[1.02fr_.98fr] md:items-center md:pb-16 md:pt-16 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
            <div className="mb-6 flex items-center gap-3 font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <span className="h-px w-8 bg-primary" />
              The local edit · 2026
            </div>
            <h1 className="max-w-2xl font-display text-[3.6rem] font-extrabold leading-[.92] tracking-[-0.065em] text-foreground sm:text-7xl lg:text-[6.6rem]">
              Dress like
              <span className="block text-primary">you mean it.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              A spirited edit of Kenyan fashion and handmade finds, brought to you by the people making style move.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                data-testid="link-hero-explore"
                className="inline-flex h-12 items-center gap-3 bg-primary px-6 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-1"
              >
                Shop the edit <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/add-product"
                data-testid="link-hero-sell"
                className="inline-flex h-12 items-center gap-3 border border-border bg-card px-6 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Sell your work <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
            <Link
              href="/explore"
              data-testid="link-hero-search"
              className="mt-10 flex max-w-md items-center gap-3 border-b border-foreground/25 pb-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Search className="h-4 w-4" />
              <span>Search the marketplace by name, mood or category</span>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="relative mx-auto w-full max-w-[34rem]"
          >
            <div className="absolute -left-3 top-8 z-10 hidden w-32 bg-accent p-4 sm:block">
              <CircleDot className="mb-5 h-5 w-5 text-accent-foreground" />
              <p className="font-display text-xl font-bold leading-tight text-accent-foreground">Made close to home.</p>
            </div>
            <div className="relative aspect-[.88] overflow-hidden bg-secondary shadow-editorial">
              {leadProduct ? (
                <ProductImage src={leadProduct.imageUrl} alt={leadProduct.name} priority className="opacity-95" />
              ) : (
                <div className="grid h-full place-items-center bg-secondary p-10 text-center text-secondary-foreground">
                  <p className="font-display text-4xl font-bold">Find the piece that feels like you.</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-background">
                <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-background/70">Featured now</p>
                <p className="mt-2 max-w-xs font-display text-3xl font-bold leading-tight">
                  {leadProduct?.name ?? "New local finds are landing"}
                </p>
                {leadProduct && <p className="mt-2 font-mono-ui text-sm text-accent">KES {leadProduct.price.toLocaleString()}</p>}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 hidden w-32 border border-foreground/15 bg-background p-3 shadow-float sm:block">
              <p className="font-mono-ui text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Curated for</p>
              <p className="mt-1 text-sm font-bold">Bold, everyday living</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-border bg-foreground py-3 text-background">
        <div className="flex min-w-max items-center gap-8 px-4 font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] sm:justify-center">
          <span>Kenyan made</span><span className="text-primary">/</span><span>Good things, close to home</span><span className="text-accent">/</span><span>Wear the story</span><span className="text-primary">/</span><span>Shop local, look excellent</span>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" /> Find your lane
            </p>
            <h2 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-foreground">Shop by category</h2>
          </div>
          <Link href="/explore" data-testid="link-category-all" className="hidden items-center gap-2 text-sm font-bold text-primary hover:text-secondary sm:flex">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categorySpotlight.map(({ label, caption, icon: Icon, tone }, index) => (
            <Link key={label} href={`/explore?category=${encodeURIComponent(label)}`} data-testid={`link-category-${label.toLowerCase()}`}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -5 }}
                className="group h-full border border-border bg-card p-4 transition-shadow hover:shadow-float sm:p-5"
              >
                <div className={`mb-10 grid h-11 w-11 place-items-center ${tone}`}>
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{caption}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/45">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Just landed</p>
              <h2 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-foreground">
                {showSeeds ? "A first look" : "Latest from the community"}
              </h2>
            </div>
            <Link href="/explore" data-testid="link-latest-all" className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary">
              See everything <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className="aspect-[4/5] animate-pulse bg-muted" />)}
            </div>
          ) : isError ? (
            <div className="border border-destructive/30 bg-destructive/5 p-8 text-center">
              <p className="font-bold text-foreground">The latest finds are taking a minute.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try Explore again to reconnect to the marketplace.</p>
            </div>
          ) : (
            <>
              {showSeeds && <p className="mb-5 text-sm text-muted-foreground">Preview pieces while local sellers add their next listings.</p>}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayProducts.slice(0, 6).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} readOnly={showSeeds} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {trustCues.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-background p-6 sm:p-8"
            >
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-8 font-display text-2xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-14 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-primary px-6 py-12 text-primary-foreground sm:px-12">
          <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-primary-foreground/15" />
          <div className="relative max-w-2xl">
            <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70">For makers, stylists and collectors</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-none tracking-[-0.04em] sm:text-5xl">Your work deserves a window.</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/80">List the piece you made, find your people, and let the right wardrobe make its way home.</p>
            <Link href="/add-product" data-testid="link-seller-cta" className="mt-7 inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm font-bold text-background transition-transform hover:-translate-y-1">
              List your first item <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}