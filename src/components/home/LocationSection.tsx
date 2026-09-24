import React from "react";
import { MapPin, Clock, MessageCircle, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { generateGeneralWhatsAppLink } from "@/lib/whatsapp/generator";

export function LocationSection() {
  const whatsappUrl = generateGeneralWhatsAppLink();

  return (
    <section className="py-20 sm:py-28 border-b border-zinc-850 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            Presença &bull; Informações Provisórias de Desenvolvimento
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            Localização e Atendimento
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Canais de suporte presencial e atendimento remoto direto com nossa equipe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card de Localização Física */}
          <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-4">
            <div className="p-2.5 w-fit rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                  Endereço da Loja
                </h3>
                <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                  Provisório
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {siteConfig.contact.address.street}
                <br />
                {siteConfig.contact.address.neighborhood} - {siteConfig.contact.address.city}/{siteConfig.contact.address.state}
                <br />
                CEP: {siteConfig.contact.address.cep}
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-850">
              <span className="text-[11px] font-mono text-zinc-400">
                * Sujeito à atualização com os dados definitivos da loja.
              </span>
            </div>
          </div>

          {/* Card de Horários */}
          <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-4">
            <div className="p-2.5 w-fit rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                  Horário de Funcionamento
                </h3>
                <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                  Provisório
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {siteConfig.contact.businessHours}
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-850">
              <p className="text-[11px] text-zinc-400">
                Atendimento presencial e suporte a dúvidas técnicas durante o horário comercial.
              </p>
            </div>
          </div>

          {/* Card de Atendimento Direto WhatsApp */}
          <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-2.5 w-fit rounded bg-zinc-950 border border-zinc-800 text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                  Atendimento WhatsApp
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Inicie uma conversa imediata para obter cotações, confirmar especificações e verificar a disponibilidade dos produtos.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-850">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Falar com Atendimento</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
