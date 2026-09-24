import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Produto } from "@/types/product";
import { AvailabilityBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { generateProductWhatsAppLink } from "@/lib/whatsapp/generator";

import { ImageOff } from "lucide-react";

interface ProductCardProps {
  product: Produto;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const whatsappUrl = generateProductWhatsAppLink({
    id: product.id,
    codigoReferencia: product.codigoReferencia,
    nome: product.nome,
    preco: product.preco,
  });

  return (
    <article className="group flex flex-col bg-dark-900 border border-zinc-800 hover:border-zinc-500 rounded-lg overflow-hidden transition-colors duration-200">
      {/* Imagem como elemento principal (Aspect Ratio fixo 4:3 para evitar layout shift) */}
      <Link
        href={`/produto/${product.slug}`}
        className="relative block w-full aspect-[4/3] bg-dark-950 overflow-hidden"
      >
        {product.imagemPrincipal ? (
          <Image
            src={product.imagemPrincipal}
            alt={product.nome}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-1 bg-dark-950">
            <ImageOff className="w-8 h-8" />
            <span className="text-[10px] font-mono uppercase text-zinc-500">Sem imagem</span>
          </div>
        )}

        {/* Gradiente suave e Badges sutis */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <AvailabilityBadge status={product.statusDisponibilidade} />
        </div>
      </Link>

      {/* Conteúdo Informativo Despoluído: Nome, Preço e Ação */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        <div className="space-y-1.5 flex-1">
          {/* Categoria */}
          <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            {product.categoria.replace("-", " ")}
          </span>

          {/* Nome do Produto */}
          <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-zinc-200 transition-colors line-clamp-2 leading-snug">
            <Link href={`/produto/${product.slug}`}>{product.nome}</Link>
          </h3>
        </div>

        {/* Preço de Referência quando disponível */}
        <div className="pt-3 border-t border-zinc-850 flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
              Valor
            </span>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              {formatCurrency(product.preco)}
            </span>
          </div>

          {/* Ação Direta WhatsApp (Discreta) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Consultar no WhatsApp"
            className="p-2 rounded bg-zinc-850 hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 border border-zinc-700/60 transition-colors"
            aria-label={`Consultar ${product.nome} no WhatsApp`}
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>

        {/* CTA Principal "Saber mais" */}
        <Link
          href={`/produto/${product.slug}`}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <span>Saber mais</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
