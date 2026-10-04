import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useLocation } from "wouter";
import { getGetProductsQueryKey, useGetProducts } from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { useUser } from "@/hooks/useUser";
import { useWishlist } from "@/hooks/useWishlist";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { SEED_PRODUCTS } from "@/lib/seed";
import { getFeaturedProductIds } from "@/lib/product-layout";

type Category = "Clothing" | "Accessories" | "Fabric" | "Footwear" | "Jewelry" | "Beauty" | "Other";

const CATEGORIES: (Category | "All")[] = ["All", "Clothing", "Accessories", "Fabric", "Footwear", "Jewelry", "Beauty", "Other"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "mostliked", label: "Most loved" },
  { value: "priceasc", label: "Price: low to high" },
  { value: "pricedesc", label: "Price: high to low" },
];

export default function Explore() {
  const [location] = useLocation();
  const { user } = useUser();
  const { wishlistItems } = useWishlist();
  const { data: products, isLoading, isError } = useGetProducts(user.id ? { userId: user.id } : undefined, {
    query: { queryKey: getGetProductsQueryKey(user.id ? { userId: user.id } : undefined) },
  });

  const showSeeds = !isLoading && !isError && (!products || products.length === 0);
  const allProducts: Product[] = showSeeds ? SEED_PRODUCTS : products ?? [];
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState("newest");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  useEffect(() => {
    const categoryParam = new URLSearchParams(window.location.search).get("category");
    const nextCategory =
      categoryParam && CATEGORIES.includes(categoryParam as Category | "All")
        ? (categoryParam as Category | "All")
        : "All";
    setActiveCategory(nextCategory);
  }, [location]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (showWishlistOnly) {
      const wishlistIds = new Set(wishlistItems.map((item) => item.id));
      result = result.filter((product) => wishlistIds.has(product.id));
    }
    if (activeCategory !== "All") result = result.filter((product) => product.category === activeCategory);
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          Boolean(product.description?.toLowerCase().includes(query)),
      );
    }
    if (sort === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === "oldest") result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sort === "mostliked") result.sort((a, b) => b.likesCount - a.likesCount);
    if (sort === "priceasc") result.sort((a, b) => a.price - b.price);
    if (sort === "pricedesc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [activeCategory, allProducts, search, showWishlistOnly, sort, wishlistItems]);
  const featuredProductIds = getFeaturedProductIds(filtered);

  const hasFilters = Boolean(search.trim()) || activeCategory !== "All" || sort !== "newest" || showWishlistOnly;
  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSort("newest");
    setShowWishlistOnly(false);
  };

  return (
    <Layout>
      <section className="market-grid relative overflow-hidden border-b border-secondary-foreground/10 bg-secondary text-secondary-foreground">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[36px] border-secondary-foreground/5" />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                <Sparkles className="h-4 w-4" /> The open wardrobe
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-5xl font-extrabold leading-none tracking-[-0.055em] sm:text-7xl"
              >
                Explore.
              </motion.h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-secondary-foreground/70">
                Scroll slowly. Save loudly. Find something made by someone who cares.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWishlistOnly((current) => !current)}
              data-testid="button-wishlist-filter"
              className={`flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition-colors ${
                showWishlistOnly
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-secondary-foreground/25 text-secondary-foreground hover:border-accent hover:text-accent"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${showWishlistOnly ? "fill-current" : ""}`} />
              Saved finds {wishlistItems.length > 0 && `(${wishlistItems.length})`}
            </button>
          </div>
        </div>
      </section>

      <section className="sticky top-[4.5rem] z-30 border-b border-border/80 bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search names, categories or descriptions"
                className="h-12 rounded-xl border-border bg-card/90 pl-11 text-sm shadow-sm"
                data-testid="input-search"
                aria-label="Search products"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  data-testid="button-clear-search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="sort-products" className="sr-only">Sort products</label>
              <select
                id="sort-products"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                data-testid="select-sort-products"
                className="h-12 min-w-44 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                data-testid={`filter-${category}`}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                  activeCategory === category
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {showSeeds ? "Preview collection" : "Marketplace collection"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{filtered.length}</span> {filtered.length === 1 ? "piece" : "pieces"} to browse
              {activeCategory !== "All" && <span> in <span className="font-bold text-primary">{activeCategory}</span></span>}
            </p>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              data-testid="button-clear-filters"
              className="flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <div key={item} className="aspect-square animate-pulse bg-muted" />)}
          </div>
        ) : isError ? (
          <div className="border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
            <p className="font-display text-3xl font-bold">We lost the thread.</p>
            <p className="mt-2 text-sm text-muted-foreground">The marketplace could not load right now. Try refreshing the page.</p>
            <button type="button" onClick={() => window.location.reload()} data-testid="button-retry-products" className="mt-6 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-border bg-card px-6 py-20 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center bg-accent text-accent-foreground"><Search className="h-5 w-5" /></div>
            <p className="mt-5 font-display text-3xl font-bold text-foreground">Nothing in this edit yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Try another search, category or your full saved list.</p>
            <button type="button" onClick={clearFilters} data-testid="button-empty-clear-filters" className="mt-6 border border-primary px-5 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {showSeeds && <p className="mb-5 border-l-2 border-accent pl-3 text-sm text-muted-foreground">These preview pieces will make room for real seller listings as the community grows.</p>}
            <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  readOnly={showSeeds}
                  featured={featuredProductIds.has(product.id)}
                />
              ))}
            </motion.div>
          </>
        )}
      </main>
    </Layout>
  );
}