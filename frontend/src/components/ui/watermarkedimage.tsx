"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/classnames";

interface WatermarkedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  watermarkText?: string;
  onClick?: () => void;
}

export function WatermarkedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  containerClassName,
  watermarkText = "roombazar",
  onClick,
}: WatermarkedImageProps) {
  const [error, setError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden select-none",
        fill ? "size-full" : "inline-block",
        containerClassName,
      )}
    >
      {/* Main Image */}
      {fill ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={error ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" : src}
          alt={alt}
          onError={() => setError(true)}
          className={cn("size-full object-cover transition-transform duration-300", className)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={error ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" : src}
          alt={alt}
          width={width}
          height={height}
          onError={() => setError(true)}
          className={cn("object-cover", className)}
        />
      )}

      {/* OLX-Style Bottom-Right Watermark (Seamless on-image text) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1.5 right-2 sm:bottom-2 sm:right-2.5 z-10 select-none"
      >
        <span className="font-black uppercase tracking-widest text-[11px] sm:text-xs text-white/90 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.95)] font-sans">
          {watermarkText}
        </span>
      </div>
    </div>
  );
}
