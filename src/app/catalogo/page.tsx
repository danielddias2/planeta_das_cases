import React from "react";
import { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/products/service";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { DisponibilidadeStatus } from "@/types/product";
import { Box } from "lucide-react";
import { CyberMesh } from "@/components/ui/CyberMesh";

export const metadata: Metadata = {
  title: "Catálogo Comercial de Produtos",
  description:
    "Consulte todos os produtos de tecnologia, antenas Starlink, veículos de mobilidade elétrica e cases da Planeta das Cases.",
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    title: "Catálogo Comercial de Produtos | Planeta das Cases",
    description:
      "Consulte todos os produtos de tecnologia, antenas Starlink, veículos de mobilidade elétrica e cases da Planeta das Cases.",
    url: "/catalogo",
  },
};

interface CatalogoPageProps {
  searchParams: {
    categoria?: string;
    status?: string;
    busca?: string;
  };
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const categoria = searchParams.categoria;
  const status = searchParams.status as DisponibilidadeStatus | undefined;
  const busca = searchParams.busca;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categoria,
      status: status || undefined,
      busca,
    }),
  ]);

  const activeCategoryInfo = categories.find((c) => c.slug === categoria);

  return (
    <div className="relative overflow-hidden py-14 sm:py-20 bg-dark-950 min-h-screen">
      <CyberMesh variant="corner" position="top-right" opacityClass="opacity-15 sm:opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Cabeçalho da Página */}
        <div className="space-y-3 border-b border-zinc-850 pb-8">
          <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Catálogo Comercial &bull; Consulta de Disponibilidade
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">
            {activeCategoryInfo ? activeCategoryInfo.nome : "Catálogo Geral de Produtos"}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
            {activeCategoryInfo
              ? activeCategoryInfo.descricao
              : "Explore nosso portfólio completo de equipamentos tecnológicos e mobilidade. Para consultar disponibilidade, cotações ou agendar retirada, utilize o canal de atendimento direto."}
          </p>
        </div>

        {/* Filtros e Busca */}
        <CategoryFilter
          categories={categories}
          totalProductsCount={products.length}
        />

        {/* Contagem de Resultados */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-850/60 pb-3">
          <span>
            Exibindo <strong className="text-white">{products.length}</strong> {products.length === 1 ? "item" : "itens"}
          </span>
          {categoria && categoria !== "todas" && (
            <span className="text-zinc-300">Filtro: {categoria}</span>
          )}
        </div>

        {/* Grade de Produtos ou Estado Vazio */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 3} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 rounded-lg border border-dashed border-zinc-800 bg-dark-900/30 p-8">
            <div className="w-10 h-10 mx-auto rounded bg-zinc-900 flex items-center justify-center text-zinc-500">
              <Box className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Nenhum produto localizado
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Não foram encontrados produtos com os critérios selecionados. Altere os filtros ou o termo de busca.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
