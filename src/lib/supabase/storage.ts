import { getSupabaseBrowserClient } from "./client";
import { mediaConfig, formatBytes } from "@/config/media";
import {
  optimizeImageFile,
  generateVideoPoster,
  getThumbnailUrl,
  getVideoPosterUrl,
} from "@/lib/media/optimizer";

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  url: string;
  path: string;
}

export interface OptimizedImageUploadResult extends UploadResult {
  thumbnailUrl: string;
  thumbnailPath?: string;
  wasOptimized: boolean;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

export interface OptimizedVideoUploadResult extends UploadResult {
  posterUrl?: string;
  posterPath?: string;
  hasPoster: boolean;
}

/**
 * Valida tipo MIME, extensão e tamanho máximo do arquivo conforme mediaConfig.
 */
export function validateMediaFile(file: File, type: "image" | "video"): MediaValidationResult {
  if (!file) {
    return { valid: false, error: "Nenhum arquivo selecionado." };
  }

  const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;

  if (type === "image") {
    const isValidMime = mediaConfig.images.allowedMimeTypes.includes(file.type);
    const isValidExt = mediaConfig.images.allowedExtensions.includes(extension);

    if (!isValidMime && !isValidExt) {
      return {
        valid: false,
        error: `Formato de imagem não suportado (${file.type || extension}). Formatos permitidos: ${mediaConfig.images.allowedExtensions.join(", ")}`,
      };
    }

    if (file.size > mediaConfig.limits.maxImageSizeBytes) {
      return {
        valid: false,
        error: `A imagem excede o tamanho máximo de ${formatBytes(mediaConfig.limits.maxImageSizeBytes)} (arquivo atual: ${formatBytes(file.size)}).`,
      };
    }
  } else if (type === "video") {
    const isValidMime = mediaConfig.videos.allowedMimeTypes.includes(file.type);
    const isValidExt = mediaConfig.videos.allowedExtensions.includes(extension);

    if (!isValidMime && !isValidExt) {
      return {
        valid: false,
        error: `Formato de vídeo não suportado (${file.type || extension}). Formatos permitidos: ${mediaConfig.videos.allowedExtensions.join(", ")}`,
      };
    }

    if (file.size > mediaConfig.limits.maxVideoSizeBytes) {
      return {
        valid: false,
        error: `O vídeo excede o tamanho máximo de ${formatBytes(mediaConfig.limits.maxVideoSizeBytes)} (arquivo atual: ${formatBytes(file.size)}).`,
      };
    }
  }

  return { valid: true };
}

/**
 * Verifica se uma dada URL pertence ao Supabase Storage.
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("/storage/v1/object/public/") ||
    url.includes(`${mediaConfig.bucketName}/products/`)
  );
}

/**
 * Extrai o bucket e o caminho relativo do arquivo no Supabase Storage a partir da URL pública.
 * Retorna null se for uma URL externa (ex: Unsplash, YouTube).
 */
export function getStoragePathFromUrl(url: string): { bucket: string; path: string } | null {
  if (!isSupabaseStorageUrl(url)) return null;

  try {
    const publicPattern = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
    const match = url.match(publicPattern);

    if (match && match[1] && match[2]) {
      return {
        bucket: match[1],
        path: decodeURIComponent(match[2]),
      };
    }

    const fallbackPattern = new RegExp(`${mediaConfig.bucketName}\\/(products\\/.+)$`);
    const fallbackMatch = url.match(fallbackPattern);
    if (fallbackMatch && fallbackMatch[1]) {
      return {
        bucket: mediaConfig.bucketName,
        path: decodeURIComponent(fallbackMatch[1]),
      };
    }
  } catch {
    // URL inválida ou mal formatada
  }

  return null;
}

/**
 * Sanitiza o nome do arquivo para padrão web seguro (letras, números, hífens e pontos).
 */
function sanitizeFileName(name: string): string {
  const parts = name.split(".");
  const ext = parts.pop()?.toLowerCase() || "";
  const base = parts.join(".");

  const cleanBase = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${cleanBase || "file"}.${ext}`;
}

/**
 * Realiza upload direto sem otimização (mantido para compatibilidade).
 */
export async function uploadProductMedia(
  file: File,
  productId: string,
  folder: "images" | "videos"
): Promise<UploadResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado. Verifique as credenciais no .env.local.");
  }

  const validation = validateMediaFile(file, folder === "images" ? "image" : "video");
  if (!validation.valid) {
    throw new Error(validation.error || "Arquivo de mídia inválido.");
  }

  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const safeFileName = `${timestamp}-${randomSuffix}-${cleanName}`;
  const filePath = `products/${productId}/${folder}/${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(mediaConfig.bucketName)
    .upload(filePath, file, {
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Falha no upload para o Supabase Storage: ${uploadError.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(mediaConfig.bucketName)
    .getPublicUrl(filePath);

  if (!publicData || !publicData.publicUrl) {
    throw new Error("Não foi possível gerar a URL pública do arquivo após o upload.");
  }

  return {
    url: publicData.publicUrl,
    path: filePath,
  };
}

/**
 * Pipeline de Otimização e Upload de Imagens (Etapa 5B):
 * 1. Valida o arquivo original de entrada
 * 2. Processa a imagem no navegador (redimensionamento max 1920px, compressão WebP 82%)
 * 3. Gera thumbnail proporcional (max 400px, WebP 80%)
 * 4. Faz upload seguro da versão otimizada e da miniatura
 * 5. Retorna URLs públicas, paths e métricas de compressão
 */
export async function uploadOptimizedProductImage(
  file: File,
  productId: string
): Promise<OptimizedImageUploadResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado. Verifique as credenciais no .env.local.");
  }

  // 1. Validação de formato e tamanho máximo do arquivo de entrada
  const validation = validateMediaFile(file, "image");
  if (!validation.valid) {
    throw new Error(validation.error || "Arquivo de imagem inválido.");
  }

  // 2. Processamento client-side via Canvas API
  const optimization = await optimizeImageFile(file);

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();

  const extension = optimization.wasOptimized
    ? mediaConfig.optimization.targetExtension
    : `.${file.name.split(".").pop()?.toLowerCase() || "bin"}`;

  const mimeType = optimization.wasOptimized
    ? mediaConfig.optimization.targetMimeType
    : file.type;

  // Path principal da imagem otimizada
  const mainFileName = `${timestamp}-${randomSuffix}-${baseName}${extension}`;
  const mainPath = `products/${productId}/${mediaConfig.folders.images}/${mainFileName}`;

  // 3. Upload da imagem otimizada
  const { error: mainUploadError } = await supabase.storage
    .from(mediaConfig.bucketName)
    .upload(mainPath, optimization.optimizedBlob, {
      contentType: mimeType,
      cacheControl: "31536000", // 1 ano de cache imutável
      upsert: false,
    });

  if (mainUploadError) {
    throw new Error(`Falha no upload da imagem otimizada: ${mainUploadError.message}`);
  }

  const { data: mainPublicData } = supabase.storage
    .from(mediaConfig.bucketName)
    .getPublicUrl(mainPath);

  const mainUrl = mainPublicData?.publicUrl || "";

  // 4. Upload da miniatura (thumbnail), se gerada
  let thumbnailUrl = mainUrl;
  let thumbPath: string | undefined = undefined;

  if (optimization.thumbnailBlob) {
    const thumbFileName = `${timestamp}-${randomSuffix}-${baseName}-thumb${extension}`;
    thumbPath = `products/${productId}/${mediaConfig.folders.thumbnails}/${thumbFileName}`;

    try {
      const { error: thumbUploadError } = await supabase.storage
        .from(mediaConfig.bucketName)
        .upload(thumbPath, optimization.thumbnailBlob, {
          contentType: mimeType,
          cacheControl: "31536000",
          upsert: false,
        });

      if (!thumbUploadError) {
        const { data: thumbPublicData } = supabase.storage
          .from(mediaConfig.bucketName)
          .getPublicUrl(thumbPath);
        if (thumbPublicData?.publicUrl) {
          thumbnailUrl = thumbPublicData.publicUrl;
        }
      }
    } catch (err) {
      console.warn("[uploadOptimizedProductImage] Falha ao enviar thumbnail, usando URL principal:", err);
    }
  }

  return {
    url: mainUrl,
    thumbnailUrl,
    path: mainPath,
    thumbnailPath: thumbPath,
    wasOptimized: optimization.wasOptimized,
    originalSize: optimization.originalSize,
    optimizedSize: optimization.optimizedSize,
    compressionRatio: optimization.compressionRatio,
  };
}

/**
 * Pipeline de Upload de Vídeo com Geração Automática de Poster (Etapa 5B):
 * 1. Valida o arquivo de vídeo original
 * 2. Tenta extrair frame de poster (0.5s) em WebP via Canvas no navegador
 * 3. Envia o vídeo para o Supabase Storage
 * 4. Se o poster foi gerado, envia o poster para a subpasta /videos/posters/
 */
export async function uploadOptimizedProductVideo(
  file: File,
  productId: string
): Promise<OptimizedVideoUploadResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase não configurado. Verifique as credenciais no .env.local.");
  }

  const validation = validateMediaFile(file, "video");
  if (!validation.valid) {
    throw new Error(validation.error || "Arquivo de vídeo inválido.");
  }

  // Tenta gerar poster estático em segundo plano sem bloquear
  let posterBlob: Blob | null = null;
  try {
    posterBlob = await generateVideoPoster(file);
  } catch (err) {
    console.warn("[uploadOptimizedProductVideo] Falha ao gerar poster de vídeo:", err);
  }

  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const safeVideoName = `${timestamp}-${randomSuffix}-${cleanName}`;
  const videoPath = `products/${productId}/${mediaConfig.folders.videos}/${safeVideoName}`;

  // Upload do arquivo de vídeo
  const { error: videoError } = await supabase.storage
    .from(mediaConfig.bucketName)
    .upload(videoPath, file, {
      contentType: file.type || "video/mp4",
      cacheControl: "31536000",
      upsert: false,
    });

  if (videoError) {
    throw new Error(`Falha no upload do vídeo: ${videoError.message}`);
  }

  const { data: videoPublicData } = supabase.storage
    .from(mediaConfig.bucketName)
    .getPublicUrl(videoPath);

  const videoUrl = videoPublicData?.publicUrl || "";

  // Upload do poster estático, se obtido com sucesso
  let posterUrl: string | undefined = undefined;
  let posterPath: string | undefined = undefined;

  if (posterBlob) {
    const baseName = cleanName.replace(/\.[^/.]+$/, "");
    const posterFileName = `${timestamp}-${randomSuffix}-${baseName}-poster.webp`;
    posterPath = `products/${productId}/${mediaConfig.folders.posters}/${posterFileName}`;

    try {
      const { error: posterError } = await supabase.storage
        .from(mediaConfig.bucketName)
        .upload(posterPath, posterBlob, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: false,
        });

      if (!posterError) {
        const { data: posterPublicData } = supabase.storage
          .from(mediaConfig.bucketName)
          .getPublicUrl(posterPath);
        if (posterPublicData?.publicUrl) {
          posterUrl = posterPublicData.publicUrl;
        }
      }
    } catch (err) {
      console.warn("[uploadOptimizedProductVideo] Falha ao enviar poster:", err);
    }
  }

  return {
    url: videoUrl,
    posterUrl,
    path: videoPath,
    posterPath,
    hasPoster: Boolean(posterUrl),
  };
}

/**
 * Remove um arquivo de mídia do Supabase Storage.
 * Remove também thumbnail ou poster correspondentes se existirem.
 * Se a URL for externa (ex: Unsplash, link HTTP genérico), a função ignora com segurança.
 */
export async function deleteProductMedia(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath) return true;

  if (!isSupabaseStorageUrl(urlOrPath) && !urlOrPath.startsWith("products/")) {
    return true;
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    console.warn("[deleteProductMedia] Supabase client não disponível para remoção.");
    return false;
  }

  let storagePath: string | null = null;

  if (urlOrPath.startsWith("products/")) {
    storagePath = urlOrPath;
  } else {
    const parsed = getStoragePathFromUrl(urlOrPath);
    if (parsed) {
      storagePath = parsed.path;
    }
  }

  if (!storagePath) {
    return true;
  }

  const filesToDelete = [storagePath];

  // Se for imagem, tenta também remover o thumbnail correspondente
  if (storagePath.includes("/images/") && !storagePath.includes("/thumbnails/")) {
    const thumbPath = storagePath.replace("/images/", "/images/thumbnails/").replace(/\.webp$/, "-thumb.webp");
    filesToDelete.push(thumbPath);
  }

  // Se for vídeo, tenta também remover o poster correspondente
  if (storagePath.includes("/videos/") && !storagePath.includes("/posters/")) {
    const posterPath = storagePath
      .replace("/videos/", "/videos/posters/")
      .replace(/\.(mp4|webm|mov|ogg)$/i, "-poster.webp");
    filesToDelete.push(posterPath);
  }

  try {
    const { error } = await supabase.storage
      .from(mediaConfig.bucketName)
      .remove(filesToDelete);

    if (error) {
      console.warn(`[deleteProductMedia] Aviso ao remover arquivos no Storage:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`[deleteProductMedia] Falha inesperada ao remover arquivos:`, err);
    return false;
  }
}
