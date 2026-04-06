import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Upload, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { useCreateProduct } from "@workspace/api-client-react";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProductsQueryKey } from "@workspace/api-client-react";

type Category = "Clothing" | "Accessories" | "Fabric" | "Footwear" | "Jewelry" | "Beauty" | "Other";
const CATEGORIES: Category[] = ["Clothing", "Accessories", "Fabric", "Footwear", "Jewelry", "Beauty", "Other"];

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("Clothing");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageFile || !user.id) return;
    setUploading(true);

    try {
      const urlRes = await fetch(`${BASE_URL}/api/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: imageFile.name,
          size: imageFile.size,
          contentType: imageFile.type,
        }),
      });

      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json() as { uploadURL: string; objectPath: string };

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image");

      await createProduct.mutateAsync({
        data: {
          name: name.trim(),
          price: Number(price),
          imageObjectPath: objectPath,
          category,
          ownerId: user.id,
          ownerName: user.name,
        },
      });

      queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
      setLocation("/");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = name.trim() && price && imageFile && user.id && !uploading && !createProduct.isPending;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-black text-foreground mb-2">Add New Product</h1>
          <p className="text-muted-foreground text-lg">List a beautiful fashion item in the shop</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-3">
              <Label className="text-base font-bold">Product Image</Label>
              <div
                className={`border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200 ${
                  imagePreview ? "border-primary/50" : "border-border hover:border-primary"
                }`}
              >
                {imagePreview ? (
                  <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain p-4" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-foreground/80 hover:bg-destructive text-background rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 bg-background shadow rounded-full flex items-center justify-center mb-5">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <span className="font-black text-lg mb-1 text-foreground">Click to upload your photo</span>
                    <span className="text-sm text-muted-foreground">JPG, PNG or WEBP (max 5MB)</span>
                  </label>
                )}
                <input ref={fileInputRef} id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-bold">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Handmade Maasai Shuka Wrap"
                className="h-12 text-base bg-muted/30 border-border rounded-xl px-4"
                required
                data-testid="input-product-name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-bold">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      category === cat
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-base font-bold">Price (KES)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">KES</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500"
                  className="h-12 text-base pl-14 bg-muted/30 border-border rounded-xl"
                  required
                  data-testid="input-product-price"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              disabled={!canSubmit}
              data-testid="button-list-product"
            >
              {uploading || createProduct.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  List Product
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
