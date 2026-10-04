import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupportWidget } from "@/components/SupportWidget";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CartProvider } from "@/lib/cart-context";
import { SITE } from "@/lib/site-config";
import { getAdminSession } from "@/lib/auth";
import { getCustomerSession } from "@/lib/customer-auth";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.shortName,
  icons: {
    icon: [{ url: "/logos/7.jpeg", type: "image/jpeg" }],
    apple: [{ url: "/logos/7.jpeg" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: "/",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [
      {
        url: "/logos/6.jpeg",
        width: 1200,
        height: 600,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/logos/6.jpeg"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Serve para o Header mostrar sempre um atalho para o painel a quem já
  // tem sessão de administração aberta, mesmo a navegar no site público.
  const isAdmin = Boolean(await getAdminSession());
  // Para o Header mostrar o avatar com as iniciais em vez do ícone genérico.
  const customerSession = await getCustomerSession();

  return (
    <html
      lang="pt-AO"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <CartProvider>
          <Header isAdmin={isAdmin} customerName={customerSession?.name ?? null} />
          <main className="flex-1">{children}</main>
          <Footer />
          <SupportWidget />
          <RevealOnScroll />
        </CartProvider>
      </body>
    </html>
  );
}
