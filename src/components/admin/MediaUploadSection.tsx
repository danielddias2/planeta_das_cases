"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  uploadOptimizedProductImage,
  uploadOptimizedProductVideo,
  deleteProductMedia,
  isSupabaseStorageUrl,
  validateMediaFile,
} from "@/lib/supabase/storage";
import { getThumbnailUrl, getVideoPosterUrl } from "@/lib/media/optimizer";
import { mediaConfig, formatBytes } from "@/config/media";
import {
  Upload,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Video,
  Star,
  ExternalLink,
  Link as LinkIcon,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface MediaUploadSectionProps {
  productId: string;
  mainImage: string;
  onMainImageChange: (url: string) => void;
  galleryImages: string[];
  onGalleryImagesChange: (urls: string[]) => void;
  videos: string[];
  onVideosChange: (urls: string[]) => void;
}

export function MediaUploadSection({
  productId,
  mainImage,
  onMainImageChange,
  galleryImages,
  onGalleryImagesChange,
  videos,
  onVideosChange,
}: MediaUploadSectionProps) {
  // Estados de upload e feedback
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState<{ current: number; total: number } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modos de entrada manual de URL
  const [showMainUrlInput, setShowMainUrlInput] = useState(false);
  const [externalGalleryUrl, setExternalGalleryUrl] = useState("");
  const [externalVideoUrl, setExternalVideoUrl] = useState("");

  // Refs para inputs de arquivo ocultos
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // ==========================================
  // 1. MANIPULAÇÃO DA IMAGEM PRINCIPAL
  // ==========================================
  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const validation = validateMediaFile(file, "image");
    if (!validation.valid) {
      showFeedback(validation.error || "Arquivo de imagem inválido.", true);
      if (mainInputRef.current) mainInputRef.current.value = "";
      return;
    }

    setIsUploadingMain(true);
    try {
      // 1. Otimiza e faz upload da versão WebP + Thumbnail
      const result = await uploadOptimizedProductImage(file, productId);

      // 2. Safe Replacement: se havia imagem anterior no Storage, remove após novo upload com sucesso
      if (mainImage && isSupabaseStorageUrl(mainImage) && mainImage !== result.url) {
        await deleteProductMedia(mainImage);
      }

      onMainImageChange(result.url);

      const metric = result.wasOptimized
        ? ` (${formatBytes(result.originalSize)} → ${formatBytes(result.optimizedSize)}, -${result.compressionRatio}%)`
        : "";
      showFeedback(`Imagem principal otimizada e salva com sucesso!${metric}`);
    } catch (err: any) {
      showFeedback(err.message || "Erro ao realizar upload da imagem principal.", true);
    } finally {
      setIsUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = "";
    }
  };

  const handleRemoveMainImage = async () => {
    if (!mainImage) return;

    const oldUrl = mainImage;
    onMainImageChange("");

    if (isSupabaseStorageUrl(oldUrl)) {
      await deleteProductMedia(oldUrl);
      showFeedback("Imagem principal removida do Supabase Storage.");
    } else {
      showFeedback("Imagem principal desvinculada.");
    }
  };

  // ==========================================
  // 2. MANIPULAÇÃO DA GALERIA DE IMAGENS
  // ==========================================
  const handleGalleryFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMessage(null);

    if (galleryImages.length + files.length > mediaConfig.limits.maxGalleryImagesCount) {
      showFeedback(
        `Limite máximo de ${mediaConfig.limits.maxGalleryImagesCount} imagens na galeria excedido.`,
        true
      );
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    // Validação prévia de todos os arquivos
    for (const file of files) {
      const validation = validateMediaFile(file, "image");
      if (!validation.valid) {
        showFeedback(`${file.name}: ${validation.error}`, true);
        if (galleryInputRef.current) galleryInputRef.current.value = "";
        return;
      }
    }

    setIsUploadingGallery(true);
    setGalleryProgress({ current: 0, total: files.length });

    const newUploadedUrls: string[] = [];
    let totalOrig = 0;
    let totalOpt = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        setGalleryProgress({ current: i + 1, total: files.length });
        const result = await uploadOptimizedProductImage(files[i], productId);
        newUploadedUrls.push(result.url);
        totalOrig += result.originalSize;
        totalOpt += result.optimizedSize;
      }

      onGalleryImagesChange([...galleryImages, ...newUploadedUrls]);

      const savedPercent =
        totalOrig > 0 ? Math.round(((totalOrig - totalOpt) / totalOrig) * 100) : 0;
      showFeedback(
        `${files.length} imagem(ns) otimizada(s) e adicionada(s) à galeria! (-${savedPercent}% de redução de tamanho)`
      );
    } catch (err: any) {
      showFeedback(err.message || "Erro ao enviar imagens da galeria.", true);
      if (newUploadedUrls.length > 0) {
        onGalleryImagesChange([...galleryImages, ...newUploadedUrls]);
      }
    } finally {
      setIsUploadingGallery(false);
      setGalleryProgress(null);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleAddExternalGalleryUrl = () => {
    const clean = externalGalleryUrl.trim();
    if (!clean) return;

    if (galleryImages.length >= mediaConfig.limits.maxGalleryImagesCount) {
      showFeedback(`Limite máximo de ${mediaConfig.limits.maxGalleryImagesCount} imagens atingido.`, true);
      return;
    }

    onGalleryImagesChange([...galleryImages, clean]);
    setExternalGalleryUrl("");
    showFeedback("URL externa adicionada à galeria.");
  };

  const handleRemoveGalleryImage = async (index: number) => {
    const targetUrl = galleryImages[index];
    const updated = galleryImages.filter((_, i) => i !== index);
    onGalleryImagesChange(updated);

    if (isSupabaseStorageUrl(targetUrl)) {
      await deleteProductMedia(targetUrl);
      showFeedback("Foto removida do Supabase Storage.");
    }
  };

  const handleSetAsMainImage = (galleryUrl: string, index: number) => {
    const oldMain = mainImage;
    onMainImageChange(galleryUrl);

    const updated = [...galleryImages];
    if (oldMain) {
      updated[index] = oldMain;
    } else {
      updated.splice(index, 1);
    }
    onGalleryImagesChange(updated);
    showFeedback("Imagem definida como principal.");
  };

  // ==========================================
  // 3. MANIPULAÇÃO DE VÍDEOS
  // ==========================================
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    if (videos.length >= mediaConfig.limits.maxVideosCount) {
      showFeedback(`Limite de ${mediaConfig.limits.maxVideosCount} vídeos por produto atingido.`, true);
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    const validation = validateMediaFile(file, "video");
    if (!validation.valid) {
      showFeedback(validation.error || "Arquivo de vídeo inválido.", true);
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    setIsUploadingVideo(true);
    try {
      const result = await uploadOptimizedProductVideo(file, productId);
      onVideosChange([...videos, result.url]);

      const posterInfo = result.hasPoster ? " Poster estático capturado automaticamente." : "";
      showFeedback(`Vídeo enviado com sucesso para o Supabase Storage!${posterInfo}`);
    } catch (err: any) {
      showFeedback(err.message || "Erro ao realizar upload do vídeo.", true);
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleAddExternalVideoUrl = () => {
    const clean = externalVideoUrl.trim();
    if (!clean) return;

    if (videos.length >= mediaConfig.limits.maxVideosCount) {
      showFeedback(`Limite de ${mediaConfig.limits.maxVideosCount} vídeos atingido.`, true);
      return;
    }

    onVideosChange([...videos, clean]);
    setExternalVideoUrl("");
    showFeedback("Vídeo externo adicionado.");
  };

  const handleRemoveVideo = async (index: number) => {
    const targetUrl = videos[index];
    const updated = videos.filter((_, i) => i !== index);
    onVideosChange(updated);

    if (isSupabaseStorageUrl(targetUrl)) {
      await deleteProductMedia(targetUrl);
      showFeedback("Vídeo e poster removidos do Supabase Storage.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas específicos da seção de mídia */}
      {errorMessage && (
        <div className="p-3 rounded bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}
      {successMessage && (
        <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEÇÃO 1: IMAGEM PRINCIPAL */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Imagem Principal *
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                <Zap className="w-2.5 h-2.5" />
                Pipeline WebP Ativo
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Redimensionada automaticamente para até {mediaConfig.optimization.imageMaxDimension}px com WebP de alta fidelidade.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMainUrlInput(!showMainUrlInput)}
            className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showMainUrlInput ? "Ocultar URL manual" : "Inserir URL manual"}</span>
          </button>
        </div>

        {/* Input manual de URL alternativa */}
        {showMainUrlInput && (
          <div className="p-3 rounded bg-dark-950 border border-zinc-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400">
              Inserir URL Direta (ex: Unsplash ou CDN externo):
            </span>
            <div className="flex gap-2">
              <input
                type="url"
                value={mainImage}
                onChange={(e) => onMainImageChange(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-dark-900 border border-zinc-800 text-white text-xs rounded px-3 py-1.5 outline-none font-mono"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          {/* Card de Preview da Imagem Principal */}
          <div className="sm:col-span-5">
            <div className="relative aspect-[4/3] rounded-lg bg-dark-950 border border-zinc-800 overflow-hidden flex flex-col items-center justify-center group">
              {mainImage ? (
                <>
                  <Image
                    src={mainImage}
                    alt="Imagem Principal do Produto"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                  />
                  {/* Badges de Origem e Otimização */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-black/80 text-white backdrop-blur-sm border border-zinc-700">
                      {isSupabaseStorageUrl(mainImage) ? "Storage" : "URL Externa"}
                    </span>
                    {mainImage.includes(".webp") && (
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 backdrop-blur-sm border border-emerald-700/60">
                        Otimizada (WebP)
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <span className="text-xs text-zinc-500 font-mono">Nenhuma imagem selecionada</span>
                </div>
              )}

              {/* Overlay de carregamento */}
              {isUploadingMain && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 z-20">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span className="text-xs font-mono uppercase text-zinc-200">Otimizando e enviando...</span>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação para Imagem Principal */}
          <div className="sm:col-span-7 space-y-3">
            <input
              ref={mainInputRef}
              type="file"
              accept={mediaConfig.images.allowedExtensions.join(",")}
              onChange={handleMainFileUpload}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isUploadingMain}
                onClick={() => mainInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isUploadingMain ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{mainImage ? "Substituir com Otimização" : "Upload & Otimizar"}</span>
                  </>
                )}
              </button>

              {mainImage && (
                <button
                  type="button"
                  disabled={isUploadingMain}
                  onClick={handleRemoveMainImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-red-950/40 hover:bg-red-950/80 border border-red-800/40 text-red-300 text-xs font-mono uppercase transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover</span>
                </button>
              )}
            </div>

            <div className="p-3 rounded bg-dark-950 border border-zinc-850 space-y-1 text-[11px] font-mono text-zinc-400">
              <div>• Entrada: JPG, PNG, WebP, AVIF até {formatBytes(mediaConfig.limits.maxImageSizeBytes)}</div>
              <div>• Saída: WebP ({mediaConfig.optimization.imageMaxDimension}px) + Thumbnail ({mediaConfig.optimization.thumbnailMaxDimension}px)</div>
              <div>• Destino: products/{productId.slice(0, 8)}.../images/</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEÇÃO 2: GALERIA DE FOTOS */}
      {/* ========================================================= */}
      <div className="space-y-3 pt-4 border-t border-zinc-850">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Galeria de Imagens Adicionais
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {galleryImages.length} de {mediaConfig.limits.maxGalleryImagesCount} fotos adicionadas &bull; compressão WebP automática
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept={mediaConfig.images.allowedExtensions.join(",")}
              onChange={handleGalleryFilesUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploadingGallery || galleryImages.length >= mediaConfig.limits.maxGalleryImagesCount}
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUploadingGallery ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {galleryProgress
                      ? `Otimizando ${galleryProgress.current}/${galleryProgress.total}...`
                      : "Processando..."}
                  </span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Fotos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input para adicionar URL externa na galeria */}
        <div className="flex gap-2">
          <input
            type="url"
            value={externalGalleryUrl}
            onChange={(e) => setExternalGalleryUrl(e.target.value)}
            placeholder="Ou cole uma URL externa de imagem (https://...)"
            className="flex-1 bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs rounded px-3 py-2 outline-none font-mono"
          />
          <button
            type="button"
            onClick={handleAddExternalGalleryUrl}
            disabled={!externalGalleryUrl.trim()}
            className="px-3 py-2 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 text-xs font-mono uppercase tracking-wider disabled:opacity-40 cursor-pointer"
          >
            Adicionar URL
          </button>
        </div>

        {/* Grid de Miniaturas da Galeria */}
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
            {galleryImages.map((imgUrl, idx) => {
              const thumbUrl = getThumbnailUrl(imgUrl);
              const isOptimized = imgUrl.includes(".webp");

              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="relative aspect-square rounded-md bg-dark-950 border border-zinc-800 overflow-hidden group"
                >
                  <Image
                    src={thumbUrl}
                    alt={`Galeria foto ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 150px"
                    className="object-cover"
                  />

                  {/* Badges de Origem e WebP */}
                  <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                    <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/80 text-zinc-300 backdrop-blur-sm border border-zinc-700">
                      {isSupabaseStorageUrl(imgUrl) ? "Storage" : "URL"}
                    </span>
                    {isOptimized && (
                      <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 backdrop-blur-sm border border-emerald-700/60">
                        WebP
                      </span>
                    )}
                  </div>

                  {/* Barra de Ações ao Passar o Mouse */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    <button
                      type="button"
                      onClick={() => handleSetAsMainImage(imgUrl, idx)}
                      title="Definir como Imagem Principal"
                      className="w-full py-1 px-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[9px] font-mono uppercase text-zinc-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Star className="w-2.5 h-2.5 text-amber-400" />
                      <span>Principal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      title="Remover Imagem"
                      className="w-full py-1 px-1.5 rounded bg-red-950/70 hover:bg-red-900 text-[9px] font-mono uppercase text-red-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded border border-dashed border-zinc-800 text-center text-xs text-zinc-500 font-mono">
            Nenhuma foto adicional na galeria deste produto.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SEÇÃO 3: VÍDEOS */}
      {/* ========================================================= */}
      <div className="space-y-3 pt-4 border-t border-zinc-850">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Vídeos de Demonstração
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {videos.length} de {mediaConfig.limits.maxVideosCount} vídeos &bull; poster automático gerado via Canvas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={videoInputRef}
              type="file"
              accept={mediaConfig.videos.allowedExtensions.join(",")}
              onChange={handleVideoFileUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploadingVideo || videos.length >= mediaConfig.limits.maxVideosCount}
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUploadingVideo ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando vídeo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload de Vídeo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input para adicionar URL externa (YouTube/Vimeo) */}
        <div className="flex gap-2">
          <input
            type="url"
            value={externalVideoUrl}
            onChange={(e) => setExternalVideoUrl(e.target.value)}
            placeholder="Ou cole uma URL externa (ex: https://www.youtube.com/watch?v=...)"
            className="flex-1 bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white text-xs rounded px-3 py-2 outline-none font-mono"
          />
          <button
            type="button"
            onClick={handleAddExternalVideoUrl}
            disabled={!externalVideoUrl.trim()}
            className="px-3 py-2 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 text-xs font-mono uppercase tracking-wider disabled:opacity-40 cursor-pointer"
          >
            Adicionar Vídeo
          </button>
        </div>

        {/* Lista de Vídeos com Preview e Poster */}
        {videos.length > 0 ? (
          <div className="space-y-3 pt-2">
            {videos.map((vidUrl, idx) => {
              const isStorage = isSupabaseStorageUrl(vidUrl);
              const isDirectVideo = isStorage || vidUrl.match(/\.(mp4|webm|mov|ogg)($|\?)/i);
              const posterUrl = isStorage ? getVideoPosterUrl(vidUrl) : null;

              return (
                <div
                  key={`${vidUrl}-${idx}`}
                  className="p-3.5 rounded-lg bg-dark-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isDirectVideo ? (
                      <div className="w-28 h-18 bg-black rounded overflow-hidden shrink-0 border border-zinc-800">
                        <video
                          src={vidUrl}
                          poster={posterUrl || undefined}
                          className="w-full h-full object-cover"
                          preload="none"
                          controls
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-zinc-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white font-medium">
                          Vídeo #{idx + 1}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-300 border border-zinc-750">
                          {isStorage ? "Supabase Storage" : "Externo"}
                        </span>
                        {posterUrl && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                            Poster WebP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5" title={vidUrl}>
                        {vidUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={vidUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
                      title="Abrir vídeo em nova aba"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(idx)}
                      className="p-2 rounded bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-800/40 cursor-pointer"
                      title="Remover vídeo e poster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded border border-dashed border-zinc-800 text-center text-xs text-zinc-500 font-mono">
            Nenhum vídeo cadastrado para este produto.
          </div>
        )}
      </div>
    </div>
  );
}
