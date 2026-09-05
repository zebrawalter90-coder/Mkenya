import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, MessageCircle, Send, ShoppingCart, Check, Share2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProductsQueryKey, useAddComment, useToggleLike } from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { ProductImage } from "@/components/ProductImage";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  readOnly?: boolean;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  readOnly = false,
}: ProductDetailModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
  };

  const toggleLike = useToggleLike({ mutation: { onSuccess: invalidate } });
  const addComment = useAddComment({ mutation: { onSuccess: invalidate } });

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
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

  const handleCommentSubmit = (event: FormEvent) => {
    event.preventDefault();
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
    window.setTimeout(() => setShowAddedFeedback(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `${product.name} · KES ${product.price.toLocaleString()} on Mkenya Shop`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: shareText, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} — ${window.location.href}`);
        toast({ title: "Product link copied", description: "Share this find with someone who gets your style." });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast({ title: "Sharing is unavailable", description: "Try copying the page link from your browser." });
    }
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
            className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm"
            data-testid="modal-backdrop"
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 28 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden border border-border bg-background shadow-2xl sm:max-h-[90vh] sm:flex-row"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-name"
              data-testid="product-modal"
            >
              <div className="relative h-[42vh] shrink-0 bg-muted sm:h-auto sm:w-[48%]">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  category={product.category}
                  className="h-full"
                  priority
                  objectPosition="center 32%"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 bg-accent px-3 py-1.5 font-mono-ui text-[10px] font-bold uppercase tracking-[0.18em] text-accent-foreground">
                  {product.category}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center bg-background/90 text-foreground shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground"
                  data-testid="button-close-modal"
                  aria-label="Close product details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">A local find</p>
                    <h2 id="product-modal-name" className="mt-2 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl" data-testid="text-product-name">
                      {product.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="grid h-10 w-10 shrink-0 place-items-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
                    data-testid="button-share-modal"
                    aria-label={`Share ${product.name}`}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="font-mono-ui text-lg font-bold text-secondary" data-testid="text-product-price">
                  KES {product.price.toLocaleString()}
                </p>
                {product.description && (
                  <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground" data-testid="text-product-description">
                    {product.description}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-5 border-y border-border py-4 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className={`h-4 w-4 ${hasLiked ? "fill-primary text-primary" : ""}`} />
                    {product.likesCount} likes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    {product.comments.length} comments
                  </span>
                  <span className="ml-auto truncate text-xs text-muted-foreground/70">by {product.ownerName}</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleLike}
                    disabled={readOnly || !user.id || toggleLike.isPending}
                    variant={hasLiked ? "default" : "outline"}
                    className={`h-12 rounded-none font-bold ${hasLiked ? "bg-primary text-primary-foreground" : ""}`}
                    data-testid="button-like-modal"
                  >
                    <Heart className={`mr-2 h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                    {hasLiked ? "Liked" : "Like"}
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    className="h-12 rounded-none bg-secondary font-bold text-secondary-foreground hover:bg-secondary/90"
                    data-testid="button-add-to-cart-modal"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showAddedFeedback ? (
                        <motion.span key="added" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                          <Check className="h-4 w-4" /> Added
                        </motion.span>
                      ) : (
                        <motion.span key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" /> Add to cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>

                <div className="mt-7 border-t border-border pt-5">
                  <h3 className="mb-3 text-sm font-bold text-foreground">Community notes ({product.comments.length})</h3>
                  {product.comments.length > 0 && (
                    <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
                      {product.comments.map((comment) => (
                        <div key={comment.id} className="bg-muted/50 px-3 py-2 text-sm">
                          <span className="mr-1.5 text-xs font-semibold">{comment.username}:</span>
                          <span className="text-foreground/80">{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!readOnly && (
                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                      <Input
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        placeholder="Ask or share a thought…"
                        className="h-10 rounded-none bg-muted/40 text-sm"
                        data-testid="input-comment-modal"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-none bg-primary text-primary-foreground"
                        disabled={!commentText.trim() || addComment.isPending}
                        data-testid="button-comment-modal"
                        aria-label="Post comment"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}