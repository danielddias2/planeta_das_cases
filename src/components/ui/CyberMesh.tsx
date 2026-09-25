import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CyberMeshProps {
  /**
   * Estilo de exibição visual da malha
   */
  variant?: "corner" | "watermark" | "subtle" | "banner";
  /**
   * Posição absoluta da malha em relação ao container pai (deve ter relative e overflow-hidden)
   */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
  /**
   * Classes adicionais para customização fina de opacidade, rotação ou escala
   */
  className?: string;
  /**
   * Opacidade personalizada em classes Tailwind (ex: "opacity-15 sm:opacity-25")
   */
  opacityClass?: string;
}

const positionClasses: Record<NonNullable<CyberMeshProps["position"]>, string> = {
  "top-right": "-top-24 -right-24 sm:-top-32 sm:-right-32",
  "top-left": "-top-24 -left-24 sm:-top-32 sm:-left-32",
  "bottom-right": "-bottom-24 -right-24 sm:-bottom-32 sm:-right-32",
  "bottom-left": "-bottom-24 -left-24 sm:-bottom-32 sm:-left-32",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

const variantClasses: Record<NonNullable<CyberMeshProps["variant"]>, { size: string; defaultOpacity: string }> = {
  corner: {
    size: "w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px]",
    defaultOpacity: "opacity-20 sm:opacity-25",
  },
  watermark: {
    size: "w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] lg:w-[600px] lg:h-[600px]",
    defaultOpacity: "opacity-15 sm:opacity-20",
  },
  subtle: {
    size: "w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px]",
    defaultOpacity: "opacity-10 sm:opacity-15",
  },
  banner: {
    size: "w-[360px] h-[360px] sm:w-[520px] sm:h-[520px] lg:w-[640px] lg:h-[640px]",
    defaultOpacity: "opacity-20 sm:opacity-30",
  },
};

/**
 * Componente CyberMesh
 * 
 * Renderiza de forma estática, responsiva e performática a malha de rede
 * cibernética verde extraída diretamente da identidade visual (logo) da Planeta das Cases.
 * 
 * - Background transparente
 * - Isolado com pointer-events-none e select-none
 * - Acessibilidade: aria-hidden="true"
 * - Sem animações ou parallax (fase 1 estática)
 */
export function CyberMesh({
  variant = "corner",
  position = "top-right",
  className,
  opacityClass,
}: CyberMeshProps) {
  const variantConfig = variantClasses[variant];
  const posClass = position ? positionClasses[position] : "";
  const finalOpacity = opacityClass || variantConfig.defaultOpacity;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none absolute z-0",
        posClass,
        variantConfig.size,
        finalOpacity,
        className
      )}
    >
      <Image
        src="/assets/cyber-mesh.svg"
        alt=""
        width={600}
        height={600}
        priority={false}
        className="w-full h-full object-contain filter drop-shadow-[0_0_24px_rgba(16,185,129,0.18)]"
      />
    </div>
  );
}
