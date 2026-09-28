import Image from "next/image";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import { getProductBySlug } from "@/lib/products";
import { formatKwanza } from "@/lib/currency";
import { AddToCartForm } from "@/components/AddToCartForm";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const mainImage = product.images[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-taupe/10">
            {mainImage && (
              <Image
                src={mainImage.url}
                alt={mainImage.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg bg-taupe/10"
                >
                  <Image src={img.url} alt={img.alt} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            {product.category && (
              <p className="font-body text-sm tracking-wide-label uppercase text-gold">
                {product.category.name}
              </p>
            )}
            <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 font-body text-ink/70">{product.shortDesc}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl text-ink">
              {formatKwanza(product.priceCents)}
            </span>
            {product.compareAtCents && product.compareAtCents > product.priceCents && (
              <span className="font-body text-sm text-ink/40 line-through">
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
            inStock={product.stock > 0}
          />

          <div className="rounded-xl border border-taupe/25 bg-taupe/5 px-5 py-4 font-body text-sm text-ink/70">
            <p className="flex items-center gap-2 font-medium text-ink">
              <Truck className="h-4 w-4 text-gold" aria-hidden="true" />
              Entrega em Angola
            </p>
            <p className="mt-1">
              Luanda: 2 a 4 dias úteis. Outras províncias: 5 a 10 dias úteis.
              Vamos contactar-te para combinar a entrega.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-taupe/25 pt-6">
            <h2 className="font-display text-xl text-ink">A história por trás</h2>
            <p className="font-body text-ink/70">{product.story}</p>
            {product.ritual && (
              <>
                <h3 className="mt-2 font-display text-lg text-ink">
                  Ritual de uso
                </h3>
                <p className="font-body text-ink/70">{product.ritual}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
