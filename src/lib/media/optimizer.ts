import { mediaConfig } from "@/config/media";

export interface OptimizedImageResult {
  optimizedBlob: Blob;
  thumbnailBlob: Blob | null;
  width: number;
  height: number;
  format: string;
  wasOptimized: boolean;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number; // Porcentagem de redução (ex: 85 para 85% de redução)
}

/**
 * Calcula dimensões preservando proporção original (aspect-fit)
 * sem distorcer e sem redimensionar imagens menores que o limite.
 */
export function calculateAspectFit(
  origWidth: number,
  origHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (origWidth <= 0 || origHeight <= 0) {
    return { width: maxDimension, height: maxDimension };
  }

  // Se a imagem já for menor ou igual à dimensão máxima, preserva as dimensões originais
  if (origWidth <= maxDimension && origHeight <= maxDimension) {
    return { width: origWidth, height: origHeight };
  }

  if (origWidth > origHeight) {
    const width = maxDimension;
    const height = Math.max(1, Math.round((origHeight * maxDimension) / origWidth));
    return { width, height };
  } else {
    const height = maxDimension;
    const width = Math.max(1, Math.round((origWidth * maxDimension) / origHeight));
    return { width, height };
  }
}

/**
 * Renderiza uma fonte gráfica para um Canvas e exporta em Blob WebP com alta fidelidade.
 */
function renderCanvasToBlob(
  source: CanvasImageSource,
  targetWidth: number,
  targetHeight: number,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        throw new Error("Contexto 2D do Canvas não disponível no navegador.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          // Limpeza do canvas
          canvas.width = 0;
          canvas.height = 0;
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Falha ao exportar imagem do Canvas."));
          }
        },
        mimeType,
        quality
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Pipeline de Otimização de Imagens no Navegador:
 * 1. Respeita SVGs e GIFs animados (mantém originais para preservar vetores e animações)
 * 2. Carrega raster (JPG, PNG, WebP, AVIF) via ImageBitmap ou Image nativo
 * 3. Redimensiona para max 1920px mantendo aspect ratio
 * 4. Converte para WebP 82% de qualidade
 * 5. Gera thumbnail proporcional de max 400px a 80% de qualidade
 * 6. Fallback seguro: se falhar o processamento, retorna o arquivo original sem quebrar o upload
 */
export async function optimizeImageFile(file: File): Promise<OptimizedImageResult> {
  const originalSize = file.size;

  // 1. SVGs e GIFs não devem ser achatados em canvas estático
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return {
      optimizedBlob: file,
      thumbnailBlob: null,
      width: 0,
      height: 0,
      format: file.type,
      wasOptimized: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0,
    };
  }

  // Apenas executa no ambiente do cliente (navegador)
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      optimizedBlob: file,
      thumbnailBlob: null,
      width: 0,
      height: 0,
      format: file.type,
      wasOptimized: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0,
    };
  }

  try {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let imageSource: CanvasImageSource;
    let cleanupFn = () => {};

    if ("createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file);
      sourceWidth = bitmap.width;
      sourceHeight = bitmap.height;
      imageSource = bitmap;
      cleanupFn = () => bitmap.close();
    } else {
      // Fallback para elementos Image clássicos
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Falha ao carregar imagem no navegador."));
        img.src = objectUrl;
      });
      sourceWidth = img.naturalWidth;
      sourceHeight = img.naturalHeight;
      imageSource = img;
      cleanupFn = () => URL.revokeObjectURL(objectUrl);
    }

    // Calcula dimensões para imagem principal e galeria (max 1920px)
    const { width: optWidth, height: optHeight } = calculateAspectFit(
      sourceWidth,
      sourceHeight,
      mediaConfig.optimization.imageMaxDimension
    );

    // Gera versão otimizada principal em WebP
    const optimizedBlob = await renderCanvasToBlob(
      imageSource,
      optWidth,
      optHeight,
      mediaConfig.optimization.targetMimeType,
      mediaConfig.optimization.imageQuality
    );

    // Calcula dimensões para miniatura / thumbnail (max 400px)
    const { width: thumbWidth, height: thumbHeight } = calculateAspectFit(
      sourceWidth,
      sourceHeight,
      mediaConfig.optimization.thumbnailMaxDimension
    );

    // Gera thumbnail em WebP
    const thumbnailBlob = await renderCanvasToBlob(
      imageSource,
      thumbWidth,
      thumbHeight,
      mediaConfig.optimization.targetMimeType,
      mediaConfig.optimization.thumbnailQuality
    );

    cleanupFn();

    const optimizedSize = optimizedBlob.size;
    const compressionRatio =
      originalSize > optimizedSize
        ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
        : 0;

    return {
      optimizedBlob,
      thumbnailBlob,
      width: optWidth,
      height: optHeight,
      format: mediaConfig.optimization.targetMimeType,
      wasOptimized: true,
      originalSize,
      optimizedSize,
      compressionRatio,
    };
  } catch (err) {
    console.warn(
      "[optimizeImageFile] Falha no processamento de imagem em Canvas. Utilizando arquivo original como fallback seguro:",
      err
    );
    return {
      optimizedBlob: file,
      thumbnailBlob: null,
      width: 0,
      height: 0,
      format: file.type,
      wasOptimized: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0,
    };
  }
}

/**
 * Gera automaticamente um poster estático WebP a partir do primeiro frame (ou 0.5s) de um vídeo.
 * Executado diretamente no navegador do administrador sem demandar FFmpeg ou microserviços externos.
 * Se o vídeo não puder ser decodificado pelo navegador, resolve com null sem interromper o upload do vídeo.
 */
export async function generateVideoPoster(videoFile: File): Promise<Blob | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  return new Promise((resolve) => {
    let hasResolved = false;
    let objectUrl = "";

    const finish = (blob: Blob | null) => {
      if (hasResolved) return;
      hasResolved = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(blob);
    };

    // Timeout de segurança (4 segundos): evita qualquer travamento se o codec não responder
    const timeout = setTimeout(() => {
      finish(null);
    }, 4000);

    try {
      const video = document.createElement("video");
      objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";

      video.onloadedmetadata = () => {
        // Busca um frame aos 0.5 segundos (ou início se o vídeo for muito curto)
        const targetTime = video.duration > 1 ? 0.5 : 0.1;
        video.currentTime = targetTime;
      };

      video.onseeked = async () => {
        clearTimeout(timeout);
        try {
          const origWidth = video.videoWidth;
          const origHeight = video.videoHeight;

          if (!origWidth || !origHeight) {
            video.remove();
            return finish(null);
          }

          const { width, height } = calculateAspectFit(
            origWidth,
            origHeight,
            mediaConfig.optimization.videoPosterMaxDimension
          );

          const posterBlob = await renderCanvasToBlob(
            video,
            width,
            height,
            mediaConfig.optimization.targetMimeType,
            mediaConfig.optimization.videoPosterQuality
          );

          video.remove();
          finish(posterBlob);
        } catch {
          video.remove();
          finish(null);
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        video.remove();
        finish(null);
      };
    } catch {
      clearTimeout(timeout);
      finish(null);
    }
  });
}

/**
 * Obtém a URL da miniatura (thumbnail) correspondente a uma imagem no Supabase Storage.
 * Se a URL for externa ou não seguir o padrão de thumbnail gerado, retorna a própria URL.
 */
export function getThumbnailUrl(imageUrl: string): string {
  if (!imageUrl || typeof imageUrl !== "string") return imageUrl;

  // Se já for uma thumbnail, retorna como está
  if (imageUrl.includes("/thumbnails/")) return imageUrl;

  // Se for uma imagem do Supabase Storage no padrão /images/{id}.webp
  const pattern = /\/storage\/v1\/object\/public\/([^/]+)\/(products\/[^/]+\/images)\/([^/]+)\.webp$/;
  const match = imageUrl.match(pattern);

  if (match) {
    const bucket = match[1];
    const basePath = match[2];
    const fileId = match[3];
    return imageUrl.replace(
      `${basePath}/${fileId}.webp`,
      `${basePath}/thumbnails/${fileId}-thumb.webp`
    );
  }

  return imageUrl;
}

/**
 * Obtém a URL do poster estático correspondente a um vídeo no Supabase Storage.
 * Retorna null se não houver convenção de poster ou se for um vídeo externo (YouTube/Vimeo).
 */
export function getVideoPosterUrl(videoUrl: string): string | null {
  if (!videoUrl || typeof videoUrl !== "string") return null;

  const pattern = /\/storage\/v1\/object\/public\/([^/]+)\/(products\/[^/]+\/videos)\/([^/]+)\.(mp4|webm|mov|ogg)$/i;
  const match = videoUrl.match(pattern);

  if (match) {
    const basePath = match[2];
    const fileId = match[3];
    const ext = match[4];
    return videoUrl.replace(
      `${basePath}/${fileId}.${ext}`,
      `${basePath}/posters/${fileId}-poster.webp`
    );
  }

  return null;
}
