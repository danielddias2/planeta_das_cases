export const siteConfig = {
  name: "Planeta das Cases",
  shortName: "Planeta das Cases",
  description: "Catálogo comercial e apresentação tecnológica de produtos de conectividade, mobilidade elétrica e proteção.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  // DADOS PROVISÓRIOS DE CONTATO E ATENDIMENTO PARA DESENVOLVIMENTO
  // (Substituir pelos dados oficiais da loja quando fornecidos)
  contact: {
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999", // Apenas dígitos com DDI e DDD
    phoneDisplay: "(11) 99999-9999",
    email: "contato@planetadascases.com.br", // Provisório
    address: {
      isProvisional: true, // Indicador de conteúdo temporário
      street: "Av. Paulista, 1000 - Loja 42 (Endereço Provisório)",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      cep: "01310-100",
      country: "Brasil",
    },
    businessHours: "Segunda a Sexta: 09h às 19h | Sábado: 09h às 14h (Provisório)",
  },

  // Templates de mensagens para WhatsApp (Dinâmicos e configuráveis)
  whatsappTemplates: {
    productInquiry: (product: { nome: string; id: string; codigoReferencia?: string; precoFormatted?: string }) => {
      const idRef = product.codigoReferencia || product.id;
      const precoInfo = product.precoFormatted ? ` (${product.precoFormatted})` : "";
      return `Olá! Gostaria de saber mais informações e disponibilidade sobre o produto *${product.nome}* [Ref: ${idRef}]${precoInfo} anunciado no catálogo.`;
    },
    
    generalInquiry: () => {
      return `Olá! Acessei o catálogo da Planeta das Cases e gostaria de falar com a equipe de atendimento sobre os produtos.`;
    },

    categoryInquiry: (categoriaNome: string) => {
      return `Olá! Gostaria de consultar os produtos e disponibilidade da categoria *${categoriaNome}* da Planeta das Cases.`;
    },
  },

  // Navegação principal limpa e objetiva
  nav: [
    { label: "Início", href: "/" },
    { label: "Catálogo", href: "/catalogo" },
    { label: "Starlink", href: "/catalogo?categoria=conectividade-satelite" },
    { label: "Mobilidade", href: "/catalogo?categoria=mobilidade-eletrica" },
    { label: "Cases", href: "/catalogo?categoria=cases-protecao" },
  ],
};
