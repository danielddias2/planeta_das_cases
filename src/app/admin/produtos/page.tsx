"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Produto } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/ui/Badge";
import { revalidateCatalog } from "@/app/admin/actions";
import { deleteProductMedia } from "@/lib/supabase/storage";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtros locais
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  // Estado para exclusão com confirmação
  const [productToDelete, setProductToDelete] = useState<Produto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado de atualização de item individual (loading no toggle)
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("Supabase não configurado no .env.local.");
      setIsLoading(false);
      return;
    }

    try {
      let { data, error } = await supabase
        .from("products")
        .select("*")
        .order("ordem_exibicao", { ascending: true })
        .order("created_at", { ascending: false });

      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        const fallback = await supabase
          .from("produtos")
          .select("*")
          .order("ordem_exibicao", { ascending: true })
          .order("created_at", { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      const mapped: Produto[] = (data || []).map((row: any) => ({
        id: String(row.id),
        codigoReferencia: row.codigo_referencia || undefined,
        nome: String(row.nome || ""),
        slug: String(row.slug || ""),
        descricaoCurta: String(row.descricao_curta || ""),
        descricaoCompleta: String(row.descricao || row.descricao_completa || ""),
        preco: row.preco !== null && row.preco !== undefined ? Number(row.preco) : null,
        statusDisponibilidade:
          (row.status_disponibilidade || row.status) === "indisponivel" ? "indisponivel" : "disponivel",
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
      setErrorMessage(err.message || "Erro ao carregar produtos do banco.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1. Alteração rápida de disponibilidade (Disponível <-> Indisponível)
  const toggleDisponibilidade = async (product: Produto) => {
    const nextStatus = product.statusDisponibilidade === "disponivel" ? "indisponivel" : "disponivel";
    setUpdatingId(product.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      // Tenta atualizar status_disponibilidade e status
      let { error } = await supabase
        .from("products")
        .update({
          status_disponibilidade: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        const fallback = await supabase
          .from("produtos")
          .update({ status: nextStatus, status_disponibilidade: nextStatus, updated_at: new Date().toISOString() })
          .eq("id", product.id);
        error = fallback.error;
      }

      if (error) throw error;

      // Atualiza estado local imediatamente
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, statusDisponibilidade: nextStatus } : p))
      );

      // Revalida o cache do catálogo público no Next.js
      await revalidateCatalog(product.slug);
      setSuccessMessage(`Disponibilidade de "${product.nome}" alterada para ${nextStatus.toUpperCase()}.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(`Erro ao atualizar status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Alteração rápida de Destaque
  const toggleDestaque = async (product: Produto) => {
    const nextDestaque = !product.destaque;
    setUpdatingId(product.id);
    setErrorMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      let { error } = await supabase
        .from("products")
        .update({ destaque: nextDestaque, updated_at: new Date().toISOString() })
        .eq("id", product.id);

      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        const fallback = await supabase
          .from("produtos")
          .update({ destaque: nextDestaque, updated_at: new Date().toISOString() })
          .eq("id", product.id);
        error = fallback.error;
      }

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, destaque: nextDestaque } : p))
      );

      await revalidateCatalog(product.slug);
      setSuccessMessage(`Destaque de "${product.nome}" atualizado.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(`Erro ao atualizar destaque: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Exclusão confirmada permanente do produto
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsDeleting(false);
      return;
    }

    try {
      let { error } = await supabase.from("products").delete().eq("id", productToDelete.id);

      if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
        const fallback = await supabase.from("produtos").delete().eq("id", productToDelete.id);
        error = fallback.error;
      }

      if (error) throw error;

      // Limpeza segura dos arquivos do produto no Supabase Storage para evitar arquivos órfãos (Etapa 5B)
      const mediaUrlsToDelete = [
        productToDelete.imagemPrincipal,
        ...(productToDelete.galeriaImagens || []),
        ...(productToDelete.videos || []),
      ].filter(Boolean);

      for (const mUrl of mediaUrlsToDelete) {
        await deleteProductMedia(mUrl);
      }

      // Remove do estado local
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));

      await revalidateCatalog(productToDelete.slug);
      setSuccessMessage(`Produto "${productToDelete.nome}" e suas mídias foram excluídos.`);
      setProductToDelete(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Erro ao excluir produto: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtragem dos produtos em memória
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codigoReferencia && p.codigoReferencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "todas" || p.categoria === selectedCategory;
    const matchesStatus = selectedStatus === "todos" || p.statusDisponibilidade === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(products.map((p) => p.categoria).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Gerenciamento do Catálogo
          </span>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-0.5">
            Produtos Cadastrados ({products.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            title="Atualizar lista"
            className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </Link>
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {errorMessage && (
        <div className="p-3.5 rounded bg-red-950/40 border border-red-800/40 text-xs text-red-300">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-500 text-xs rounded pl-9 pr-3 py-2 outline-none transition-colors"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-dark-900 border border-zinc-800 focus:border-zinc-500 text-zinc-300 text-xs rounded px-3 py-2 outline-none"
          >
            <option value="todas">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-dark-900 border border-zinc-800 focus:border-zinc-500 text-zinc-300 text-xs rounded px-3 py-2 outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="disponivel">Apenas Disponíveis</option>
            <option value="indisponivel">Apenas Indisponíveis</option>
          </select>
        </div>
      </div>

      {/* Lista de Produtos */}
      {isLoading ? (
        <div className="py-20 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Carregando produtos do banco...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-dark-900 border border-dashed border-zinc-800 rounded-lg space-y-3">
          <p className="text-xs text-zinc-400">Nenhum produto corresponde aos filtros aplicados.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("todas");
              setSelectedStatus("todos");
            }}
            className="text-xs font-mono uppercase text-white hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          {/* Tabela para Desktop e Tablets */}
          <div className="hidden md:block rounded-lg border border-zinc-800 bg-dark-900 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-dark-950 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-16 text-center">Foto</th>
                  <th className="p-3">Nome / Ref</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Disponibilidade</th>
                  <th className="p-3 text-center">Destaque</th>
                  <th className="p-3 text-center">Ordem</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-850/40 transition-colors">
                    {/* Imagem */}
                    <td className="p-3 text-center">
                      <div className="relative w-12 h-10 rounded overflow-hidden bg-dark-950 border border-zinc-800 mx-auto">
                        {product.imagemPrincipal ? (
                          <Image
                            src={product.imagemPrincipal}
                            alt={product.nome}
                            fill
                            sizes="48px"
                            className="object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600 font-mono">
                            Sem foto
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Nome e Código */}
                    <td className="p-3">
                      <div className="font-semibold text-white truncate max-w-xs" title={product.nome}>
                        {product.nome}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span>REF: {product.codigoReferencia || product.id.slice(0, 8)}</span>
                        <span>&bull;</span>
                        <Link
                          href={`/produto/${product.slug}`}
                          target="_blank"
                          className="hover:text-white flex items-center gap-0.5"
                          title="Visualizar no catálogo público"
                        >
                          <span>/{product.slug}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="p-3 font-mono text-zinc-400 capitalize whitespace-nowrap">
                      {product.categoria.replace("-", " ")}
                    </td>

                    {/* Preço */}
                    <td className="p-3 font-medium text-white whitespace-nowrap">
                      {formatCurrency(product.preco)}
                    </td>

                    {/* Disponibilidade com Toggle Rápido */}
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleDisponibilidade(product)}
                        disabled={updatingId === product.id}
                        title="Clique para alternar disponibilidade"
                        className="cursor-pointer group flex items-center gap-1.5"
                      >
                        <AvailabilityBadge status={product.statusDisponibilidade} />
                        {updatingId === product.id && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                      </button>
                    </td>

                    {/* Destaque com Toggle Rápido */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleDestaque(product)}
                        disabled={updatingId === product.id}
                        title="Clique para alternar destaque na Home"
                        className="cursor-pointer font-mono text-[10px] uppercase px-2 py-0.5 rounded border transition-colors"
                      >
                        {product.destaque ? (
                          <span className="bg-zinc-800 text-white border-zinc-700">Sim</span>
                        ) : (
                          <span className="text-zinc-400 border-zinc-800 hover:text-white">Não</span>
                        )}
                      </button>
                    </td>

                    {/* Ordem */}
                    <td className="p-3 text-center font-mono text-zinc-400">
                      {product.ordemExibicao}
                    </td>

                    {/* Ações */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/produtos/${product.id}`}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors"
                          title="Editar dados"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards Funcionais para Mobile */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-lg bg-dark-900 border border-zinc-800 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-14 rounded overflow-hidden bg-dark-950 border border-zinc-800 shrink-0">
                    {product.imagemPrincipal && (
                      <Image
                        src={product.imagemPrincipal}
                        alt={product.nome}
                        fill
                        sizes="64px"
                        className="object-cover object-center"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                      {product.nome}
                    </h3>
                    <div className="text-[10px] font-mono text-zinc-400 mt-1">
                      {product.codigoReferencia || product.id.slice(0, 8)} &bull; {formatCurrency(product.preco)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-xs">
                  <button
                    onClick={() => toggleDisponibilidade(product)}
                    className="cursor-pointer"
                  >
                    <AvailabilityBadge status={product.statusDisponibilidade} />
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 text-xs font-mono"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </Link>

                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1 rounded bg-zinc-800 text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-xl bg-dark-900 border border-zinc-800 space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-full bg-red-950/60 border border-red-800/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-tight text-white">
                Confirmar Exclusão
              </h3>
            </div>

            <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p>
                Tem certeza que deseja excluir o produto:
              </p>
              <div className="p-3 rounded bg-dark-950 border border-zinc-800 font-semibold text-white">
                {productToDelete.nome}
              </div>
              <p className="text-red-400 text-[11px] font-mono">
                * ATENÇÃO: Esta ação é definitiva e removerá permanentemente o produto do Supabase e do catálogo público.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Produto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
