"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalida as rotas do catálogo público após operações administrativas (criar, editar, excluir, alterar status)
 */
export async function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/catalogo");
  if (slug) {
    revalidatePath(`/produto/${slug}`);
  }
}
