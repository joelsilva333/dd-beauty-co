import type { MetadataRoute } from "next";
import { getActiveProducts, getCategories } from "@/lib/products";
import { SITE } from "@/lib/site-config";

// Gerado por pedido (nunca no build do Vercel): um sitemap não precisa de
// ficar fixado no momento do build, e isso exigiria ligação à base de dados
// durante o próprio build — frágil, e sem necessidade nenhuma (já corre
// numa função serverless com acesso normal à BD em runtime).
export const dynamic = "force-dynamic";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE.url}/colecoes`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE.url}/sobre`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE.url}/contacto`, changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Uma falha pontual na base de dados não pode derrubar o sitemap inteiro —
  // devolve pelo menos as rotas fixas em vez de dar erro 500.
  try {
    const [products, categories] = await Promise.all([
      getActiveProducts(),
      getCategories(),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE.url}/colecoes?categoria=${category.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE.url}/produtos/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...STATIC_ROUTES, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("[sitemap] não foi possível ler produtos/categorias:", error);
    return STATIC_ROUTES;
  }
}
