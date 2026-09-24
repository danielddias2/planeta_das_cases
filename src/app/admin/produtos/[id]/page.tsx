"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Produto } from "@/types/product";
import { ProductForm } from "@/components/admin/ProductForm";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function EditarProdutoPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setErrorMessage("Supabase não configurado nas variáveis de ambiente.");
        setIsLoading(false);
        return;
      }

      try {
        let { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
          const fallback = await supabase
            .from("produtos")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }

        if (error) throw error;

        if (!data) {
          setErrorMessage("Produto não encontrado no banco de dados.");
          setIsLoading(false);
          return;
        }

        const mapped: Produto = {
          id: String(data.id),
          codigoReferencia: data.codigo_referencia || undefined,
          nome: String(data.nome || ""),
          slug: String(data.slug || ""),
          descricaoCurta: String(data.descricao_curta || ""),
          descricaoCompleta: String(data.descricao || data.descricao_completa || ""),
          preco: data.preco !== null && data.preco !== undefined ? Number(data.preco) : null,
          statusDisponibilidade:
            (data.status_disponibilidade || data.status) === "indisponivel"
              ? "indisponivel"
              : "disponivel",
          imagemPrincipal: String(data.imagem_principal || ""),
          galeriaImagens: Array.isArray(data.galeria_imagens) ? data.galeria_imagens : [],
          videos: Array.isArray(data.videos) ? data.videos : [],
          categoria: String(data.categoria || ""),
          destaque: Boolean(data.destaque),
          ordemExibicao: Number(data.ordem_exibicao || 0),
          especificacoes: data.especificacoes || {},
          createdAt: String(data.created_at || ""),
          updatedAt: String(data.updated_at || ""),
        };

        setProduct(mapped);
      } catch (err: any) {
        setErrorMessage(err.message || "Erro ao carregar dados do produto.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-zinc-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
        <span>Carregando dados do produto para edição...</span>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <div className="p-3 rounded-full bg-red-950/40 border border-red-800/40 w-fit mx-auto text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold uppercase text-white">Não foi possível carregar o produto</h2>
        <p className="text-xs text-zinc-400">{errorMessage || "Produto inexistente."}</p>
        <div className="pt-2">
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono uppercase text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Lista de Produtos</span>
          </Link>
        </div>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEdit={true} />;
}
