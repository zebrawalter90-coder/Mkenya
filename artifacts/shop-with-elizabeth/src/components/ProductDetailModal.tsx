import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, MessageCircle, Send, ShoppingCart, Check, Share2, Zap, ChevronDown, ChevronLeft, ChevronRight, Images } from "lucide-react";
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
  const [showComments, setShowComments] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const galleryImages = product ? (product.imageUrls?.length ? product.imageUrls : [product.imageUrl]) : [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
  };

  const toggleLike = useToggleLike({ mutation: { onSuccess: invalidate } });
  const addComment = useAddComment({ mutation: { onSuccess: invalidate } });

  useEffect(() => {
    if (!isOpen) return;
    setShowComments(false);
    setSelectedImageIndex(0);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (galleryImages.length < 2) return;
      if (event.key === "ArrowLeft") {
        setSelectedImageIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
      }
      if (event.key === "ArrowRight") {
        setSelectedImageIndex((index) => (index + 1) % galleryImages.length);
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, galleryImages.length]);

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

  const handleBuyNow = () => {
    window.dispatchEvent(
      new CustomEvent("mkenya:buy-now", {
        detail: {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          category: product.category,
        },
      }),
    );
    onClose();
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
              className="pointer-events-auto flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden border border-border bg-background shadow-2xl sm:max-h-[92vh] sm:flex-row"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-name"
              data-testid="product-modal"
            >
              <div className="relative flex h-[58vh] shrink-0 flex-col bg-muted sm:h-[min(84vh,760px)] sm:w-[57%]">
                <div className="relative min-h-0 flex-1">
                  <ProductImage
                    src={galleryImages[selectedImageIndex] ?? product.imageUrl}
                    alt={product.name}
                    category={product.category}
                    className="h-full"
                    priority
                    fit="contain"
                    objectPosition="center"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
                  <span className="absolute bottom-5 left-5 bg-accent px-3 py-1.5 font-mono-ui text-[10px] font-bold uppercase tracking-[0.18em] text-accent-foreground">
                    {product.category}
                  </span>
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length)}
                        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-background/90 text-foreground shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground"
                        aria-label="Previous product photo"
                        data-testid="button-previous-product-photo"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex((index) => (index + 1) % galleryImages.length)}
                        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-background/90 text-foreground shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground"
                        aria-label="Next product photo"
                        data-testid="button-next-product-photo"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-5 right-5 bg-foreground/75 px-3 py-1.5 font-mono-ui text-[10px] font-bold text-background">
                        {selectedImageIndex + 1} / {galleryImages.length}
                      </span>
                    </>
                  )}
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
                {galleryImages.length > 1 && (
                  <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-border bg-background/90 p-3" aria-label="Product photo thumbnails">
                    <Images className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    {galleryImages.map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`h-14 w-14 shrink-0 overflow-hidden border-2 bg-white transition-colors ${selectedImageIndex === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
                        aria-label={`View product photo ${index + 1}`}
                        aria-current={selectedImageIndex === index}
                        data-testid={`button-product-thumbnail-${index + 1}`}
                      >
                        <ProductImage src={imageUrl} alt={`${product.name} photo ${index + 1}`} category={product.category} fit="contain" />
                      </button>
                    ))}
                  </div>
                )}
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
                <Button
                  onClick={handleBuyNow}
                  className="mt-2 h-11 w-fit self-start rounded-full px-5 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                  data-testid="button-buy-now-modal"
                >
                  <Zap className="mr-2 h-4 w-4" /> Buy with M-Pesa
                </Button>

                <div className="mt-7 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={() => setShowComments((open) => !open)}
                    className="flex w-full items-center justify-between text-left"
                    aria-expanded={showComments}
                    aria-controls="product-comments"
                    data-testid="button-toggle-comments-modal"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      Community notes ({product.comments.length})
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showComments ? "rotate-180" : ""}`} />
                  </button>
                  {showComments && (
                    <motion.div
                      id="product-comments"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 overflow-hidden"
                    >
                      {product.comments.length > 0 && (
                        <div className="mb-4 max-h-32 space-y-2 overflow-y-auto pr-1">
                          {product.comments.map((comment) => (
                            <div key={comment.id} className="rounded-sm bg-muted/50 px-3 py-2 text-sm">
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
                    </motion.div>
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