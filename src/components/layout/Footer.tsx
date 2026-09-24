"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { generateGeneralWhatsAppLink } from "@/lib/whatsapp/generator";

export function Footer() {
  const pathname = usePathname();
  const whatsappUrl = generateGeneralWhatsAppLink();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-850 bg-dark-950 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Coluna 1: Nome da Loja & Missão */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-white uppercase">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Catálogo visual comercial especializado em soluções de conectividade via satélite, mobilidade elétrica urbana e proteção de equipamentos.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest pt-2">
              Catálogo Informativo &bull; Negociação Direta
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo?categoria=conectividade-satelite"
                  className="hover:text-white transition-colors"
                >
                  Conectividade Starlink
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo?categoria=mobilidade-eletrica"
                  className="hover:text-white transition-colors"
                >
                  Mobilidade Elétrica
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo?categoria=cases-protecao"
                  className="hover:text-white transition-colors"
                >
                  Cases &amp; Maletas Táticas
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Localização (com marcação provisória) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-white">
                Loja Física
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 uppercase bg-zinc-900 border border-zinc-800 px-1 rounded">
                Provisório
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {siteConfig.contact.address.street}
              <br />
              {siteConfig.contact.address.neighborhood} &bull; {siteConfig.contact.address.city}/{siteConfig.contact.address.state}
              <br />
              CEP: {siteConfig.contact.address.cep}
            </p>
            <p className="text-xs text-zinc-400 pt-1">
              {siteConfig.contact.businessHours}
            </p>
          </div>

          {/* Coluna 4: Canais de Atendimento */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-white">
              Atendimento Comercial
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Para orçamentos, confirmação de estoque e esclarecimento de dúvidas técnicas:
            </p>
            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>WhatsApp: {siteConfig.contact.phoneDisplay}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-850">
              * Vendas e pagamentos são concluídos diretamente pela loja física ou via atendimento.
            </div>
          </div>
        </div>

        {/* Linha Inferior */}
        <div className="mt-14 pt-8 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p className="font-mono text-[11px] text-zinc-400">
            Catálogo Comercial &bull; Arquitetura Modular &bull; Supabase/PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
