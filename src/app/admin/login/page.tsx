"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Lock, Mail, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setErrorMessage(
        "Supabase não configurado no .env.local. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar a autenticação."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("E-mail ou senha incorretos.");
        } else {
          setErrorMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        router.push("/admin");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado ao realizar autenticação.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-dark-900 border border-zinc-800 p-8 rounded-xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Acesso Restrito
          </span>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
            Painel Administrativo
          </h1>
          <p className="text-xs text-zinc-400">
            Entre com as credenciais de administrador da Planeta das Cases.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              E-mail de Administrador
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@planetadascases.com.br"
                className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white placeholder-zinc-600 text-xs sm:text-sm rounded pl-9 pr-3 py-2.5 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-950 border border-zinc-800 focus:border-zinc-400 text-white placeholder-zinc-600 text-xs sm:text-sm rounded pl-9 pr-3 py-2.5 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-850 text-center">
          <p className="text-[11px] text-zinc-500 font-mono">
            * Apenas contas pré-autorizadas. Não há cadastro público.
          </p>
        </div>
      </div>
    </div>
  );
}
