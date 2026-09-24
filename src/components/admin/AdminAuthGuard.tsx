"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  logout: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // A página /admin/login não requer autenticação
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      // Se o Supabase não estiver configurado nas variáveis de ambiente
      setIsLoading(false);
      return;
    }

    // 1. Verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (!session && !isLoginPage) {
        router.push("/admin/login");
      } else if (session && isLoginPage) {
        router.push("/admin");
      }
    });

    // 2. Monitora mudanças de autenticação (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (!session && !isLoginPage) {
        router.push("/admin/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, isLoginPage, router]);

  const logout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    router.push("/admin/login");
  };

  // Se estiver na tela de login, renderiza sem guard
  if (isLoginPage) {
    return (
      <AdminAuthContext.Provider value={{ user, session, isLoading, logout }}>
        {children}
      </AdminAuthContext.Provider>
    );
  }

  // Enquanto verifica a sessão
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 text-zinc-300 space-y-4">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Autenticando sessão administrativa...
        </span>
      </div>
    );
  }

  // Se não autenticado e não estiver na tela de login, não exibe o conteúdo protegido
  if (!user && !isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 text-zinc-300 space-y-4">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Redirecionando para login...
        </span>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ user, session, isLoading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
