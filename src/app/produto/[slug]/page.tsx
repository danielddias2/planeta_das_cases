import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/products/service";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductCard } from "@/components/catalog/ProductCard";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// 1. Geração Dinâmica de Metadados para SEO e Compartilhamento Social (OpenGraph)
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Produto não encontrado",
      description: "O produto solicitado não foi localizado em nosso catálogo.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const images = product.imagemPrincipal
    ? [
        {
          url: product.imagemPrincipal,
          alt: product.nome,
        },
      ]
    : [];

  return {
    title: product.nome,
    description: product.descricaoCurta,
    alternates: {
      canonical: `/produto/${params.slug}`,
    },
    openGraph: {
      title: `${product.nome} | Planeta das Cases`,
      description: product.descricaoCurta,
      type: "website",
      url: `/produto/${params.slug}`,
      siteName: "Planeta das Cases",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.nome} | Planeta das Cases`,
      description: product.descricaoCurta,
      images: product.imagemPrincipal ? [product.imagemPrincipal] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Busca produtos relacionados da mesma categoria
  const relatedProducts = (
    await getProducts({ categoria: product.categoria })
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="py-8 sm:py-14 bg-dark-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navegacional Limpo */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-zinc-400 overflow-x-auto whitespace-nowrap pb-1 border-b border-zinc-850/60 pb-3"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <Link href="/catalogo" className="hover:text-white transition-colors">
            Catálogo
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <Link
            href={`/catalogo?categoria=${product.categoria}`}
            className="hover:text-white transition-colors"
          >
            {product.categoria.replace("-", " ")}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="text-zinc-200 truncate max-w-[200px] sm:max-w-md">
            {product.nome}
          </span>
        </nav>

        {/* Bloco Principal do Produto: Galeria e Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Coluna da Galeria (Esquerda - 6 colunas em desktop) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <ProductGallery
              mainImage={product.imagemPrincipal}
              galleryImages={product.galeriaImagens}
              productName={product.nome}
            />
          </div>

          {/* Coluna de Informações e Contato (Direita - 6 colunas em desktop) */}
          <div className="lg:col-span-6">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Seção de Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-zinc-850 space-y-8">
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
                Portfólio Relacionado
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                Outros Produtos da Categoria
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
