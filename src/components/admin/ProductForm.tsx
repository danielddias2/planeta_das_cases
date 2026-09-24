"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DisponibilidadeStatus, Produto } from "@/types/product";
import { revalidateCatalog } from "@/app/admin/actions";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { MediaUploadSection } from "./MediaUploadSection";

interface ProductFormProps {
  initialProduct?: Produto;
  isEdit?: boolean;
}

// Utilitário para transformar nome em slug URL-friendly
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .trim()
    .replace(/[\s_-]+/g, "-") // Substitui espaços por hífen
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ initialProduct, isEdit = false }: ProductFormProps) {
  const router = useRouter();

  // Estados dos campos
  const [nome, setNome] = useState(initialProduct?.nome || "");
  const [codigoReferencia, setCodigoReferencia] = useState(initialProduct?.codigoReferencia || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState(isEdit);
  const [descricaoCurta, setDescricaoCurta] = useState(initialProduct?.descricaoCurta || "");
  const [descricaoCompleta, setDescricaoCompleta] = useState(
    initialProduct?.descricaoCompleta || initialProduct?.descricao || ""
  );
  const [preco, setPreco] = useState<string>(
    initialProduct?.preco !== null && initialProduct?.preco !== undefined ? String(initialProduct.preco) : ""
  );
  const [categoria, setCategoria] = useState(initialProduct?.categoria || "conectividade-satelite");
  const [statusDisponibilidade, setStatusDisponibilidade] = useState<DisponibilidadeStatus>(
    initialProduct?.statusDisponibilidade || "disponivel"
  );
  const [destaque, setDestaque] = useState(initialProduct?.destaque || false);
  const [ordemExibicao, setOrdemExibicao] = useState(
    initialProduct?.ordemExibicao !== undefined ? String(initialProduct.ordemExibicao) : "0"
  );

  // ID estável do produto (utilizado no path de storage products/{productId}/...)
  const [productId] = useState<string>(() => {
    if (initialProduct?.id) return initialProduct.id;
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "00000000-0000-4000-8000-" + Date.now().toString(16).padStart(12, "0");
  });

  // Mídias
  const [imagemPrincipal, setImagemPrincipal] = useState(initialProduct?.imagemPrincipal || "");
  const [galeriaImagens, setGaleriaImagens] = useState<string[]>(
    initialProduct?.galeriaImagens?.filter(Boolean) || []
  );
  const [videos, setVideos] = useState<string[]>(
    initialProduct?.videos?.filter(Boolean) || []
  );

  // Especificações técnicas dinâmicas [chave, valor]
  const [especificacoesList, setEspecificacoesList] = useState<Array<{ chave: string; valor: string }>>(() => {
    if (initialProduct?.especificacoes && Object.keys(initialProduct.especificacoes).length > 0) {
      return Object.entries(initialProduct.especificacoes).map(([chave, valor]) => ({ chave, valor }));
    }
    return [
      { chave: "", valor: "" },
    ];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-geração do slug ao digitar o nome (apenas na criação, se o usuário não alterou manualmente)
  useEffect(() => {
    if (!isEdit && !isSlugManual && nome) {
      setSlug(generateSlug(nome));
    }
  }, [nome, isEdit, isSlugManual]);

  // Manipulação de Especificações
  const handleSpecChange = (index: number, field: "chave" | "valor", value: string) => {
    const updated = [...especificacoesList];
    updated[index][field] = value;
    setEspecificacoesList(updated);
  };
  const addSpecRow = () => setEspecificacoesList([...especificacoesList, { chave: "", valor: "" }]);
  const removeSpecRow = (index: number) => {
    setEspecificacoesList(especificacoesList.filter((_, i) => i !== index));
  };

  // Submissão do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("Supabase não configurado nas variáveis de ambiente.");
      setIsSubmitting(false);
      return;
    }

    // Validações básicas
    const cleanNome = nome.trim();
    const cleanSlug = slug.trim().toLowerCase();

    if (!cleanNome) {
      setErrorMessage("O nome do produto é obrigatório.");
      setIsSubmitting(false);
      return;
    }

    if (!cleanSlug || !/^[a-z0-9-]+$/.test(cleanSlug)) {
      setErrorMessage("O slug deve conter apenas letras minúsculas, números e hífens (ex: produto-exemplo).");
      setIsSubmitting(false);
      return;
    }

    if (!imagemPrincipal.trim()) {
      setErrorMessage("A URL da imagem principal é obrigatória.");
      setIsSubmitting(false);
      return;
    }

    // Preço numérico ou null
    let precoNumerico: number | null = null;
    if (preco.trim() !== "") {
      const parsed = parseFloat(preco.replace(",", "."));
      if (isNaN(parsed) || parsed < 0) {
        setErrorMessage("Informe um preço numérico válido ou deixe o campo vazio para 'sob consulta'.");
        setIsSubmitting(false);
        return;
      }
      precoNumerico = parsed;
    }

    // Prepara especificações como Record<string, string>
    const specsRecord: Record<string, string> = {};
    especificacoesList.forEach((item) => {
      const k = item.chave.trim();
      const v = item.valor.trim();
      if (k && v) {
        specsRecord[k] = v;
      }
    });

    const cleanGaleria = galeriaImagens.map((u) => u.trim()).filter(Boolean);
    const cleanVideos = videos.map((u) => u.trim()).filter(Boolean);

    const payload = {
      nome: cleanNome,
      codigo_referencia: codigoReferencia.trim() || null,
      slug: cleanSlug,
      descricao_curta: descricaoCurta.trim(),
      descricao: descricaoCompleta.trim(),
      descricao_completa: descricaoCompleta.trim(),
      preco: precoNumerico,
      status_disponibilidade: statusDisponibilidade,
      status: statusDisponibilidade,
      imagem_principal: imagemPrincipal.trim(),
      galeria_imagens: cleanGaleria,
      videos: cleanVideos,
      categoria: categoria.trim(),
      destaque: destaque,
      ordem_exibicao: parseInt(ordemExibicao, 10) || 0,
      especificacoes: specsRecord,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit && initialProduct) {
        // Atualização
        let { error } = await supabase.from("products").update(payload).eq("id", initialProduct.id);

        if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
          const fallback = await supabase.from("produtos").update(payload).eq("id", initialProduct.id);
          error = fallback.error;
        }

        if (error) {
          if (error.code === "23505" || error.message?.includes("duplicate key")) {
            throw new Error("Já existe outro produto cadastrado com este slug ou código de referência.");
          }
          throw error;
        }

        await revalidateCatalog(cleanSlug);
        setSuccessMessage("Produto atualizado com sucesso no Supabase!");
      } else {
        // Criação de Novo Produto
        const newProductPayload = {
          id: productId,
          ...payload,
          created_at: new Date().toISOString(),
        };

        let { error } = await supabase.from("products").insert([newProductPayload]);

        if (error && (error.code === "42P01" || error.message?.includes("does not exist"))) {
          const fallback = await supabase.from("produtos").insert([newProductPayload]);
          error = fallback.error;
        }

        if (error) {
          if (error.code === "23505" || error.message?.includes("duplicate key")) {
            throw new Error("Já existe um produto cadastrado com este slug ou código de referência.");
          }
          throw error;
        }

        await revalidateCatalog(cleanSlug);
        setSuccessMessage("Produto criado com sucesso no banco de dados!");
        setTimeout(() => {
          router.push("/admin/produtos");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao salvar produto no Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos"
            className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
              {isEdit ? "Edição de Cadastro" : "Novo Cadastro"}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-0.5">
              {isEdit ? `Editar: ${initialProduct?.nome}` : "Cadastrar Produto"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos"
            className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono uppercase tracking-wider"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Produto</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <div className="p-3.5 rounded bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Bloco 1: Informações Básicas e Identificação */}
      <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-300 border-b border-zinc-850 pb-2">
          1. Identificação do Produto
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Nome */}
          <div className="sm:col-span-8 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Nome do Produto *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Antena Starlink Veicular de Alta Performance"
              className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded px-3 py-2 outline-none transition-colors"
            />
          </div>

          {/* Código de Referência */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Código / Referência (Ref)
            </label>
            <input
              type="text"
              value={codigoReferencia}
              onChange={(e) => setCodigoReferencia(e.target.value)}
              placeholder="Ex: STAR-MOB-002"
              className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded px-3 py-2 outline-none font-mono transition-colors uppercase"
            />
          </div>

          {/* Slug */}
          <div className="sm:col-span-12 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Slug da URL * (amigável)
              </label>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => setIsSlugManual(false)}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white"
                >
                  Regerar do nome
                </button>
              )}
            </div>
            <div className="flex items-center bg-dark-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono">
              <span className="text-zinc-500 shrink-0">/produto/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setIsSlugManual(true);
                  setSlug(e.target.value);
                }}
                placeholder="antena-starlink-veicular"
                className="w-full bg-transparent text-white outline-none pl-1"
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-500">
              Utilizado na URL do produto. Apenas minúsculas, números e hífens.
            </p>
          </div>
        </div>
      </div>

      {/* Bloco 2: Preço, Categoria e Status */}
      <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-300 border-b border-zinc-850 pb-2">
          2. Comercialização &amp; Disponibilidade
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Preço */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Preço de Referência (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 2890.00 (Vazio = Sob consulta)"
              className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded px-3 py-2 outline-none font-mono"
            />
            <p className="text-[10px] text-zinc-500">Deixe vazio para &quot;Sob Consulta&quot;.</p>
          </div>

          {/* Categoria */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Categoria *
            </label>
            <input
              type="text"
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex: conectividade-satelite"
              className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded px-3 py-2 outline-none font-mono"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {["conectividade-satelite", "mobilidade-eletrica", "cases-protecao", "acessorios-cabos"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoria(c)}
                  className="text-[9px] font-mono text-zinc-400 hover:text-white bg-zinc-850 px-1.5 py-0.5 rounded"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Disponibilidade */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Status de Disponibilidade *
            </label>
            <select
              value={statusDisponibilidade}
              onChange={(e) => setStatusDisponibilidade(e.target.value as DisponibilidadeStatus)}
              className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded px-3 py-2 outline-none"
            >
              <option value="disponivel">Disponível para venda</option>
              <option value="indisponivel">Indisponível / Sob consulta</option>
            </select>
          </div>

          {/* Destaque e Ordem */}
          <div className="sm:col-span-6 flex items-center gap-3 pt-3">
            <label className="relative flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                className="w-4 h-4 rounded bg-dark-950 border-zinc-800 text-white focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-200">
                Produto em Destaque na Home
              </span>
            </label>
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={ordemExibicao}
              onChange={(e) => setOrdemExibicao(e.target.value)}
              placeholder="0"
              className="w-28 bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded px-3 py-2 outline-none font-mono"
            />
            <span className="text-[10px] text-zinc-500 ml-2">Menor número aparece primeiro.</span>
          </div>
        </div>
      </div>

      {/* Bloco 3: Textos e Descrições */}
      <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-300 border-b border-zinc-850 pb-2">
          3. Textos do Catálogo
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Descrição Curta * (Resumo para cards e metadados)
            </label>
            <textarea
              required
              rows={2}
              value={descricaoCurta}
              onChange={(e) => setDescricaoCurta(e.target.value)}
              placeholder="Resumo de 1 a 2 frases destacando os diferenciais do produto..."
              className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded p-3 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Descrição Completa * (Conteúdo da página individual)
            </label>
            <textarea
              required
              rows={5}
              value={descricaoCompleta}
              onChange={(e) => setDescricaoCompleta(e.target.value)}
              placeholder="Texto descritivo detalhado com informações de aplicação, diferenciais de uso e funcionalidades..."
              className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs sm:text-sm rounded p-3 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bloco 4: Gerenciamento de Mídia (Supabase Storage) */}
      <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-5">
        <div className="border-b border-zinc-850 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-300">
            4. Mídia do Produto (Supabase Storage)
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            Upload de imagem principal, galeria de fotos e vídeos organizados no bucket oficial <span className="text-zinc-400">product-media</span>.
          </p>
        </div>

        <MediaUploadSection
          productId={productId}
          mainImage={imagemPrincipal}
          onMainImageChange={setImagemPrincipal}
          galleryImages={galeriaImagens}
          onGalleryImagesChange={setGaleriaImagens}
          videos={videos}
          onVideosChange={setVideos}
        />
      </div>

      {/* Bloco 5: Especificações Técnicas (Construtor Chave/Valor) */}
      <div className="p-6 rounded-lg bg-dark-900 border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-300">
              5. Especificações Técnicas
            </h2>
            <p className="text-[11px] text-zinc-500">Pares de Nome | Valor exibidos na ficha técnica.</p>
          </div>
          <button
            type="button"
            onClick={addSpecRow}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white uppercase"
          >
            <Plus className="w-3 h-3" />
            <span>Adicionar Linha</span>
          </button>
        </div>

        <div className="space-y-2">
          {especificacoesList.map((spec, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={spec.chave}
                onChange={(e) => handleSpecChange(index, "chave", e.target.value)}
                placeholder="Nome (Ex: Potência, Autonomia, Grau IP)"
                className="w-1/2 bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs rounded px-3 py-2 outline-none font-mono"
              />
              <input
                type="text"
                value={spec.valor}
                onChange={(e) => handleSpecChange(index, "valor", e.target.value)}
                placeholder="Valor (Ex: 3000W, 90 km, IP67)"
                className="w-1/2 bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs rounded px-3 py-2 outline-none"
              />
              {especificacoesList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  className="p-2 rounded bg-zinc-850 hover:bg-red-950/60 text-zinc-400 hover:text-red-400"
                  title="Remover especificação"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botões Inferiores */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-850">
        <Link
          href="/admin/produtos"
          className="px-4 py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono uppercase tracking-wider"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando no Banco...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEdit ? "Atualizar Produto" : "Criar Produto"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
