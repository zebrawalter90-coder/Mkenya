import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Trash2, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import type { Product } from "@/hooks/useProducts";

interface ProductCardProps {
  product: Product;
  index: number;
  onLike: () => void;
  onComment: (text: string) => void;
  onDelete?: () => void;
  onEdit?: (name: string, price: number) => void;
}

export function ProductCard({ product, index, onLike, onComment, onDelete, onEdit }: ProductCardProps) {
  const { user } = useUser();
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editPrice, setEditPrice] = useState(String(product.price));

  const isOwner = user.id && product.ownerId === user.id;
  const hasLiked = user.id ? product.likedBy.includes(user.id) : false;
  const visibleComments = showAllComments ? product.comments : product.comments.slice(-3);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(commentText.trim());
    setCommentText("");
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPrice) return;
    onEdit?.(editName.trim(), Number(editPrice));
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 90, damping: 18 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group"
      data-testid={`card-product-${product.id}`}
    >
      {/* Bubbling image container */}
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -10, 0], scale: [1, 1.015, 1] }}
          transition={{
            repeat: Infinity,
            duration: 3.5 + (index % 4) * 0.6,
            ease: "easeInOut",
            delay: (index % 5) * 0.4,
          }}
        >
          <img
            src={product.imageDataUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Like button */}
        <div className="absolute top-3 right-3 z-10">
          <motion.button
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 1.1 }}
            onClick={onLike}
            data-testid={`button-like-${product.id}`}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors backdrop-blur-sm ${
              hasLiked
                ? "bg-primary text-white"
                : "bg-white/85 text-foreground hover:bg-primary/10"
            }`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? "fill-white" : ""}`} />
          </motion.button>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04 + 0.15 }}
            className="text-xs font-bold bg-black/60 text-white backdrop-blur-sm px-3 py-1 rounded-full"
          >
            {product.category}
          </motion.span>
        </div>

        {/* Owner controls */}
        {isOwner && (
          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            <button
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow text-foreground hover:bg-secondary hover:text-white transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm("Delete this product?")) onDelete?.();
              }}
              className="w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow text-foreground hover:bg-destructive hover:text-white transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col">
        {isEditing ? (
          <form onSubmit={handleEditSave} className="space-y-3 mb-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Product name"
              className="h-10 text-sm rounded-lg"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Price"
                className="h-10 text-sm rounded-lg flex-1"
              />
              <Button type="submit" size="sm" className="h-10 bg-secondary text-white rounded-lg">
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-10 rounded-lg" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-start mb-3 gap-3">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 + 0.1 }}
              className="text-lg font-bold text-foreground line-clamp-2 leading-snug"
            >
              {product.name}
            </motion.h3>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 + 0.18, type: "spring" }}
              className="font-black text-secondary whitespace-nowrap bg-secondary/10 px-3 py-1 rounded-lg text-sm shrink-0"
            >
              KES {product.price.toLocaleString()}
            </motion.span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 font-medium">
          <span className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${hasLiked ? "fill-primary text-primary" : ""}`} />
            {product.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {product.comments.length}
          </span>
          <span className="text-xs text-muted-foreground/70 ml-auto">by {product.ownerName}</span>
        </div>

        {/* Comments section */}
        <div className="mt-auto pt-4 border-t border-border">
          {product.comments.length > 0 && (
            <div className="space-y-2 mb-3">
              {product.comments.length > 3 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  View all {product.comments.length} comments
                </button>
              )}
              {visibleComments.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm bg-muted/50 px-3 py-2 rounded-xl"
                >
                  <span className="font-semibold text-foreground text-xs mr-1.5">{c.username}:</span>
                  <span className="text-foreground/80">{c.text}</span>
                </motion.div>
              ))}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={user.name ? "Leave a comment…" : "Set a name to comment"}
              disabled={!user.name}
              className="h-10 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-sm rounded-full pl-4"
              data-testid={`input-comment-${product.id}`}
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white shrink-0"
              disabled={!commentText.trim() || !user.name}
              data-testid={`button-comment-${product.id}`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
