import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { formatKwanza } from "@/lib/currency";

export type ProductCardData = {
  slug: string;
  name: string;
  priceCents: number;
  compareAtCents?: number | null;
  category?: string | null;
  image?: { url: string; alt: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/produtos/${product.slug}`} className="group flex flex-col gap-4">
      <div className="relative aspect-3/4 overflow-hidden bg-taupe/10">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-taupe">
            <Leaf className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {product.category && (
          <span className="font-body text-[10px] font-medium tracking-[0.22em] text-ink/40 uppercase">
            {product.category}
          </span>
        )}
        <h3 className="font-body text-sm text-ink transition group-hover:text-ink/60">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-body text-sm text-ink/80">
            {formatKwanza(product.priceCents)}
          </span>
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <span className="font-body text-xs text-ink/35 line-through">
              {formatKwanza(product.compareAtCents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
