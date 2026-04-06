import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { products, likeProduct, addComment } = useProducts();

  return (
    <Layout>
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <img 
            src="/hero-banner.jpg" 
            alt="African fashion marketplace" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-foreground/20 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-xl"
          >
            Welcome to <span className="text-primary drop-shadow-md">ShopWithElizabeth</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-white/95 font-medium drop-shadow-md max-w-xl mx-auto leading-relaxed"
          >
            Vibrant, authentic, and culturally proud Kenyan fashion. Handpicked for you.
          </motion.p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 flex-1">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Latest Arrivals</h2>
          {products.length > 0 && (
            <Link href="/add-product">
              <Button variant="outline" className="border-border text-foreground hover:border-primary hover:text-primary font-bold rounded-full px-6">
                Add Item
              </Button>
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-3xl border border-dashed border-border shadow-sm">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black mb-3">Karibu! The shop is empty.</h3>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Welcome to ShopWithElizabeth. Be the first to add a beautiful piece to the collection.
            </p>
            <Link href="/add-product">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-8 shadow-md h-14 text-lg">
                Add First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                  onLike={() => likeProduct(product.id)}
                  onComment={(text) => addComment(product.id, text)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </Layout>
  );
}

function ProductCard({ 
  product, 
  index,
  onLike,
  onComment
}: { 
  product: Product; 
  index: number;
  onLike: () => void;
  onComment: (text: string) => void;
}) {
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText.trim());
      setCommentText("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 100, damping: 20 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
    >
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        <img 
          src={product.imageDataUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 z-10">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onLike}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-foreground hover:text-primary transition-colors"
          >
            <Heart className={`w-6 h-6 ${product.likes > 0 ? 'fill-primary text-primary' : ''}`} />
          </motion.button>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight">{product.name}</h3>
          <span className="font-black text-secondary whitespace-nowrap bg-secondary/10 px-3 py-1.5 rounded-lg text-sm">
            KES {product.price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-6 font-medium">
          <Heart className="w-4 h-4 mr-1.5 fill-muted-foreground/30" />
          <span className="mr-4">{product.likes}</span>
          <MessageCircle className="w-4 h-4 mr-1.5" />
          <span>{product.comments.length}</span>
        </div>
        
        <div className="mt-auto pt-5 border-t border-border">
          {product.comments.length > 0 && (
            <div className="space-y-3 mb-5 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
              {product.comments.map((comment, i) => (
                <div key={i} className="text-sm bg-muted/50 p-3 rounded-xl text-foreground">
                  {comment}
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleCommentSubmit} className="flex gap-2 relative">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a comment..."
              className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary text-sm rounded-full pl-4 pr-16"
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1 bottom-1 h-9 rounded-full bg-primary hover:bg-primary/90 text-white font-bold" disabled={!commentText.trim()}>
              Post
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}