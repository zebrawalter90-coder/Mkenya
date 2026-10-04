import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Upload, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { useCreateProduct, getGetProductsQueryKey } from "@workspace/api-client-react";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

type Category = "Clothing" | "Accessories" | "Fabric" | "Footwear" | "Jewelry" | "Beauty" | "Other";
const CATEGORIES: Category[] = ["Clothing", "Accessories", "Fabric", "Footwear", "Jewelry", "Beauty", "Other"];

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("Clothing");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const MAX_MB = 50;
    const oversizedFile = files.find((file) => file.size > MAX_MB * 1024 * 1024);
    if (oversizedFile) {
      setError(`${oversizedFile.name} is too large (${(oversizedFile.size / 1024 / 1024).toFixed(1)}MB). Please use images under ${MAX_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setError(`${invalidFile.name} is not an image. Please select JPG, PNG, or WEBP files.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    const previews = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error(`Could not preview ${file.name}.`));
            reader.readAsDataURL(file);
          }),
      ),
    );
    setImageFiles(files);
    setImagePreviews(previews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || imageFiles.length === 0 || !user.id) return;

    setUploading(true);
    setError(null);

    try {
      const objectPaths: string[] = [];
      for (const [index, imageFile] of imageFiles.entries()) {
        setUploadProgress(`Uploading photo ${index + 1} of ${imageFiles.length}…`);
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/storage/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const body = await uploadRes.json().catch(() => ({}));
          throw new Error((body as any).error ?? `Upload failed (${uploadRes.status})`);
        }
        const { objectPath } = (await uploadRes.json()) as { objectPath: string };
        objectPaths.push(objectPath);
      }

      await createProduct.mutateAsync({
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          imageObjectPath: objectPaths[0],
          imageObjectPaths: objectPaths,
          category,
          ownerId: user.id,
          ownerName: user.name,
        },
      });

      queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
      setLocation("/");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const canSubmit = name.trim() && price && imageFiles.length > 0 && user.id && !uploading && !createProduct.isPending;

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
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-2xl text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-base font-bold">Product Image</Label>
              <div
                className={`border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200 ${
                  imagePreviews.length ? "border-primary/50" : "border-border hover:border-primary"
                }`}
              >
                {imagePreviews.length ? (
                  <div className="bg-muted/30 p-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={`${preview.slice(0, 24)}-${index}`} className="group relative aspect-square overflow-hidden bg-white">
                          <img src={preview} alt={`Photo ${index + 1} preview`} className="h-full w-full object-contain p-2" />
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setImageFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
                              setImagePreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
                            }}
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-foreground/80 text-background transition-colors hover:bg-destructive"
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label htmlFor="image" className="mt-4 flex cursor-pointer items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
                      <Plus className="h-4 w-4" /> Choose a new photo set
                    </label>
                  </div>
                ) : (
                  <label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 bg-background shadow rounded-full flex items-center justify-center mb-5">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <span className="font-black text-lg mb-1 text-foreground">Click to upload product photos</span>
                    <span className="text-sm text-muted-foreground">Select 6, 8, or more JPG, PNG, or WEBP photos (max 50MB each)</span>
                  </label>
                )}
                <input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {imageFiles.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground">
                  {imageFiles.length} photo{imageFiles.length === 1 ? "" : "s"} selected · the first photo is your cover image
                </p>
              )}
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-bold">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Handmade Maasai Shuka Wrap"
                className="h-12 text-base bg-muted/30 border-border rounded-xl px-4"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-bold">Description (optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item — material, size, condition, etc."
                className="w-full h-24 text-base bg-muted/30 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Category */}
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

            {/* Price */}
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
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              disabled={!canSubmit}
            >
              {uploading || createProduct.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {uploadProgress || "Saving…"}
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
