"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { generateGeneralWhatsAppLink } from "@/lib/whatsapp/generator";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const whatsappGeneralUrl = generateGeneralWhatsAppLink();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-dark-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Brand Minimalista */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-white group-hover:bg-zinc-300 transition-colors" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-white uppercase">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {siteConfig.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-xs uppercase tracking-widest font-medium transition-colors duration-150 py-1",
                    isActive
                      ? "text-white border-b border-white"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Discreto */}
          <div className="hidden md:flex items-center">
            <a
              href={whatsappGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white text-xs uppercase tracking-wider font-medium transition-colors"
            >
              <span>Atendimento</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>

          {/* Mobile Actions: WhatsApp Icon + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href={whatsappGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-wider text-zinc-300 hover:text-white font-medium px-2 py-1 border border-zinc-800 rounded"
            >
              Contato
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-zinc-300 hover:text-white focus:outline-none"
              aria-label={mobileMenuOpen ? "Fechar Menu" : "Abrir Menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Limpo (Sem altura artificial, sem layout shift) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-850 bg-dark-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {siteConfig.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded text-xs uppercase tracking-widest font-medium transition-colors",
                    isActive
                      ? "text-white bg-zinc-900"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-zinc-850">
            <a
              href={whatsappGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 text-white text-xs uppercase tracking-widest font-medium"
            >
              <span>Conversar no WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
