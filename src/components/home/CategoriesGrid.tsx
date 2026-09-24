import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { CategoriaInfo } from "@/types/product";

interface CategoriesGridProps {
  categories: CategoriaInfo[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section className="py-20 sm:py-28 border-b border-zinc-850 bg-dark-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Segmentos &bull; Dados de Desenvolvimento
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
              Categorias de Produtos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            Navegue pelos principais segmentos de tecnologia e mobilidade disponíveis no catálogo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalogo?categoria=${category.slug}`}
              className="group flex flex-col rounded-lg overflow-hidden border border-zinc-800 bg-dark-950 hover:border-zinc-500 transition-colors duration-200"
            >
              {/* Imagem com Aspect Ratio fixo (16:10) */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-dark-900">
                {category.imagemCapa && (
                  <Image
                    src={category.imagemCapa}
                    alt={category.nome}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent" />
                <div className="absolute top-3 right-3 p-1.5 rounded bg-dark-950/80 border border-zinc-700 text-zinc-400 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Conteúdo da Categoria */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors uppercase tracking-wide">
                  {category.nome}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed flex-1">
                  {category.descricao}
                </p>
                <div className="mt-4 pt-3 border-t border-zinc-850 text-[11px] font-mono uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                  Ver categoria &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
