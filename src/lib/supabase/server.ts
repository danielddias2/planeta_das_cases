import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Verifica se as credenciais do Supabase estão devidamente configuradas
 * no ambiente através das variáveis públicas NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== "" &&
    supabaseAnonKey.trim() !== "" &&
    !supabaseUrl.includes("seu-projeto.supabase.co")
  );
}

/**
 * Retorna uma instância do cliente Supabase para Server Components e Server Actions.
 * Garante que nenhuma chave privada ou service-role seja vazada para o frontend.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
    },
  });
}
