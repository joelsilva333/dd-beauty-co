"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export function AddToCartForm({
  productId,
  slug,
  name,
  priceCents,
  image,
  inStock,
}: {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  inStock: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <div className="rounded-xl border border-taupe/30 bg-taupe/10 px-5 py-4 font-body text-sm text-ink/70">
        Este produto está esgotado no momento. Fala connosco pelo WhatsApp
        para saber quando volta.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-body text-sm text-ink/70">Quantidade</span>
        <div className="flex items-center rounded-full border border-taupe/40">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-lg text-ink"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="w-8 text-center font-body">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-11 w-11 items-center justify-center text-lg text-ink"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          addItem({ productId, slug, name, priceCents, image }, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 2500);
        }}
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-ink font-body text-base tracking-wide-label uppercase text-cream transition hover:bg-gold"
      >
        <span aria-hidden="true">🛍️</span>
        Adicionar ao carrinho
      </button>

      {added && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 font-body text-sm text-ink">
          <span>✔ Adicionado ao carrinho</span>
          <button
            type="button"
            onClick={() => router.push("/carrinho")}
            className="font-medium text-gold underline underline-offset-4"
          >
            Ver carrinho
          </button>
        </div>
      )}
    </div>
  );
}
