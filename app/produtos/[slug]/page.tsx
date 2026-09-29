import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { getProductBySlug } from "@/lib/products";
import { formatKwanza } from "@/lib/currency";
import { SHIPPING_SUMMARY } from "@/lib/shipping";
import { SITE } from "@/lib/site-config";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductGallery } from "@/components/ProductGallery";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const url = `/produtos/${product.slug}`;
  const image = product.images[0];

  return {
    title: product.name,
    description: product.shortDesc,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: product.name,
      description: product.shortDesc,
      images: image
        ? [{ url: image.url, alt: image.alt, width: 1200, height: 1200 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDesc,
      images: image ? [image.url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const mainImage = product.images[0];
  const productUrl = `${SITE.url}/produtos/${product.slug}`;

  // Dados estruturados: permitem que o link partilhado mostre preço, imagem
  // e disponibilidade (Google, WhatsApp e afins lêem isto ao pré-visualizar).
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    image: product.images.map((img) => img.url),
    url: productUrl,
    brand: { "@type": "Brand", name: SITE.shortName },
    ...(product.category && { category: product.category.name }),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery
          images={product.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
        />

        <div className="flex flex-col gap-7 md:pt-2">
          <div>
            {product.category && (
              <p className="eyebrow-gold">{product.category.name}</p>
            )}
            <h1 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 font-body leading-relaxed text-ink/65">{product.shortDesc}</p>
          </div>

          <div className="flex items-baseline gap-3 border-t border-ink/10 pt-6">
            <span className="font-body text-xl text-ink">
              {formatKwanza(product.priceCents)}
            </span>
            {product.compareAtCents && product.compareAtCents > product.priceCents && (
              <span className="font-body text-base text-ink/40 line-through">
                {formatKwanza(product.compareAtCents)}
              </span>
            )}
          </div>

          <AddToCartForm
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceCents={product.priceCents}
            image={mainImage?.url ?? ""}
            stock={product.stock}
          />

          <div className="flex flex-col gap-3 border-t border-ink/10 pt-6 font-body text-sm text-ink/65">
            <p className="flex items-center gap-2.5 font-medium text-ink">
              <Truck className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
              Entrega em toda Angola
            </p>
            <ul className="flex flex-col gap-1.5 pl-6">
              {SHIPPING_SUMMARY.map((zone) => (
                <li key={zone.label} className="flex justify-between gap-3">
                  <span>{zone.label}</span>
                  <span className="text-ink/80">
                    {zone.days} · {formatKwanza(zone.priceCents)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="pl-6">Vamos ligar-te para combinar o dia e a hora da entrega.</p>
            <p className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
              Pagamento seguro por cartão ou BitPay.
            </p>
            <p className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
              Dúvidas? Usa o botão “Precisas de ajuda?”.
            </p>
          </div>

          <ShareButton url={productUrl} title={product.name} />
        </div>
      </div>

      <section className="reveal-stagger mx-auto mt-24 grid max-w-4xl gap-14 border-t border-ink/10 pt-20 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="eyebrow-gold">A história por trás</p>
          <p className="font-display text-2xl leading-snug text-ink">{product.story}</p>
        </div>
        {product.ritual && (
          <div className="flex flex-col gap-4">
            <p className="eyebrow-gold">O teu ritual</p>
            <p className="font-body leading-relaxed text-ink/70">{product.ritual}</p>
          </div>
        )}
      </section>
    </div>
  );
}
