import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useGetProducts } from "@workspace/api-client-react";
import { useUser } from "@/hooks/useUser";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SEED_PRODUCTS } from "@/lib/seed";

const heroWords = ["Your", "Trusted", "Kenyan", "Fashion", "Marketplace"];

export default function Home() {
  const { user } = useUser();
  const { data: products, isLoading } = useGetProducts(
    user.id ? { userId: user.id } : undefined,
    { query: { enabled: true } }
  );

  const showSeeds = !isLoading && (!products || products.length === 0);
  const displayProducts = showSeeds ? SEED_PRODUCTS : (products ?? []);

  return (
    <Layout>
      <section className="relative w-full min-h-[55vh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-secondary"
          animate={{ background: ["linear-gradient(135deg,#0a0a0a,#006400)", "linear-gradient(135deg,#006400,#b22222)", "linear-gradient(135deg,#b22222,#0a0a0a)"] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
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
              Mkenya Shop 🇰🇪
            </motion.span>
          </div>

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
            Discover vibrant African fashion — beads, kangas, kitenge, and more.
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

      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black text-foreground"
          >
            {showSeeds ? "Featured Items" : "Latest Arrivals"}
          </motion.h2>
          <Link href="/explore">
            <Button variant="ghost" className="text-primary font-bold hover:text-primary/80">
              See all →
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <>
            {showSeeds && (
              <div className="mb-6 p-4 bg-muted/40 rounded-2xl text-center text-sm text-muted-foreground">
                Upload your first product to replace these samples with your real listings
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.slice(0, 6).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  readOnly={showSeeds}
                />
              ))}
            </div>
          </>
        )}

        {!showSeeds && displayProducts.length > 6 && (
          <div className="text-center mt-10">
            <Link href="/explore">
              <Button size="lg" variant="outline" className="rounded-full font-bold px-10 border-border hover:border-primary hover:text-primary">
                View All {displayProducts.length} Products
              </Button>
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
}
