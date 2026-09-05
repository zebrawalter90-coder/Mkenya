import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
}

export function ProductImage({ src, alt, className = "", priority = false, objectPosition = "center 38%" }: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const initials = alt
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`relative h-full w-full overflow-hidden bg-muted ${className}`}>
      {!isLoaded && !hasError && <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />}
      {hasError ? (
        <div className="absolute inset-0 grid place-items-center bg-secondary px-6 text-center text-secondary-foreground">
          <div>
            <div className="mx-auto grid h-16 w-16 place-items-center border border-secondary-foreground/20 font-display text-2xl font-bold">
              {initials || <ImageOff className="h-6 w-6" />}
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground/70">
              Image unavailable
            </p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
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