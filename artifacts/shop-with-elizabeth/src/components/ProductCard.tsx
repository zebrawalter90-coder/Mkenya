import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Trash2, Pencil, Send, Bookmark, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import {
  useToggleLike,
  useAddComment,
  useUpdateProduct,
  useDeleteProduct,
  getGetProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Product } from "@workspace/api-client-react";

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
  const [commentText, setCommentText] = useState("");
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
  const updateProduct = useUpdateProduct({ mutation: { onSuccess: () => { invalidate(); setIsEditing(false); } } });
  const deleteProduct = useDeleteProduct({ mutation: { onSuccess: invalidate } });

  const isOwner = !readOnly && user.id && product.ownerId === user.id;
  const hasLiked = product.userLiked;
  const visibleComments = showAllComments ? product.comments : product.comments.slice(-3);

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

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
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
    setTimeout(() => setShowAddedFeedback(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 90, damping: 18 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group"
      data-testid={`card-product-${product.id}`}
    >
      <div 
        className="relative aspect-[4/5] bg-muted overflow-hidden cursor-pointer"
        onClick={handleOpenModal}
      >
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
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistToggle(e);
            }}
            data-testid={`button-wishlist-${product.id}`}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors backdrop-blur-sm ${
              isWishlisted(product.id)
                ? "bg-secondary text-white"
                : "bg-white/85 text-foreground hover:bg-secondary/10"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-white" : ""}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={readOnly || !user.id || toggleLike.isPending}
            data-testid={`button-like-${product.id}`}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors backdrop-blur-sm ${
              hasLiked
                ? "bg-primary text-white"
                : "bg-white/85 text-foreground hover:bg-primary/10"
            } ${readOnly ? "opacity-60 cursor-default" : ""}`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? "fill-white" : ""}`} />
          </motion.button>
        </div>

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
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow text-foreground hover:bg-destructive hover:text-white transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

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
              <Button type="submit" size="sm" disabled={updateProduct.isPending} className="h-10 bg-secondary text-white rounded-lg">
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-10 rounded-lg" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-start mb-2 gap-3">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 + 0.1 }}
                className="text-lg font-bold text-foreground line-clamp-2 leading-snug cursor-pointer hover:text-primary transition-colors"
                onClick={handleOpenModal}
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
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                {product.description}
              </p>
            )}
          </>
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

        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="w-full h-10 rounded-xl font-bold bg-secondary hover:bg-secondary/90 text-white mb-4 relative overflow-hidden"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {showAddedFeedback ? (
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Added!
            </motion.span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </span>
          )}
        </Button>

        <div className="pt-4 border-t border-border">
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

          {!readOnly && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment…"
                className="h-10 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-sm rounded-full pl-4"
                data-testid={`input-comment-${product.id}`}
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white shrink-0"
                disabled={!commentText.trim() || addComment.isPending}
                data-testid={`button-comment-${product.id}`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
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
    </motion.div>
  );
}
