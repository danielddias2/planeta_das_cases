import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { LocationSection } from "@/components/home/LocationSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { getCategories, getFeaturedProducts } from "@/lib/products/service";

export const revalidate = 60; // Revalidação periódica (ISR)

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(6),
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Principal Tecnológico */}
      <HeroSection />

      {/* 2. Apresentação do Planeta das Cases */}
      <AboutSection />

      {/* 3. Categorias de Produtos */}
      <CategoriesGrid categories={categories} />

      {/* 4. Produtos em Destaque */}
      <FeaturedProducts products={featuredProducts} />

      {/* 5. Como Funciona a Compra / Consulta Comercial */}
      <HowItWorksSection />

      {/* 6. Localização e Canais de Atendimento */}
      <LocationSection />

      {/* 7. CTA Final */}
      <FinalCtaSection />
    </div>
  );
}
