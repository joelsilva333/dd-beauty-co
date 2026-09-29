import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/minha-conta", "/checkout", "/carrinho"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
