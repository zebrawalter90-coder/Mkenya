import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
}

const categoryStyles: Record<string, string> = {
  Clothing: "from-primary via-accent to-secondary",
  Accessories: "from-secondary via-accent to-primary",
  Fabric: "from-accent via-primary to-secondary",
  Footwear: "from-foreground via-secondary to-primary",
  Jewelry: "from-accent via-background to-primary",
  Beauty: "from-primary via-background to-accent",
};

export function ProductImage({
  src,
  alt,
  category = "Local find",
  className = "",
  priority = false,
  objectPosition = "center 38%",
}: ProductImageProps) {
  const isPlaceholder = src.includes("picsum.photos");
  const safeSrc = isPlaceholder ? "" : src;
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(!safeSrc);
  const initials = alt
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    setIsLoaded(false);
    setHasError(!safeSrc);
  }, [safeSrc]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-muted ${className}`}>
      {!isLoaded && !hasError && <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />}
      {hasError ? (
        <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${categoryStyles[category] ?? categoryStyles.Accessories} px-6 text-secondary-foreground`}>
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[24px] border-background/15" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-10 h-56 w-56 rotate-12 border border-background/20" aria-hidden="true" />
          <div className="relative grid h-full place-items-center text-center">
            <div>
            <div className="mx-auto grid h-16 w-16 place-items-center border border-background/35 bg-background/10 font-display text-2xl font-bold backdrop-blur-sm">
              {initials || <ImageOff className="h-6 w-6" />}
            </div>
            <p className="mt-4 font-mono-ui text-[10px] font-bold uppercase tracking-[0.18em] text-background/80">
              {category}
            </p>
            <p className="mt-2 max-w-[12rem] font-display text-2xl font-bold leading-tight text-background">{alt}</p>
            </div>
          </div>
        </div>
      ) : (
        <img
          src={safeSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{ objectPosition }}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}