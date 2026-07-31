import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Send, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { useToggleLike, useAddComment, getGetProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Product } from "@workspace/api-client-react";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  readOnly?: boolean;
}

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart, readOnly = false }: ProductDetailModalProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
  };

  const toggleLike = useToggleLike({ mutation: { onSuccess: invalidate } });
  const addComment = useAddComment({ mutation: { onSuccess: invalidate } });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const hasLiked = product.userLiked;

  const handleLike = () => {
    if (readOnly || !user.id) return;
    toggleLike.mutate({ id: product.id, data: { userId: user.id } });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user.id || readOnly) return;
    addComment.mutate({
      id: product.id,
      data: { userId: user.id, username: user.name, text: commentText.trim() },
    });
    setCommentText("");
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            data-testid="modal-backdrop"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              data-testid="product-modal"
            >
              <div className="relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-foreground/80 hover:bg-foreground text-background flex items-center justify-center transition-colors shadow-lg"
                  data-testid="button-close-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-bold bg-muted text-foreground px-3 py-1 rounded-full mb-3">
                        {product.category}
                      </span>
                      <h2 className="text-3xl font-black text-foreground mb-2" data-testid="text-product-name">
                        {product.name}
                      </h2>
                      <p className="text-2xl font-black text-secondary" data-testid="text-product-price">
                        KES {product.price.toLocaleString()}
                      </p>
                    </div>

                    {product.description && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-product-description">
                          {product.description}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 font-medium">
                      <span className="flex items-center gap-1">
                        <Heart className={`w-4 h-4 ${hasLiked ? "fill-primary text-primary" : ""}`} />
                        {product.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {product.comments.length}
                      </span>
                      <span className="text-xs text-muted-foreground/70 ml-auto">by {product.ownerName}</span>
                    </div>

                    <div className="flex gap-2 mb-6">
                      <Button
                        onClick={handleLike}
                        disabled={readOnly || !user.id || toggleLike.isPending}
                        variant={hasLiked ? "default" : "outline"}
                        className={`flex-1 h-12 rounded-xl font-bold ${
                          hasLiked ? "bg-primary text-white" : ""
                        }`}
                        data-testid="button-like-modal"
                      >
                        <Heart className={`w-4 h-4 mr-2 ${hasLiked ? "fill-white" : ""}`} />
                        {hasLiked ? "Liked" : "Like"}
                      </Button>
                      <Button
                        onClick={handleAddToCart}
                        className="flex-1 h-12 rounded-xl font-bold bg-secondary hover:bg-secondary/90 text-white relative overflow-hidden"
                        data-testid="button-add-to-cart-modal"
                      >
                        <AnimatePresence mode="wait">
                          {showAddedFeedback ? (
                            <motion.span
                              key="added"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Added!
                            </motion.span>
                          ) : (
                            <motion.span
                              key="add"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -20, opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="font-bold text-foreground mb-3 text-sm">
                        Comments ({product.comments.length})
                      </h3>
                      {product.comments.length > 0 && (
                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                          {product.comments.map((c) => (
                            <div
                              key={c.id}
                              className="text-sm bg-muted/50 px-3 py-2 rounded-xl"
                            >
                              <span className="font-semibold text-foreground text-xs mr-1.5">{c.username}:</span>
                              <span className="text-foreground/80">{c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!readOnly && (
                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                          <Input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Leave a comment…"
                            className="h-10 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-sm rounded-full pl-4"
                            data-testid="input-comment-modal"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white shrink-0"
                            disabled={!commentText.trim() || addComment.isPending}
                            data-testid="button-comment-modal"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
