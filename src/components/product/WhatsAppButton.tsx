import React from "react";
import { MessageCircle } from "lucide-react";
import { generateProductWhatsAppLink, WhatsAppLinkOptions } from "@/lib/whatsapp/generator";
import { Produto } from "@/types/product";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  product: Pick<Produto, "id" | "nome" | "codigoReferencia" | "preco">;
  label?: string;
  variant?: "primary" | "secondary";
  options?: WhatsAppLinkOptions;
}

export function WhatsAppButton({
  product,
  label = "Tenho Interesse",
  variant = "primary",
  className,
  options,
  ...props
}: WhatsAppButtonProps) {
  // Gera dinamicamente o link do WhatsApp com a mensagem contextualizada para este produto específico
  const whatsappUrl = generateProductWhatsAppLink(product, options);

  const baseStyles =
    "inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors duration-150 cursor-pointer";

  const variantStyles = {
    primary:
      "bg-[#107c41] hover:bg-[#158f4c] text-white shadow-none",
    secondary:
      "bg-dark-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700",
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      <MessageCircle className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </a>
  );
}
