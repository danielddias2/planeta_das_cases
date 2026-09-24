/**
 * Configuração Centralizada do Sistema de Mídia (Imagens e Vídeos)
 * Elimina números mágicos e padroniza limites, formatos permitidos,
 * parâmetros de otimização de imagens e convenções de pastas no Storage.
 */

export const mediaConfig = {
  // Nome do Bucket oficial no Supabase Storage
  bucketName: "product-media",

  // Estrutura de pastas por produto:
  // products/{productId}/images/{filename}.webp
  // products/{productId}/images/thumbnails/{filename}-thumb.webp
  // products/{productId}/videos/{filename}.mp4
  // products/{productId}/videos/posters/{filename}-poster.webp
  folders: {
    images: "images",
    thumbnails: "images/thumbnails",
    videos: "videos",
    posters: "videos/posters",
  },

  // Limites máximos de tamanho de arquivo bruto (em bytes) aceitos no upload
  limits: {
    maxImageSizeBytes: 10 * 1024 * 1024, // 10 MB por imagem bruta de entrada
    maxVideoSizeBytes: 80 * 1024 * 1024, // 80 MB por vídeo bruto de entrada
    maxGalleryImagesCount: 15,          // Máximo de imagens na galeria
    maxVideosCount: 5,                  // Máximo de vídeos por produto
  },

  // Parâmetros de Otimização e Compressão (Etapa 5B)
  optimization: {
    // Dimensões máximas (em pixels no maior lado) preservando proporção original (aspect-fit)
    imageMaxDimension: 1920,        // Imagem principal e galeria em alta resolução
    thumbnailMaxDimension: 400,     // Miniaturas de galeria, cards e listas admin
    videoPosterMaxDimension: 1280,  // Poster estático do vídeo

    // Qualidade de compressão WebP (0.0 a 1.0)
    // 0.82 proporciona fidelidade visual premium com alta taxa de compressão sem artefatos
    imageQuality: 0.82,
    thumbnailQuality: 0.80,
    videoPosterQuality: 0.80,

    // Formato moderno de saída preferencial
    targetMimeType: "image/webp",
    targetExtension: ".webp",
  },

  // Formatos e MIME types aceitos para imagens web
  images: {
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
      "image/svg+xml",
    ],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"],
  },

  // Formatos e MIME types aceitos para vídeos modernos
  videos: {
    allowedMimeTypes: [
      "video/mp4",
      "video/webm",
      "video/quicktime", // Apple .mov
      "video/ogg",
    ],
    allowedExtensions: [".mp4", ".webm", ".mov", ".ogg"],
  },
};

/**
 * Utilitário de formatação de bytes para exibição amigável (ex: 2.5 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
