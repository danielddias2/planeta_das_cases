"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Produto } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/ui/Badge";
import { Package, CheckCircle, XCircle, Sparkles, PlusCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase não configurado nas variáveis de ambiente.");
      setIsLoading(false);
      return;
    }

    try {
      // Busca da tabela products (ou produtos caso legado)
      let { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        const fallback = await supabase.from("produtos").select("*").order("created_at", { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

      const mapped: Produto[] = (data || []).map((row: any) => ({
        id: String(row.id),
        codigoReferencia: row.codigo_referencia || undefined,
        nome: String(row.nome || ""),
        slug: String(row.slug || ""),
        descricaoCurta: String(row.descricao_curta || ""),
        descricaoCompleta: String(row.descricao || row.descricao_completa || ""),
        preco: row.preco !== null && row.preco !== undefined ? Number(row.preco) : null,
        statusDisponibilidade: (row.status_disponibilidade || row.status) === "indisponivel" ? "indisponivel" : "disponivel",
        imagemPrincipal: String(row.imagem_principal || ""),
        galeriaImagens: Array.isArray(row.galeria_imagens) ? row.galeria_imagens : [],
        videos: Array.isArray(row.videos) ? row.videos : [],
        categoria: String(row.categoria || ""),
        destaque: Boolean(row.destaque),
        ordemExibicao: Number(row.ordem_exibicao || 0),
        especificacoes: row.especificacoes || {},
        createdAt: String(row.created_at || ""),
        updatedAt: String(row.updated_at || ""),
      }));

      setProducts(mapped);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar métricas reais do banco de dados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Métricas 100% Reais calculadas diretamente dos dados do Supabase
  const totalCount = products.length;
  const availableCount = products.filter((p) => p.statusDisponibilidade === "disponivel").length;
  const unavailableCount = products.filter((p) => p.statusDisponibilidade === "indisponivel").length;
  const featuredCount = products.filter((p) => p.destaque).length;

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Visão Geral
          </span>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-0.5">
            Dashboard Administrativo
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            title="Atualizar dados"
            disabled={isLoading}
            className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-950/40 border border-red-800/40 text-xs text-red-300 leading-relaxed">
          {error}
        </div>
      )}

      {/* Cards de Métricas Reais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-5 rounded-lg bg-dark-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Total Produtos</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : totalCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block">Cadastrados no banco</span>
        </div>

        {/* Disponíveis */}
        <div className="p-5 rounded-lg bg-dark-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Disponíveis</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : availableCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block">Prontos para consulta</span>
        </div>

        {/* Indisponíveis */}
        <div className="p-5 rounded-lg bg-dark-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest">Indisponíveis</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : unavailableCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block">Sob consulta ou reposição</span>
        </div>

        {/* Em Destaque */}
        <div className="p-5 rounded-lg bg-dark-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-[11px] font-mono uppercase tracking-widest">Em Destaque</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : featuredCount}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block">Exibidos na Home pública</span>
        </div>
      </div>

      {/* Tabela de Produtos Recentes */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Últimos Produtos Cadastrados
          </h2>
          <Link
            href="/admin/produtos"
            className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            Ver todos &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Consultando Supabase...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center bg-dark-900 border border-dashed border-zinc-800 rounded-lg space-y-2">
            <p className="text-xs text-zinc-400">Nenhum produto cadastrado no banco de dados.</p>
            <Link
              href="/admin/produtos/novo"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-white hover:underline"
            >
              <span>Cadastrar primeiro produto &rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-dark-900 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-dark-950 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Produto</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5">Preço</th>
                  <th className="p-3.5">Disponibilidade</th>
                  <th className="p-3.5">Destaque</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-white truncate max-w-xs">{product.nome}</div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {product.codigoReferencia || product.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-400 capitalize">
                      {product.categoria.replace("-", " ")}
                    </td>
                    <td className="p-3.5 font-medium text-white">{formatCurrency(product.preco)}</td>
                    <td className="p-3.5">
                      <AvailabilityBadge status={product.statusDisponibilidade} />
                    </td>
                    <td className="p-3.5 font-mono">
                      {product.destaque ? (
                        <span className="text-[10px] uppercase text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">
                          Sim
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase text-zinc-500">Não</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono">
                      <Link
                        href={`/admin/produtos/${product.id}`}
                        className="text-xs uppercase text-zinc-300 hover:text-white underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
