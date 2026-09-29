import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2e2019",
    icons: [
      {
        src: "/logos/7.jpeg",
        sizes: "560x560",
        type: "image/jpeg",
      },
    ],
  };
}
