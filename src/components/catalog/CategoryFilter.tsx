"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoriaInfo } from "@/types/product";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface CategoryFilterProps {
  categories: CategoriaInfo[];
  totalProductsCount: number;
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("categoria") || "todas";
  const currentStatus = searchParams.get("status") || "todos";
  const currentSearch = searchParams.get("busca") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todas" && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/catalogo?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Campo de Busca Limpo */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar no catálogo..."
          defaultValue={currentSearch}
          onChange={(e) => updateParam("busca", e.target.value)}
          className="w-full bg-dark-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 text-xs sm:text-sm rounded pl-10 pr-4 py-2.5 outline-none transition-colors"
        />
      </div>

      {/* Filtros em Pílulas: Categorias e Disponibilidade */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Pílulas de Categorias */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => updateParam("categoria", "todas")}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-colors",
              currentCategory === "todas"
                ? "bg-white text-black font-semibold"
                : "bg-dark-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
            )}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateParam("categoria", cat.slug)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-colors",
                currentCategory === cat.slug
                  ? "bg-white text-black font-semibold"
                  : "bg-dark-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
              )}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Filtro de Status de Disponibilidade */}
        <div className="flex items-center gap-1 bg-dark-900 border border-zinc-800 p-1 rounded w-fit">
          <button
            onClick={() => updateParam("status", "todos")}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors",
              currentStatus === "todos"
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Todos
          </button>
          <button
            onClick={() => updateParam("status", "disponivel")}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors",
              currentStatus === "disponivel"
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-semibold"
                : "text-zinc-400 hover:text-emerald-300"
            )}
          >
            Disponíveis
          </button>
          <button
            onClick={() => updateParam("status", "indisponivel")}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors",
              currentStatus === "indisponivel"
                ? "bg-zinc-800 text-zinc-200 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Indisponíveis
          </button>
        </div>
      </div>
    </div>
  );
}
