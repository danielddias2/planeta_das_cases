import { MetadataRoute } from "next";
import { getProducts } from "@/lib/products/service";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url || "http://localhost:3000";

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productEntries = products.map((product) => ({
      url: `${baseUrl}/produto/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("[sitemap] Falha ao recuperar produtos para sitemap:", err);
  }

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...productEntries,
  ];
}
