import React from "react";
import { Produto } from "@/types/product";
import { AvailabilityBadge } from "@/components/ui/Badge";
import { WhatsAppButton } from "./WhatsAppButton";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, Truck, Headphones, Video } from "lucide-react";
import { getVideoPosterUrl } from "@/lib/media/optimizer";

interface ProductInfoProps {
  product: Produto;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const isAvailable = product.statusDisponibilidade === "disponivel";

  return (
    <div className="flex flex-col space-y-8">
      {/* Cabeçalho do Produto */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <AvailabilityBadge status={product.statusDisponibilidade} />
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            REF: {product.codigoReferencia || product.id.slice(0, 8)}
          </span>
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
            {product.categoria.replace("-", " ")}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white uppercase leading-tight">
          {product.nome}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {product.descricaoCurta}
        </p>
      </div>

      {/* Preço de Referência */}
      <div className="p-5 rounded-lg bg-dark-900 border border-zinc-800 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
            Valor de Referência
          </span>
          <span className="text-[11px] font-mono text-zinc-400">Consulta Comercial</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {formatCurrency(product.preco)}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-normal">
          * Condições de pagamento, prazos de envio ou retirada são informados diretamente no atendimento comercial.
        </p>
      </div>

      {/* Ação Principal: WhatsApp com Mensagem Dinâmica Contextualizada */}
      <div className="space-y-2 pt-1">
        <WhatsAppButton
          product={product}
          label={isAvailable ? "Tenho Interesse neste Produto" : "Consultar Disponibilidade"}
          className="w-full"
        />

        <p className="text-center text-[11px] text-zinc-400">
          Você será direcionado ao atendimento com o código e nome deste produto já identificados.
        </p>
      </div>

      {/* Atributos de Atendimento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-850">
        <div className="flex items-center gap-2 p-3 rounded bg-dark-900 border border-zinc-850">
          <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-300">Garantia &amp; Procedência</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded bg-dark-900 border border-zinc-850">
          <Truck className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-300">Envio Especializado</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded bg-dark-900 border border-zinc-850">
          <Headphones className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-300">Suporte da Loja</span>
        </div>
      </div>

      {/* Vídeos de Demonstração (quando existirem) */}
      {product.videos && product.videos.length > 0 && (
        <div className="pt-6 border-t border-zinc-850 space-y-4">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-white">
              Vídeos e Demonstrações
            </h2>
          </div>
          <div className="space-y-4">
            {product.videos.map((videoUrl, idx) => {
              const isDirectVideo =
                videoUrl.includes("/storage/v1/object/public/") ||
                videoUrl.match(/\.(mp4|webm|mov|ogg)($|\?)/i);
              const posterUrl = isDirectVideo ? getVideoPosterUrl(videoUrl) : null;

              if (isDirectVideo) {
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Demonstração #{idx + 1}
                      </span>
                      {posterUrl && (
                        <span className="text-[9px] font-mono uppercase text-emerald-400">
                          Poster Otimizado
                        </span>
                      )}
                    </div>
                    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black aspect-video relative">
                      <video
                        controls
                        poster={posterUrl || undefined}
                        preload={posterUrl ? "none" : "metadata"}
                        playsInline
                        className="w-full h-full object-contain"
                      >
                        <source src={videoUrl} />
                        Seu navegador não suporta a reprodução deste vídeo.
                      </video>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-dark-900 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <span className="text-zinc-300 font-medium">Demonstração em Vídeo #{idx + 1}</span>
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white uppercase font-mono tracking-wider underline text-[11px] transition-colors"
                  >
                    Assistir Vídeo Externo &rarr;
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Especificações Técnicas (quando existirem) */}
      {product.especificacoes && Object.keys(product.especificacoes).length > 0 && (
        <div className="pt-6 border-t border-zinc-850 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white">
            Especificações Técnicas
          </h2>
          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-dark-900 overflow-hidden">
            {Object.entries(product.especificacoes).map(([chave, valor]) => (
              <div
                key={chave}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 text-xs"
              >
                <span className="font-mono text-zinc-400">{chave}</span>
                <span className="font-medium text-white mt-1 sm:mt-0 text-left sm:text-right">
                  {valor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descrição Completa */}
      <div className="pt-6 border-t border-zinc-850 space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-white">
          Descrição Detalhada
        </h2>
        <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {product.descricaoCompleta}
        </div>
      </div>
    </div>
  );
}
