import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { generateGeneralWhatsAppLink } from "@/lib/whatsapp/generator";

export function HeroSection() {
  const whatsappUrl = generateGeneralWhatsAppLink();

  return (
    <section className="relative min-h-[82vh] sm:min-h-[88vh] flex items-center justify-center border-b border-zinc-850 overflow-hidden bg-dark-950">
      {/* Imagem de Fundo de Alto Impacto com Overlay Limpo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=2000&q=85"
          alt="Conectividade e tecnologia avançada"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30 sm:opacity-40"
        />
        {/* Vinheta cinematográfica limpa (sem neon) */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-8">
        {/* Identificador de Categoria / Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/5 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="text-[11px] font-mono tracking-widest text-zinc-300 uppercase">
            Catálogo Comercial &bull; Tecnologia &amp; Mobilidade
          </span>
        </div>

        {/* Título Principal Forte e Imponente */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.1]">
          Tecnologia e Mobilidade de Alta Performance
        </h1>

        {/* Subtítulo Curto e Objetivo */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
          Apresentação comercial e catálogo visual da <strong className="text-white font-medium">Planeta das Cases</strong>. Explore equipamentos de conectividade via satélite, veículos elétricos e proteção especializada com negociação direta.
        </p>

        {/* Ações Principais */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors"
          >
            <span>Conhecer Produtos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded border border-zinc-700 hover:border-zinc-400 bg-white/5 hover:bg-white/10 text-white font-medium text-xs sm:text-sm uppercase tracking-wider transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>

        {/* Indicadores Comerciais Discretos */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-zinc-850/80 text-left">
          <div className="space-y-0.5">
            <span className="block text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Segmento
            </span>
            <span className="block text-xs sm:text-sm font-medium text-white">
              Starlink &amp; Satélite
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="block text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Mobilidade
            </span>
            <span className="block text-xs sm:text-sm font-medium text-white">
              Motos &amp; Scooters
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="block text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Atendimento
            </span>
            <span className="block text-xs sm:text-sm font-medium text-white">
              Consultoria Direta
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="block text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Operação
            </span>
            <span className="block text-xs sm:text-sm font-medium text-white">
              Loja &amp; Catálogo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
