import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Upload, Plus, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { addProduct } = useProducts();
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imagePreview) return;

    addProduct({
      name,
      price: Number(price),
      imageDataUrl: imagePreview,
    });
    
    setLocation("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-foreground mb-3">Add New Product</h1>
          <p className="text-lg text-muted-foreground">List a new beautiful fashion item in your store.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-3">
              <Label htmlFor="image" className="text-lg font-bold">Product Image</Label>
              <div 
                className={`border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200 ${
                  imagePreview ? 'border-primary/50 bg-muted/10' : 'border-border bg-muted/30 hover:border-primary hover:bg-muted/50'
                }`}
              >
                {imagePreview ? (
                  <div className="relative aspect-[4/5] md:aspect-video bg-muted/30 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain p-4" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-foreground/80 hover:bg-destructive text-background rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-background shadow-sm rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <span className="font-black text-xl mb-2 text-foreground">Click to upload image</span>
                    <span className="text-base text-muted-foreground">High quality JPG, PNG, WEBP (Max 5MB)</span>
                  </label>
                )}
                <input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg font-bold">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Handmade Maasai Shuka Wrap"
                className="h-14 text-lg bg-muted/30 border-border rounded-xl px-4"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-lg font-bold">Price (KES)</Label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">KES</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500"
                  className="h-14 text-lg pl-16 bg-muted/30 border-border rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
                disabled={!name || !price || !imagePreview}
              >
                <Plus className="w-6 h-6 mr-2" />
                List Product
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}