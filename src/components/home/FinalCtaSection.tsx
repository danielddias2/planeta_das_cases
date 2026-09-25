import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { generateGeneralWhatsAppLink } from "@/lib/whatsapp/generator";
import { CyberMesh } from "@/components/ui/CyberMesh";

export function FinalCtaSection() {
  const whatsappUrl = generateGeneralWhatsAppLink();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 border-b border-zinc-850 bg-dark-900/60">
      <CyberMesh variant="watermark" position="center" opacityClass="opacity-15 sm:opacity-20" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-3">
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            Catálogo Comercial Completo
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase leading-tight">
            Pronto para conhecer nossas soluções em tecnologia e mobilidade?
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Consulte nosso portfólio completo de antenas Starlink, veículos elétricos e cases blindadas, ou fale diretamente com a equipe da Planeta das Cases.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors"
          >
            <span>Acessar Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded border border-zinc-700 hover:border-zinc-400 bg-white/5 hover:bg-white/10 text-white font-medium text-xs sm:text-sm uppercase tracking-wider transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Contato via WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
