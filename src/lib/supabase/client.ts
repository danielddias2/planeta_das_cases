import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/**
 * Retorna uma instância do cliente Supabase para o navegador (Client Components).
 * Se as variáveis de ambiente não estiverem configuradas, retorna null com aviso
 * no console em modo desenvolvimento, permitindo que a camada de serviço use o mock fallback.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (client) return client;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[Supabase Client] Variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas. O sistema operará em modo Mock Dataset."
      );
    }
    return null;
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}
