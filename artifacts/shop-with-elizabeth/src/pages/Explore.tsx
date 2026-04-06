import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useProducts, type Category } from "@/hooks/useProducts";
import { useUser } from "@/hooks/useUser";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { UserSetup } from "@/components/UserSetup";

const CATEGORIES: (Category | "All")[] = ["All", "Clothing", "Accessories", "Fabric", "Footwear", "Jewelry", "Beauty", "Other"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "mostliked", label: "Most Liked" },
  { value: "priceasc", label: "Price: Low → High" },
  { value: "pricedesc", label: "Price: High → Low" },
];

export default function Explore() {
  const { products, toggleLike, addComment, deleteProduct, editProduct } = useProducts();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "All") result = result.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (sort === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "oldest") result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sort === "mostliked") result.sort((a, b) => b.likes - a.likes);
    else if (sort === "priceasc") result.sort((a, b) => a.price - b.price);
    else if (sort === "pricedesc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, search, activeCategory, sort]);

  return (
    <Layout>
      <UserSetup />

      {/* Header */}
      <div className="bg-gradient-to-br from-secondary/10 to-primary/5 border-b border-border py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-foreground mb-2"
          >
            Explore
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-muted-foreground mb-6"
          >
            Browse all {products.length} items in the collection
          </motion.p>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category…"
              className="h-12 pl-12 text-base rounded-2xl bg-background border-border"
              data-testid="input-search"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                data-testid={`filter-${cat}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary shadow"
                    : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground font-medium">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm font-semibold bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-black text-foreground mb-2">No results found</p>
            <p className="text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onLike={() => toggleLike(product.id, user.id)}
                onComment={(text) => addComment(product.id, user.id, user.name || "Anonymous", text)}
                onDelete={() => deleteProduct(product.id, user.id)}
                onEdit={(name, price) => editProduct(product.id, user.id, name, price)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
