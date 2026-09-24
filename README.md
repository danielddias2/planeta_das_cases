# Planeta das Cases — Catálogo Comercial & Marketplace Visual

Estrutura inicial de alta performance, modular e responsiva para a **Planeta das Cases**, desenvolvida com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** e preparada para integração com **Supabase (PostgreSQL)**.

---

## 1. Stack Escolhida e Justificativa

* **Next.js 14+ (App Router)**:
  * **Renderização Híbrida (SSR / SSG / ISR)**: Ideal para um catálogo comercial que precisa de indexação veloz em motores de busca (Google SEO) e carregamento instantâneo.
  * **Rotas Dinâmicas Nativas**: A rota `/produto/[slug]` permite URLs amigáveis com geração dinâmica de metadados (`generateMetadata`) e Open Graph para compartilhamento social.
  * **Otimização Avançada de Mídia**: O componente `next/image` converte e entrega automaticamente formatos modernos (WebP/AVIF), dimensionamento responsivo e lazy loading sem requerer conversões manuais na primeira etapa.
  * **Pronto para Deploy**: Compatível nativamente com Vercel, Docker, AWS Amplify, Railway, Netlify, etc.
* **TypeScript**:
  * Tipagem estrita de todos os modelos de dados (`Produto`, `CategoriaInfo`, `DisponibilidadeStatus`), eliminando falhas em tempo de compilação e garantindo previsibilidade.
* **Tailwind CSS**:
  * Estilização utilitária de alta performance com design system baseado em tons espaciais/tecnológicos (inspirado na identidade visual clean da Starlink/SpaceX, preservando a marca própria da Planeta das Cases).
  * Ausência de CSS desnecessário em produção e garantia de responsividade mobile-first consistente.
* **Lucide React**:
  * Ícones vetoriais modernos, ultraleves e acessíveis.
* **Supabase / PostgreSQL**:
  * Backend as a Service e banco relacional robusto com Row Level Security (RLS) habilitado para leitura pública segura, sem exposição de credenciais privadas.

---

## 2. Estrutura de Pastas do Projeto

```text
planeta-das-cases/
├── .env.example                  # Documentação das variáveis de ambiente necessárias
├── .env.local                    # Configurações de ambiente locais para desenvolvimento
├── .gitignore                    # Regras de exclusão do Git (ignora envs locais e node_modules)
├── .npmrc                        # Configurações do gerenciador de pacotes
├── next.config.mjs               # Configurações do Next.js e domínios remotos de imagens
├── package.json                  # Dependências e scripts de execução
├── postcss.config.mjs            # Configuração do PostCSS para Tailwind
├── tailwind.config.ts            # Tokens do Tailwind e paleta tecnológica customizada
├── tsconfig.json                 # Configuração do compilador TypeScript e aliases (@/*)
├── README.md                     # Documentação completa do projeto
│
├── supabase/
│   └── schema.sql                # Script DDL PostgreSQL (tabela produtos, enum, RLS, índices e seeds)
│
└── src/
    ├── app/                      # Rotas e páginas do Next.js App Router
    │   ├── globals.css           # Estilos globais, reset e scrollbar customizada
    │   ├── layout.tsx            # RootLayout com Navbar, Footer e metadados globais
    │   ├── not-found.tsx         # Página 404 customizada com identidade da loja
    │   ├── page.tsx              # Página inicial (Home)
    │   ├── catalogo/
    │   │   └── page.tsx          # Página principal do catálogo com busca e filtros
    │   └── produto/
    │       └── [slug]/
    │           └── page.tsx      # Rota dinâmica individual de cada produto
    │
    ├── components/               # Componentes modulares e reutilizáveis
    │   ├── ui/
    │   │   ├── Badge.tsx         # Pílula de disponibilidade (Disponível / Indisponível)
    │   │   └── Button.tsx        # Botão padronizado com variantes tecnológicas
    │   ├── layout/
    │   │   ├── Navbar.tsx        # Navegação responsiva com drawer mobile e logo
    │   │   └── Footer.tsx        # Rodapé institucional, localização e dados de contato
    │   ├── home/
    │   │   ├── HeroSection.tsx   # Hero de alto impacto com apresentação da proposta de valor
    │   │   ├── AboutSection.tsx  # Apresentação institucional da Planeta das Cases
    │   │   ├── CategoriesGrid.tsx# Cards visuais de navegação por segmento
    │   │   ├── FeaturedProducts.tsx # Vitrine de produtos em destaque na Home
    │   │   └── LocationSection.tsx  # Informações da loja física, horários e WhatsApp
    │   ├── catalog/
    │   │   ├── ProductCard.tsx   # Card com imagem em aspect ratio seguro, preço e badges
    │   │   └── CategoryFilter.tsx# Filtro interativo por categoria, busca e disponibilidade
    │   └── product/
    │       ├── ProductGallery.tsx# Galeria com imagem principal e miniaturas (anti-CLS)
    │       ├── ProductInfo.tsx   # Informações completas, especificações e valor de referência
    │       └── WhatsAppButton.tsx# Botão de contato direto com mensagem contextualizada
    │
    ├── config/
    │   └── site.ts               # Metadados do site, dados da loja e templates de mensagem
    │
    ├── lib/                      # Utilitários e serviços de infraestrutura
    │   ├── utils.ts              # Funções de formatação (moeda BRL, classes Tailwind, datas)
    │   ├── supabase/
    │   │   ├── client.ts         # Cliente Supabase seguro para o navegador (Client Components)
    │   │   └── server.ts         # Cliente Supabase para Server Components / SSR
    │   ├── whatsapp/
    │   │   └── generator.ts      # Gerador dinâmico de links e mensagens do WhatsApp
    │   └── products/
    │       ├── mock-data.ts      # Dataset resiliente para execução imediata sem banco
    │       └── service.ts        # Camada de abstração de dados (Supabase + fallback)
    │
    └── types/
        └── product.ts            # Interfaces TypeScript (Produto, Categoria, Status, Filtros)
```

---

## 3. Modelo de Dados do Produto

O modelo foi concebido para atender rigorosamente a todos os requisitos do projeto e desacoplar o identificador do nome:

```typescript
export type DisponibilidadeStatus = 'disponivel' | 'indisponivel';

export interface Produto {
  id: string;                      // Identificador único UUID (não depende do nome)
  codigoReferencia?: string;       // Código amigável para atendimento (ex: STAR-STD-001)
  nome: string;                    // Nome comercial completo
  slug: string;                    // Identificador amigável para URLs (/produto/antena-starlink)
  descricaoCurta: string;          // Resumo para cards e metadados de compartilhamento
  descricaoCompleta: string;       // Conteúdo informativo aprofundado
  preco: number | null;            // Valor numérico formatado em BRL ou null para sob consulta
  statusDisponibilidade: DisponibilidadeStatus; // "disponivel" | "indisponivel" (sem estoque numérico)
  imagemPrincipal: string;         // URL otimizada da imagem principal
  galeriaImagens: string[];        // Lista de URLs adicionais
  videos: string[];                // Lista de URLs de vídeos (futuras demonstrações)
  categoria: string;               // Slug da categoria associada
  destaque: boolean;               // Indicador de exibição na Home
  ordemExibicao: number;           // Ordenação manual de exibição
  especificacoes?: Record<string, string>; // Especificações técnicas chave/valor
  createdAt: string;               // Timestamp ISO
  updatedAt: string;               // Timestamp ISO
}
```

---

## 4. Estrutura Preparada para Supabase / PostgreSQL

O script DDL está localizado em `supabase/schema.sql` e pode ser executado diretamente no SQL Editor do Supabase:

1. **Enum Dedicado**: `CREATE TYPE status_disponibilidade AS ENUM ('disponivel', 'indisponivel');`
2. **Tabela `produtos`**: Colunas tipadas, `id` UUID gerado por `gen_random_uuid()`, `slug` com restrição `UNIQUE`, colunas de array `TEXT[]` para galerias e vídeos, e `JSONB` para especificações técnicas.
3. **Índices de Performance**: Índices B-Tree criados em `slug`, `categoria`, `status`, `destaque` e `ordem_exibicao`.
4. **Trigger de Auditoria**: Gatilho PL/pgSQL que atualiza automaticamente o campo `updated_at` a cada modificação.
5. **Row Level Security (RLS)**:
   * RLS ativado na tabela.
   * Política declarativa de `SELECT` público liberada para visitantes do site.
   * **Nenhuma chave administrativa ou service role key é necessária no frontend.**

---

## 5. Carregamento de Produtos e Resiliência (Mock Fallback)

A camada de dados em `src/lib/products/service.ts` atua como uma ponte desacoplada:

1. **Quando o Supabase está configurado** (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` preenchidos no `.env.local`), a aplicação consulta a tabela `produtos` via `@supabase/supabase-js`.
2. **Quando as variáveis ainda não foram configuradas** (ou em caso de instabilidade de rede), a camada de serviço ativa automaticamente o **Mock Dataset** (`src/lib/products/mock-data.ts`).
3. **Resultado**: O site é 100% funcional imediatamente após o download, sem telas brancas ou erros de conexão.

---

## 6. URLs Dinâmicas de Produto

* Rota: `/src/app/produto/[slug]/page.tsx`
* Exemplo: `http://localhost:3000/produto/antena-starlink-veicular-high-performance`
* **Mecanismo**:
  1. O Next.js captura o parâmetro `params.slug` da URL.
  2. Executa a função `getProductBySlug(slug)`.
  3. Gera os metadados dinâmicos para SEO via `generateMetadata({ params })`.
  4. Caso o produto não seja encontrado, dispara a função `notFound()` renderizando a página 404 personalizada.

---

## 7. Geração Dinâmica de Links do WhatsApp

O gerador puro em `src/lib/whatsapp/generator.ts` e o componente `WhatsAppButton.tsx` garantem que:

1. A mensagem seja **100% dinâmica**, injetando o nome do produto, o código de referência e o valor formatado.
2. A URL seja sanitizada e encodada (`encodeURIComponent`).
3. O modelo de mensagem seja centralizado em `src/config/site.ts`:
   ```typescript
   productInquiry: (product) => {
     return `Olá! Estive visualizando no catálogo o produto *${product.nome}* [Ref: ${product.codigoReferencia || product.id}] e gostaria de saber mais informações e disponibilidade para negociação.`;
   }
   ```
4. Se o modelo de mensagem precisar ser alterado no futuro, **basta editar a função em `site.ts`**, sem necessidade de alterar nenhum produto individualmente.

---

## 8. Variáveis de Ambiente Necessárias

| Variável | Obrigatória | Finalidade |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim (p/ banco real) | URL do projeto Supabase (`https://seu-projeto.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim (p/ banco real) | Chave pública anônima do Supabase |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Recomendada | Número oficial da loja com DDI e DDD (ex: `5511999999999`) |
| `NEXT_PUBLIC_SITE_URL` | Opcional | URL base para OpenGraph e SEO (default: `http://localhost:3000`) |

---

## 9. O que NÃO Foi Implementado Nesta Etapa (Conforme Solicitado)

Para manter a fundação sólida e respeitar o escopo da Etapa 1:

* Não foi implementado carrinho de compras.
* Não foi implementado checkout ou gateway de pagamento.
* Não foi implementado controle numérico de estoque.
* Não foi implementado painel administrativo ou autenticação de usuários.
* Não foram adicionadas automações complexas de conversão de vídeo.

---

## 10. Como Executar o Projeto Localmente

1. Navegue até o diretório do projeto:
   ```powershell
   cd "C:\Users\Maria Dias\.gemini\antigravity\scratch\planeta-das-cases"
   ```
2. Instale as dependências (caso não tenham sido instaladas previamente):
   ```powershell
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```powershell
   npm run dev
   ```
4. Abra o navegador em [http://localhost:3000](http://localhost:3000).
