import { useState, type FormEvent, type MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Trash2,
  Pencil,
  Send,
  Bookmark,
  ShoppingCart,
  Zap,
  Check,
  Share2,
  ChevronDown,
  Images,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetProductsQueryKey,
  useAddComment,
  useDeleteProduct,
  useToggleLike,
  useUpdateProduct,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ProductImage } from "@/components/ProductImage";

interface ProductCardProps {
  product: Product;
  index: number;
  readOnly?: boolean;
}

export function ProductCard({ product, index, readOnly = false }: ProductCardProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editPrice, setEditPrice] = useState(String(product.price));
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
  };

  const toggleLike = useToggleLike({ mutation: { onSuccess: invalidate } });
  const addComment = useAddComment({ mutation: { onSuccess: invalidate } });
  const updateProduct = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        setIsEditing(false);
      },
    },
  });
  const deleteProduct = useDeleteProduct({ mutation: { onSuccess: invalidate } });

  const isOwner = !readOnly && Boolean(user.id) && product.ownerId === user.id;
  const hasLiked = product.userLiked;
  const imageCount = product.imageUrls?.length ?? 1;
  const visibleComments = showAllComments ? product.comments : product.comments.slice(-3);

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

  const handleEditSave = (event: FormEvent) => {
    event.preventDefault();
    if (!editName.trim() || !editPrice || !user.id) return;
    updateProduct.mutate({
      id: product.id,
      data: { userId: user.id, name: editName.trim(), price: Number(editPrice) },
    });
  };

  const handleDelete = () => {
    if (!user.id || !window.confirm("Delete this product?")) return;
    deleteProduct.mutate({ id: product.id, params: { userId: user.id } });
  };

  const handleAddToCart = () => {
    addToCart(product);
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
  };

  const handleWishlistToggle = (event: MouseEvent) => {
    event.stopPropagation();
    toggleWishlist(product);
  };

  const handleShare = async (event: MouseEvent) => {
    event.stopPropagation();
    const shareText = `${product.name} · KES ${product.price.toLocaleString()} on Mkenya Shop`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: shareText, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} — ${window.location.href}`);
        toast({ title: "Product link copied", description: "Share it with a friend or in the community." });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast({ title: "Sharing is unavailable", description: "Try copying the page link from your browser." });
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ delay: Math.min(index * 0.045, 0.24), duration: 0.45, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-[1.35rem] border border-border/75 bg-card shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-editorial"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-[1.35rem] bg-muted/45">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          category={product.category}
          priority={index < 2}
          objectPosition={index % 3 === 1 ? "center 28%" : "center 38%"}
          fit="contain"
          className="transition-transform duration-700 group-hover:scale-[1.065]"
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label={`View ${product.name} photos and details`}
          data-testid={`button-open-product-image-${product.id}`}
          className="absolute inset-0 z-[1] cursor-zoom-in"
        >
          <span className="sr-only">Open product photos</span>
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/10 to-transparent" />
        {imageCount > 1 && (
          <span className="pointer-events-none absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-foreground/80 px-2.5 py-1.5 font-mono-ui text-[10px] font-bold text-background backdrop-blur-sm">
            <Images className="h-3.5 w-3.5" /> {imageCount} photos
          </span>
        )}

        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2">
          <span className="bg-accent px-2.5 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-[0.15em] text-accent-foreground">
            {index < 2 ? "Fresh drop" : product.category}
          </span>
          {isOwner && (
            <span className="bg-background/85 px-2.5 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-[0.15em] text-foreground backdrop-blur-sm">
              Your listing
            </span>
          )}
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.07 }}
            onClick={handleWishlistToggle}
            data-testid={`button-wishlist-${product.id}`}
            aria-label={`${isWishlisted(product.id) ? "Remove" : "Save"} ${product.name} ${isWishlisted(product.id) ? "from wishlist" : "to wishlist"}`}
            className={`grid h-10 w-10 place-items-center shadow-lg transition-colors backdrop-blur-sm ${
              isWishlisted(product.id)
                ? "rounded-full bg-secondary text-secondary-foreground"
                : "rounded-full bg-background/85 text-foreground hover:bg-accent"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.07 }}
            onClick={(event) => {
              event.stopPropagation();
              handleLike();
            }}
            disabled={readOnly || !user.id || toggleLike.isPending}
            data-testid={`button-like-${product.id}`}
            aria-label={`${hasLiked ? "Unlike" : "Like"} ${product.name}`}
            className={`grid h-10 w-10 place-items-center shadow-lg transition-colors backdrop-blur-sm ${
              hasLiked ? "bg-primary text-primary-foreground" : "bg-background/85 text-foreground hover:bg-primary/10"
            } ${readOnly ? "cursor-default opacity-60" : ""}`}
          >
            <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.07 }}
            onClick={handleShare}
            data-testid={`button-share-${product.id}`}
            aria-label={`Share ${product.name}`}
              className="grid h-10 w-10 place-items-center rounded-full bg-background/85 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>
        </div>

        {isOwner && (
          <div className="absolute bottom-4 left-4 z-10 flex gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${product.name}`}
              className="grid h-8 w-8 place-items-center bg-background/90 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              aria-label={`Delete ${product.name}`}
              className="grid h-8 w-8 place-items-center bg-background/90 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {isEditing ? (
          <form onSubmit={handleEditSave} className="mb-4 space-y-3">
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Product name" className="h-10 text-sm" />
            <div className="flex gap-2">
              <Input type="number" value={editPrice} onChange={(event) => setEditPrice(event.target.value)} placeholder="Price" className="h-10 flex-1 text-sm" />
              <Button type="submit" size="sm" disabled={updateProduct.isPending} className="h-10 bg-secondary text-secondary-foreground">
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-10" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-2 flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-left font-display text-xl font-bold leading-snug text-foreground transition-colors hover:text-primary"
                data-testid={`button-open-product-${product.id}`}
              >
                {product.name}
              </button>
              <span className="shrink-0 bg-secondary/10 px-2.5 py-1 font-mono-ui text-xs font-bold text-secondary">
                KES {product.price.toLocaleString()}
              </span>
            </div>
            {product.description && <p className="mb-3 line-clamp-1 text-sm text-muted-foreground">{product.description}</p>}
          </>
        )}

        <div className="mb-4 flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className={`h-4 w-4 ${hasLiked ? "fill-primary text-primary" : ""}`} />
            {product.likesCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {product.comments.length}
          </span>
          <span className="ml-auto truncate text-xs text-muted-foreground/70">by {product.ownerName}</span>
        </div>

        <Button
          onClick={(event) => {
            event.stopPropagation();
            handleAddToCart();
          }}
          className="relative mb-4 h-11 w-full overflow-hidden rounded-full bg-secondary font-bold text-secondary-foreground hover:bg-secondary/90"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {showAddedFeedback ? (
            <motion.span initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Added to cart
            </motion.span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            handleBuyNow();
          }}
          className="mb-4 h-10 w-full rounded-full border-primary font-bold text-primary hover:bg-primary hover:text-primary-foreground"
          data-testid={`button-buy-now-${product.id}`}
        >
          <Zap className="mr-2 h-4 w-4" /> Buy now with M-Pesa
        </Button>

        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowComments((open) => !open);
            }}
            className="flex w-full items-center justify-between rounded-sm py-1 text-left text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={showComments}
            aria-controls={`comments-${product.id}`}
            data-testid={`button-toggle-comments-${product.id}`}
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {product.comments.length ? `${product.comments.length} comment${product.comments.length === 1 ? "" : "s"}` : "Join the conversation"}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showComments ? "rotate-180" : ""}`} />
          </button>

          {showComments && (
            <motion.div
              id={`comments-${product.id}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 overflow-hidden"
            >
              {product.comments.length > 0 && (
                <div className="mb-3 max-h-32 space-y-2 overflow-y-auto pr-1">
                  {product.comments.length > 3 && !showAllComments && (
                    <button type="button" onClick={() => setShowAllComments(true)} className="text-xs font-semibold text-primary hover:underline">
                      View all {product.comments.length} comments
                    </button>
                  )}
                  {visibleComments.map((comment) => (
                    <motion.div key={comment.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-sm bg-muted/50 px-3 py-2 text-sm">
                      <span className="mr-1.5 text-xs font-semibold text-foreground">{comment.username}:</span>
                      <span className="text-foreground/80">{comment.text}</span>
                    </motion.div>
                  ))}
                </div>
              )}
              {!readOnly && (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Leave a comment…"
                    className="h-10 rounded-xl border-none bg-muted/50 pl-4 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                    data-testid={`input-comment-${product.id}`}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!commentText.trim() || addComment.isPending}
                    data-testid={`button-comment-${product.id}`}
                    aria-label={`Comment on ${product.name}`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
        readOnly={readOnly}
      />
    </motion.article>
  );
}