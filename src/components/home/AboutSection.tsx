import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CyberMesh } from "@/components/ui/CyberMesh";

export function AboutSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 border-b border-zinc-850 bg-dark-950">
      <CyberMesh variant="corner" position="top-right" opacityClass="opacity-15 sm:opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Coluna Visual: Imagem Arquitetural com Respiro */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800 bg-dark-900">
              <Image
                src="https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=85"
                alt="Apresentação institucional da Planeta das Cases"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Coluna Informativa Comercial */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
                Apresentação Institucional
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight uppercase">
                Planeta das Cases
              </h2>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              A <strong>Planeta das Cases</strong> atua com a comercialização de produtos modernos nos setores de tecnologia e mobilidade, oferecendo um catálogo focado em conectividade via satélite (como antenas Starlink), veículos elétricos e soluções de proteção.
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              O site foi planejado como um marketplace visual e catálogo comercial: os clientes conhecem detalhadamente as especificações dos produtos e realizam a negociação de forma direta, ágil e segura com a equipe da loja via WhatsApp ou atendimento presencial.
            </p>

            <div className="pt-2">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white hover:text-zinc-300 transition-colors uppercase tracking-wider"
              >
                <span>Acessar o Catálogo de Produtos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
