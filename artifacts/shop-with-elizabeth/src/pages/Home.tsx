import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useUser } from "@/hooks/useUser";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { UserSetup } from "@/components/UserSetup";
import { Button } from "@/components/ui/button";

const heroWords = ["Your", "Trusted", "Kenyan", "Fashion", "Marketplace"];

export default function Home() {
  const { products, toggleLike, addComment, deleteProduct, editProduct } = useProducts();
  const { user } = useUser();

  return (
    <Layout>
      <UserSetup />

      {/* Hero */}
      <section className="relative w-full min-h-[55vh] flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-secondary"
          animate={{ background: ["linear-gradient(135deg,#0a0a0a,#006400)", "linear-gradient(135deg,#006400,#b22222)", "linear-gradient(135deg,#b22222,#0a0a0a)"] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        {/* Floating bubbles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10 bg-white"
            style={{
              width: 60 + i * 30,
              height: 60 + i * 30,
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
            }}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4 + i * 0.8, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-16">
          <div className="mb-4 overflow-hidden">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-primary font-black text-lg tracking-widest uppercase"
            >
              ShopWithElizabeth 🇰🇪
            </motion.span>
          </div>

          {/* Animated word-by-word headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">
            {heroWords.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.15 + i * 0.13, type: "spring", stiffness: 130, damping: 18 }}
                className={`inline-block mr-4 last:mr-0 drop-shadow-xl ${
                  word === "Kenyan" ? "text-primary" : word === "Fashion" ? "text-yellow-300" : "text-white"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-white/80 text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Discover vibrant African fashion — beads, kangas, kitenga, and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, type: "spring" }}
            className="flex gap-3 justify-center flex-wrap"
          >
            <Link href="/explore">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-8 h-14 text-base shadow-lg shadow-primary/30">
                Explore Collection
              </Button>
            </Link>
            <Link href="/add-product">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full font-bold px-8 h-14 text-base">
                List Your Item
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Latest arrivals */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black text-foreground"
          >
            Latest Arrivals
          </motion.h2>
          <Link href="/explore">
            <Button variant="ghost" className="text-primary font-bold hover:text-primary/80">
              See all →
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-3xl border border-dashed border-border">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black mb-2">The shop is empty</h3>
            <p className="text-muted-foreground max-w-sm mb-6">Be the first to list a beautiful fashion item!</p>
            <Link href="/add-product">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-8">
                Add First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product, index) => (
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

        {products.length > 6 && (
          <div className="text-center mt-10">
            <Link href="/explore">
              <Button size="lg" variant="outline" className="rounded-full font-bold px-10 border-border hover:border-primary hover:text-primary">
                View All {products.length} Products
              </Button>
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
}
