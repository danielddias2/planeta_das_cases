"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getThumbnailUrl } from "@/lib/media/optimizer";
import { ImageOff } from "lucide-react";

interface ProductGalleryProps {
  mainImage: string;
  galleryImages?: string[];
  productName: string;
}

export function ProductGallery({
  mainImage,
  galleryImages = [],
  productName,
}: ProductGalleryProps) {
  const allImages = Array.from(new Set([mainImage, ...galleryImages].filter(Boolean)));
  const [activeImage, setActiveImage] = useState<string>(allImages[0] || mainImage || "");

  // Caso produto não possua nenhuma imagem cadastrada (fallback seguro)
  if (!activeImage) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-dark-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col items-center justify-center text-zinc-600 space-y-2">
          <ImageOff className="w-10 h-10" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Nenhuma imagem cadastrada
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Imagem Principal em Destaque (Aspect Ratio fixo para evitar CLS) */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-dark-900 border border-zinc-800 rounded-lg overflow-hidden">
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 650px"
          className="object-cover object-center transition-opacity duration-200"
        />
      </div>

      {/* Miniaturas (Thumbnails consumindo versão otimizada leve) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {allImages.map((img, index) => {
            const isActive = img === activeImage;
            const thumbSrc = getThumbnailUrl(img);

            return (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative w-20 h-16 sm:w-24 sm:h-18 shrink-0 rounded overflow-hidden border transition-all duration-150 cursor-pointer bg-dark-950",
                  isActive
                    ? "border-white opacity-100"
                    : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600"
                )}
                aria-label={`Ver imagem ${index + 1} de ${productName}`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${productName} miniatura ${index + 1}`}
                  fill
                  sizes="96px"
                  loading="lazy"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
