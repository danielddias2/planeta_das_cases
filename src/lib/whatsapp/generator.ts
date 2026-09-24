import { siteConfig } from "@/config/site";
import { formatCurrency } from "@/lib/utils";
import { Produto } from "@/types/product";

export interface WhatsAppLinkOptions {
  customMessage?: string;
  customPhoneNumber?: string;
}

/**
 * Remove caracteres não numéricos do telefone para garantir URL válida
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Gera um link de WhatsApp contextualizado para um produto específico.
 * Utiliza o modelo configurado em siteConfig.whatsappTemplates.productInquiry
 * ou um customMessage opcional.
 */
export function generateProductWhatsAppLink(
  product: Pick<Produto, "id" | "nome" | "codigoReferencia" | "preco">,
  options?: WhatsAppLinkOptions
): string {
  const phone = sanitizePhoneNumber(
    options?.customPhoneNumber || siteConfig.contact.whatsappNumber
  );

  let message: string;

  if (options?.customMessage) {
    message = options.customMessage;
  } else {
    const precoFormatted = product.preco ? formatCurrency(product.preco) : undefined;
    message = siteConfig.whatsappTemplates.productInquiry({
      nome: product.nome,
      id: product.id,
      codigoReferencia: product.codigoReferencia,
      precoFormatted,
    });
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Gera um link institucional geral de WhatsApp
 */
export function generateGeneralWhatsAppLink(customMessage?: string): string {
  const phone = sanitizePhoneNumber(siteConfig.contact.whatsappNumber);
  const message = customMessage || siteConfig.whatsappTemplates.generalInquiry();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Gera um link de WhatsApp para uma categoria específica
 */
export function generateCategoryWhatsAppLink(categoriaNome: string): string {
  const phone = sanitizePhoneNumber(siteConfig.contact.whatsappNumber);
  const message = siteConfig.whatsappTemplates.categoryInquiry(categoriaNome);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
