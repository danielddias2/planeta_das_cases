export type DisponibilidadeStatus = 'disponivel' | 'indisponivel';

export interface Produto {
  id: string; // Identificador único UUID
  codigoReferencia?: string; // Código amigável (codigo_referencia)
  nome: string;
  slug: string; // Identificador amigável para URLs (/produto/[slug])
  descricaoCurta: string; // descricao_curta
  descricaoCompleta: string; // descricao / descricao_completa
  descricao?: string; // alias direto do campo no schema
  preco: number | null;
  statusDisponibilidade: DisponibilidadeStatus; // status_disponibilidade
  imagemPrincipal: string; // imagem_principal
  galeriaImagens: string[]; // galeria_imagens
  videos: string[]; // videos
  categoria: string;
  destaque: boolean;
  ordemExibicao: number; // ordem_exibicao
  especificacoes?: Record<string, string>; // especificacoes
  createdAt: string; // created_at
  updatedAt: string; // updated_at
}

export interface CategoriaInfo {
  slug: string;
  nome: string;
  descricao: string;
  icone?: string;
  imagemCapa?: string;
}

export interface FiltrosCatalogo {
  categoria?: string;
  status?: DisponibilidadeStatus | 'todos';
  destaque?: boolean;
  busca?: string;
}
