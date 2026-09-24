import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Produto } from "@/types/product";
import { ProductCard } from "@/components/catalog/ProductCard";

interface FeaturedProductsProps {
  products: Produto[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-20 sm:py-28 border-b border-zinc-850 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Catálogo Selecionado
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
              Produtos em Destaque
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors uppercase tracking-wider"
          >
            <span>Ver todo o catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid de Produtos com respiro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 3} />
          ))}
        </div>
      </div>
    </section>
  );
}
