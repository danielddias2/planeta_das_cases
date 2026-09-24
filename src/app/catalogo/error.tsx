"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, MessageCircle } from "lucide-react";
import { generateGeneralWhatsAppLink } from "@/lib/whatsapp/generator";

export default function CatalogoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Catalogo Error Boundary]:", error);
  }, [error]);

  const whatsappUrl = generateGeneralWhatsAppLink(
    "Olá! Estava navegando no catálogo da Planeta das Cases e encontrei uma instabilidade momentânea ao carregar a lista de produtos."
  );

  return (
    <div className="py-20 min-h-[60vh] flex items-center justify-center bg-dark-950 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-xl border border-zinc-800 bg-dark-900">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Erro de Conexão com o Banco
          </span>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Não foi possível carregar o catálogo
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Houve uma falha ao consultar os produtos no banco de dados. Verifique a conexão com o Supabase ou tente novamente.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 text-left overflow-x-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded border border-zinc-700 bg-dark-950 text-zinc-300 hover:text-white text-xs uppercase tracking-wider transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Atendimento</span>
          </a>
        </div>
      </div>
    </div>
  );
}
