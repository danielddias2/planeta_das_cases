-- ==============================================================================
-- PLANETA DAS CASES - BANCO DE DADOS POSTGRESQL / SUPABASE (ETAPA 3)
-- ==============================================================================
-- Tabela principal: public.products
-- Enum de disponibilidade: 'disponivel' ou 'indisponivel' (sem estoque numérico)
-- Segurança: Row Level Security (RLS) habilitado com permissão APENAS de leitura pública (SELECT)
-- ==============================================================================

-- 1. Criação do Enum de Disponibilidade
DO $$ BEGIN
    CREATE TYPE status_disponibilidade AS ENUM ('disponivel', 'indisponivel');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tabela Principal de Produtos (public.products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_referencia VARCHAR(50) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    descricao_curta TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco NUMERIC(10, 2),
    status_disponibilidade status_disponibilidade NOT NULL DEFAULT 'disponivel',
    imagem_principal TEXT NOT NULL,
    galeria_imagens TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    categoria VARCHAR(100) NOT NULL,
    destaque BOOLEAN DEFAULT FALSE,
    ordem_exibicao INT DEFAULT 0,
    especificacoes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Índices para Otimização de Consultas no Catálogo
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON public.products (categoria);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status_disponibilidade);
CREATE INDEX IF NOT EXISTS idx_products_destaque ON public.products (destaque) WHERE destaque = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_ordem ON public.products (ordem_exibicao ASC);

-- 4. Função e Gatilho para Atualizar 'updated_at' Automaticamente
CREATE OR REPLACE FUNCTION public.handle_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_products_updated_at();

-- 5. Configuração de Segurança (Row Level Security - RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política de Leitura Pública Estrita (Somente SELECT para visitantes do site)
DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON public.products;
CREATE POLICY "Permitir leitura pública de produtos"
    ON public.products
    FOR SELECT
    TO public
    USING (true);

-- Políticas para Administradores Autenticados (Supabase Auth)
-- Visitantes anônimos continuam podendo APENAS consultar (SELECT).
-- Usuários autenticados no Supabase Auth podem criar, editar e excluir produtos:
DROP POLICY IF EXISTS "Permitir inserção para autenticados" ON public.products;
CREATE POLICY "Permitir inserção para autenticados"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON public.products;
CREATE POLICY "Permitir atualização para autenticados"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão para autenticados" ON public.products;
CREATE POLICY "Permitir exclusão para autenticados"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (true);

-- 6. View de Compatibilidade (caso haja referências à tabela produtos)
CREATE OR REPLACE VIEW public.produtos AS 
SELECT 
    id,
    codigo_referencia,
    nome,
    slug,
    descricao_curta,
    descricao AS descricao_completa,
    descricao,
    preco,
    status_disponibilidade AS status,
    status_disponibilidade,
    imagem_principal,
    galeria_imagens,
    videos,
    categoria,
    destaque,
    ordem_exibicao,
    especificacoes,
    created_at,
    updated_at
FROM public.products;

-- 7. Seeds Iniciais para Teste e Povoamento no Supabase
INSERT INTO public.products (
    id,
    codigo_referencia,
    nome,
    slug,
    descricao_curta,
    descricao,
    preco,
    status_disponibilidade,
    imagem_principal,
    galeria_imagens,
    videos,
    categoria,
    destaque,
    ordem_exibicao,
    especificacoes
) VALUES 
(
    'e4a78129-b69f-4318-809f-c68e3b5e0001',
    'STAR-STD-001',
    'Antena Starlink Standard Kit V4 (Residencial e Comercial)',
    'antena-starlink-standard-kit-v4',
    'Internet via satélite de alta velocidade e ultra-baixa latência para locais remotos ou uso residencial avançado.',
    'O Kit Starlink Standard V4 foi projetado para entregar conexão de banda larga de alta velocidade em qualquer lugar do território nacional e internacional. Conta com antena de orientação eletrônica de matriz em fase (phased-array), roteador Wi-Fi 6 de banda tripla e cabos resistentes a intempéries extremas (grau de proteção IP67). Ideal para residências, fazendas, canteiros de obras e empresas que exigem redundância e estabilidade de conexão.',
    2890.00,
    'disponivel',
    'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=85',
    ARRAY['https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1000&q=80'],
    ARRAY['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    'conectividade-satelite',
    TRUE,
    1,
    '{"Tecnologia de Antena": "Matriz em fase eletrônica (Phased-Array)", "Padrão Wi-Fi": "Wi-Fi 6 (802.11ax) Tri-Band", "Classificação Ambiental": "IP67"}'::jsonb
),
(
    'f8c92130-c70a-4429-91a0-d79f4c6f0002',
    'STAR-MOB-002',
    'Antena Starlink Veicular / High Performance Mobility',
    'antena-starlink-veicular-high-performance',
    'Conectividade contínua em movimento para motorhomes, frotas blindadas, veículos utilitários e embarcações.',
    'A Starlink Veicular de Alta Performance foi especificamente desenvolvida para fornecer conectividade sem interrupções mesmo quando o veículo está trafegando em altas velocidades. Com campo de visão mais amplo (140 graus) e recursos avançados de rastreamento por satélite GPS de precisão, garante internet veloz em estradas desertas, expedições off-road e operações críticas.',
    12490.00,
    'disponivel',
    'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=85',
    ARRAY['https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1000&q=80'],
    ARRAY[]::TEXT[],
    'conectividade-satelite',
    TRUE,
    2,
    '{"Campo de Visão": "140°", "Uso em Movimento": "Certificado para até 200 km/h", "Proteção Térmica": "Degelo automático ativo"}'::jsonb
),
(
    'a1b2c3d4-e5f6-47a8-98b9-012345678003',
    'MOTO-ELE-003',
    'Moto Elétrica Urbana City Pro 3000W',
    'moto-eletrica-urbana-city-pro-3000w',
    'Zero emissão de ruído e carbono, motor elétrico de alto torque, bateria de lítio removível e autonomia de até 90km.',
    'A City Pro 3000W une o design futurista minimalista à eficiência máxima da mobilidade urbana sustentável. Equipada com freios a disco hidráulicos com sistema regenerativo EBS, iluminação full-LED de alta penetração, painel digital TFT com conectividade Bluetooth e suspensão hidráulica invertida dianteira.',
    18990.00,
    'disponivel',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85',
    ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80'],
    ARRAY[]::TEXT[],
    'mobilidade-eletrica',
    TRUE,
    3,
    '{"Potência": "3000W Brushless", "Velocidade Máxima": "80 km/h", "Autonomia": "Até 90 km", "Bateria": "Lítio 72V 35Ah"}'::jsonb
),
(
    'b2c3d4e5-f6a7-48b9-a9c0-123456789004',
    'SCOOT-XCR-004',
    'Scooter Elétrica Dobrável X-Cruiser 500W',
    'scooter-eletrica-dobravel-x-cruiser',
    'Praticidade extrema para o último quilômetro urbano. Quadro de alumínio aeroespacial e dobragem rápida em 3 segundos.',
    'Projetada para fácil transporte em porta-malas, trens ou metrôs. A X-Cruiser possui pneus sólidos anti-furos de 10 polegadas com amortecimento duplo, luz de freio inteligente e 3 modos de pilotagem (Eco, Comfort e Sport).',
    3790.00,
    'indisponivel',
    'https://images.unsplash.com/photo-1597404293560-37aeac0c19a8?auto=format&fit=crop&w=1200&q=85',
    ARRAY['https://images.unsplash.com/photo-1597404293560-37aeac0c19a8?auto=format&fit=crop&w=1000&q=80'],
    ARRAY[]::TEXT[],
    'mobilidade-eletrica',
    FALSE,
    4,
    '{"Potência": "500W nominal", "Velocidade Máxima": "32 km/h", "Autonomia": "35 km", "Status": "Aguardando reposição de lote"}'::jsonb
),
(
    'c3d4e5f6-a7b8-49c0-ba01-234567890005',
    'CASE-STK-005',
    'Case Rígida Blindada Anti-Impacto para Starlink Standard',
    'case-rigida-blindada-anti-impacto-starlink',
    'Proteção de grau militar estanque e impermeável com espuma moldada em CNC sob medida para a antena e acessórios.',
    'A Case Tática Planeta das Cases foi especialmente fabricada em polímero ultra-resistente reforçado para proteger o seu equipamento Starlink durante transportes severos em pickups, barcos, aeronaves ou expedições. Possui válvula de alívio de pressão automática, travas duplas seguras e vedação de borracha impermeável com grau de proteção IP67.',
    1450.00,
    'disponivel',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=85',
    ARRAY['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80'],
    ARRAY[]::TEXT[],
    'cases-protecao',
    TRUE,
    5,
    '{"Material": "Polipropileno injetado", "Proteção": "IP67", "Interior": "Espuma EVA sob medida"}'::jsonb
),
(
    'd4e5f6a7-b8c9-40d1-cb12-345678901006',
    'ACC-ETH-006',
    'Adaptador Ethernet Gigabit para Starlink',
    'adaptador-ethernet-gigabit-starlink',
    'Acessório original plug-and-play para conexão cabeada RJ45 direta ao seu roteador principal ou switch de rede.',
    'Permite conectar um cabo de rede ethernet RJ45 diretamente ao roteador da Starlink para fornecer link gigabit estável para switches empresariais, computadores gamers, centrais de segurança CFTV e pontos de acesso adicionais sem perdas de latência.',
    390.00,
    'disponivel',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80'],
    ARRAY[]::TEXT[],
    'acessorios-cabos',
    FALSE,
    6,
    '{"Velocidade": "10/100/1000 Mbps Gigabit", "Compatibilidade": "Roteador Starlink Standard V2 / V3 / V4"}'::jsonb
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 8. BUCKET DE MÍDIA NO SUPABASE STORAGE (ETAPA 5A)
-- ==============================================================================
-- Bucket oficial: 'product-media'
-- Público para visualização no catálogo, restrito para gravação via RLS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-media',
    'product-media',
    true,
    83886080, -- 80 MB (limite unificado para imagens e vídeos)
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/ogg'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 83886080,
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/ogg'
    ];

-- ==============================================================================
-- 9. POLÍTICAS DE SEGURANÇA DO STORAGE (RLS em storage.objects)
-- ==============================================================================

-- A. Leitura pública irrestrita para qualquer visitante do catálogo
DROP POLICY IF EXISTS "Permitir leitura pública de arquivos de mídia" ON storage.objects;
CREATE POLICY "Permitir leitura pública de arquivos de mídia"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'product-media');

-- B. Upload permitido apenas para administradores autenticados via Supabase Auth
DROP POLICY IF EXISTS "Permitir upload para autenticados" ON storage.objects;
CREATE POLICY "Permitir upload para autenticados"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-media');

-- C. Substituição/atualização permitida apenas para administradores autenticados
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON storage.objects;
CREATE POLICY "Permitir atualização para autenticados"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-media')
    WITH CHECK (bucket_id = 'product-media');

-- D. Exclusão de arquivos permitida apenas para administradores autenticados
DROP POLICY IF EXISTS "Permitir exclusão para autenticados" ON storage.objects;
CREATE POLICY "Permitir exclusão para autenticados"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-media');

