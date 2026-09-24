import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-dark-950">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            Erro 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            Produto ou Página Não Encontrado
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            O item ou endereço solicitado não está disponível no catálogo atual.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Catálogo</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs uppercase tracking-wider transition-colors border border-zinc-800"
          >
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
