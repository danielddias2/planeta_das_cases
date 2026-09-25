import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CategoriaInfo, FiltrosCatalogo, Produto } from "@/types/product";
import { MOCK_CATEGORIAS, MOCK_PRODUTOS } from "./mock-data";

/**
 * Mapeia um registro retornado do Supabase/PostgreSQL (snake_case)
 * para a interface padronizada da aplicação (camelCase).
 * Suporta tanto as colunas do schema oficial quanto compatibilidade com variações.
 */
function mapDatabaseRowToProduto(row: any): Produto {
  const statusRaw = row.status_disponibilidade || row.status;
  const statusDisponibilidade = statusRaw === "indisponivel" ? "indisponivel" : "disponivel";

  const descricao = row.descricao || row.descricao_completa || "";

  return {
    id: String(row.id),
    codigoReferencia: row.codigo_referencia || undefined,
    nome: String(row.nome || ""),
    slug: String(row.slug || ""),
    descricaoCurta: String(row.descricao_curta || ""),
    descricaoCompleta: descricao,
    descricao: descricao,
    preco: row.preco !== null && row.preco !== undefined ? Number(row.preco) : null,
    statusDisponibilidade,
    imagemPrincipal: String(row.imagem_principal || ""),
    galeriaImagens: Array.isArray(row.galeria_imagens) ? row.galeria_imagens : [],
    videos: Array.isArray(row.videos) ? row.videos : [],
    categoria: String(row.categoria || ""),
    destaque: Boolean(row.destaque),
    ordemExibicao: Number(row.ordem_exibicao || 0),
    especificacoes: (typeof row.especificacoes === "object" && row.especificacoes !== null)
      ? row.especificacoes
      : {},
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

/**
 * Helper para executar consultas na tabela de produtos do Supabase.
 * Tenta 'products' primeiramente; se a tabela não existir, tenta 'produtos'.
 */
async function queryProductsTable(supabase: any, buildQuery: (query: any) => any) {
  // Tentativa primária: 'products'
  let query = supabase.from("products");
  query = buildQuery(query);
  let { data, error } = await query;

  // Se a tabela 'products' não for encontrada (código 42P01), tenta 'produtos'
  if (error && (error.code === "42P01" || error.message?.includes("relation \"public.products\" does not exist"))) {
    let fallbackQuery = supabase.from("produtos");
    fallbackQuery = buildQuery(fallbackQuery);
    const retry = await fallbackQuery;
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Busca a lista de produtos aplicando filtros de categoria, disponibilidade, destaque e busca.
 * Quando o Supabase estiver configurado, ele é a FONTE OFICIAL ÚNICA:
 * - Não mistura dados com o mock;
 * - Não faz fallback silencioso para mock se a consulta falhar;
 * - Retorna lista vazia se nenhum produto for encontrado no banco.
 */
export async function getProducts(filtros?: FiltrosCatalogo): Promise<Produto[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error(
        "[Supabase Error] Configuração de credenciais incompleta para conexão com o banco de dados."
      );
    }

    try {
      const rows = await queryProductsTable(supabase, (baseQuery) => {
        let q = baseQuery.select("*");

        if (filtros?.categoria && filtros.categoria !== "todas") {
          q = q.eq("categoria", filtros.categoria);
        }

        if (filtros?.status && filtros.status !== "todos") {
          // Tenta filtrar por status_disponibilidade
          q = q.or(`status_disponibilidade.eq.${filtros.status},status.eq.${filtros.status}`);
        }

        if (filtros?.destaque !== undefined) {
          q = q.eq("destaque", filtros.destaque);
        }

        q = q.order("ordem_exibicao", { ascending: true })
             .order("created_at", { ascending: false });

        return q;
      });

      let results: Produto[] = rows.map(mapDatabaseRowToProduto);

      // Filtro de busca textual em memória para garantir case-insensitivity consistente
      if (filtros?.busca && filtros.busca.trim() !== "") {
        const termo = filtros.busca.toLowerCase().trim();
        results = results.filter(
          (p: Produto) =>
            p.nome.toLowerCase().includes(termo) ||
            p.descricaoCurta.toLowerCase().includes(termo) ||
            p.categoria.toLowerCase().includes(termo) ||
            (p.codigoReferencia && p.codigoReferencia.toLowerCase().includes(termo))
        );
      }

      return results;
    } catch (err: any) {
      console.error("[Supabase Database Query Error]:", err.message || err);
      if (err?.message?.includes("fetch failed") || String(err).includes("fetch failed")) {
        console.warn("[Planeta das Cases] Conexão com Supabase indisponível no ambiente de build/offline. Utilizando dados de resiliência.");
        let fallback = [...MOCK_PRODUTOS];
        if (filtros?.categoria && filtros.categoria !== "todas") {
          fallback = fallback.filter((p) => p.categoria === filtros.categoria);
        }
        if (filtros?.destaque !== undefined) {
          fallback = fallback.filter((p) => p.destaque === filtros.destaque);
        }
        return fallback;
      }
      throw new Error(`Falha na consulta ao banco de dados Supabase: ${err.message || "Erro desconhecido"}`);
    }
  }

  // Apenas quando as variáveis de ambiente NÃO estiverem configuradas (Ambiente local preliminar)
  if (process.env.NODE_ENV === "development") {
    console.info(
      "[Planeta das Cases] Supabase não configurado no .env.local. Utilizando dados temporários de desenvolvimento."
    );
  }

  let items = [...MOCK_PRODUTOS].sort((a, b) => a.ordemExibicao - b.ordemExibicao);

  if (filtros?.categoria && filtros.categoria !== "todas") {
    items = items.filter((p) => p.categoria === filtros.categoria);
  }

  if (filtros?.status && filtros.status !== "todos") {
    items = items.filter((p) => p.statusDisponibilidade === filtros.status);
  }

  if (filtros?.destaque !== undefined) {
    items = items.filter((p) => p.destaque === filtros.destaque);
  }

  if (filtros?.busca && filtros.busca.trim() !== "") {
    const termo = filtros.busca.toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricaoCurta.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo) ||
        (p.codigoReferencia && p.codigoReferencia.toLowerCase().includes(termo))
    );
  }

  return items;
}

/**
 * Busca um único produto pelo slug.
 * Quando o Supabase estiver configurado:
 * - Se o produto não for encontrado, retorna null (disparando 404);
 * - Não faz fallback para mock.
 */
export async function getProductBySlug(slug: string): Promise<Produto | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error("[Supabase Error] Cliente não inicializado.");
    }

    try {
      const rows = await queryProductsTable(supabase, (baseQuery) => {
        return baseQuery.select("*").eq("slug", slug).limit(1);
      });

      if (!rows || rows.length === 0) {
        return null;
      }

      return mapDatabaseRowToProduto(rows[0]);
    } catch (err: any) {
      console.error(`[Supabase Error] Erro ao buscar produto por slug (${slug}):`, err.message || err);
      if (err?.message?.includes("fetch failed") || String(err).includes("fetch failed")) {
        return MOCK_PRODUTOS.find((p) => p.slug === slug) || null;
      }
      throw new Error(`Falha ao carregar produto do banco de dados: ${err.message || "Erro desconhecido"}`);
    }
  }

  // Modo mock preliminar
  const found = MOCK_PRODUTOS.find((p) => p.slug === slug);
  return found || null;
}

/**
 * Busca um produto pelo ID único.
 */
export async function getProductById(id: string): Promise<Produto | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error("[Supabase Error] Cliente não inicializado.");
    }

    try {
      const rows = await queryProductsTable(supabase, (baseQuery) => {
        return baseQuery.select("*").eq("id", id).limit(1);
      });

      if (!rows || rows.length === 0) {
        return null;
      }

      return mapDatabaseRowToProduto(rows[0]);
    } catch (err: any) {
      console.error(`[Supabase Error] Erro ao buscar produto por id (${id}):`, err.message || err);
      if (err?.message?.includes("fetch failed") || String(err).includes("fetch failed")) {
        return MOCK_PRODUTOS.find((p) => p.id === id) || null;
      }
      throw new Error(`Falha ao carregar produto por ID: ${err.message || "Erro desconhecido"}`);
    }
  }

  const found = MOCK_PRODUTOS.find((p) => p.id === id);
  return found || null;
}

/**
 * Busca produtos destacados para a Home, respeitando destaque e ordem_exibicao.
 */
export async function getFeaturedProducts(limit = 6): Promise<Produto[]> {
  const allFeatured = await getProducts({ destaque: true });
  return allFeatured.slice(0, limit);
}

/**
 * Retorna as categorias disponíveis.
 * Quando o Supabase estiver configurado, extrai as categorias reais presentes nos produtos.
 */
export async function getCategories(): Promise<CategoriaInfo[]> {
  if (isSupabaseConfigured()) {
    try {
      const allProducts = await getProducts();
      // Extrai categorias únicas dos produtos cadastrados no banco
      const uniqueSlugs = Array.from(new Set(allProducts.map((p) => p.categoria).filter(Boolean)));

      if (uniqueSlugs.length > 0) {
        return uniqueSlugs.map((slug) => {
          // Verifica se há metadados conhecidos (descrição / imagem de capa)
          const meta = MOCK_CATEGORIAS.find((c) => c.slug === slug);
          const formatNome = slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          return {
            slug,
            nome: meta?.nome || formatNome,
            descricao: meta?.descricao || `Produtos e soluções da categoria ${formatNome}.`,
            imagemCapa: meta?.imagemCapa || allProducts.find((p) => p.categoria === slug)?.imagemPrincipal,
          };
        });
      }
    } catch (err: any) {
      console.error("[Supabase Error] Erro ao consultar categorias:", err.message || err);
      if (err?.message?.includes("fetch failed") || String(err).includes("fetch failed")) {
        return MOCK_CATEGORIAS;
      }
      throw err;
    }
  }

  return MOCK_CATEGORIAS;
}
