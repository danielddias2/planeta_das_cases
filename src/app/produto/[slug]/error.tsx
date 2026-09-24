"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import { generateGeneralWhatsAppLink } from "@/lib/whatsapp/generator";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Product Error Boundary]:", error);
  }, [error]);

  const whatsappUrl = generateGeneralWhatsAppLink(
    "Olá! Estava visualizando um produto no catálogo da Planeta das Cases e ocorreu um erro ao carregar as informações."
  );

  return (
    <div className="py-20 min-h-[65vh] flex items-center justify-center bg-dark-950 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-xl border border-zinc-850 bg-dark-900">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Erro ao Carregar Produto
          </span>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Falha na Comunicação com o Banco
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Não foi possível recuperar os dados deste produto a partir do banco de dados.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 text-left overflow-x-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Catálogo</span>
          </Link>

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
