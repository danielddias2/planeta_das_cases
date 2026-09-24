"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "./AdminAuthGuard";
import { cn } from "@/lib/utils";
import { LogOut, ExternalLink, Menu, X, PlusCircle, LayoutDashboard, Package } from "lucide-react";

export function AdminHeader() {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Produtos", href: "/admin/produtos", icon: Package },
    { label: "Novo Produto", href: "/admin/produtos/novo", icon: PlusCircle },
  ];

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-dark-900/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo e Badge Admin */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-white uppercase">
                Planeta das Cases
              </span>
            </Link>
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
              Admin
            </span>
          </div>

          {/* Links de Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-colors",
                    isActive
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-850"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Usuário e Ações Desktop */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            {user?.email && (
              <span className="text-zinc-400 text-[11px] truncate max-w-[200px]" title={user.email}>
                {user.email}
              </span>
            )}

            <Link
              href="/catalogo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
              title="Abrir site público em nova aba"
            >
              <span>Ver Catálogo</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-850 hover:bg-red-950/50 hover:text-red-300 text-zinc-400 border border-zinc-700/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair</span>
            </button>
          </div>

          {/* Botão Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-zinc-400 hover:text-white focus:outline-none"
              aria-label="Menu Admin"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-dark-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors",
                    isActive ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
            <Link
              href="/catalogo"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
            >
              <span>Ver Catálogo</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
