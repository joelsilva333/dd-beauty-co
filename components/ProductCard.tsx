import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { formatKwanza } from "@/lib/currency";

export type ProductCardData = {
  slug: string;
  name: string;
  shortDesc: string;
  priceCents: number;
  compareAtCents?: number | null;
  image?: { url: string; alt: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-taupe/10">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-taupe">
            <Leaf className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg text-ink">{product.name}</h3>
        <p className="line-clamp-2 font-body text-sm text-ink/60">
          {product.shortDesc}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-body text-sm font-medium text-gold">
            {formatKwanza(product.priceCents)}
          </span>
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <span className="font-body text-xs text-ink/40 line-through">
              {formatKwanza(product.compareAtCents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
