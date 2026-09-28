"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatKwanza } from "@/lib/currency";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-taupe" aria-hidden="true" />
        <h1 className="font-display text-2xl text-ink">
          O teu carrinho está vazio
        </h1>
        <p className="font-body text-ink/60">
          Vamos encontrar algo especial para ti.
        </p>
        <Link
          href="/colecoes"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 font-body text-sm tracking-wide-label uppercase text-cream transition hover:bg-gold"
        >
          Ver coleções
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <h1 className="mb-8 font-display text-3xl text-ink">O teu carrinho</h1>

      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-xl border border-taupe/25 p-4"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-taupe/10">
              {item.image && (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <Link
                href={`/produtos/${item.slug}`}
                className="font-display text-lg text-ink hover:text-gold"
              >
                {item.name}
              </Link>
              <span className="font-body text-sm text-gold">
                {formatKwanza(item.priceCents)}
              </span>
            </div>

            <div className="flex items-center rounded-full border border-taupe/40">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="flex h-10 w-10 items-center justify-center"
                aria-label={`Diminuir quantidade de ${item.name}`}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-6 text-center font-body">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="flex h-10 w-10 items-center justify-center"
                aria-label={`Aumentar quantidade de ${item.name}`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="font-body text-sm text-ink/50 underline underline-offset-4 hover:text-ink"
              aria-label={`Remover ${item.name} do carrinho`}
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-end gap-4 border-t border-taupe/25 pt-6">
        <div className="flex w-full items-center justify-between md:w-72">
          <span className="font-body text-ink/70">Subtotal</span>
          <span className="font-display text-xl text-ink">
            {formatKwanza(totalCents)}
          </span>
        </div>
        <p className="font-body text-xs text-ink/50 md:w-72 md:text-right">
          A entrega é calculada no próximo passo.
        </p>
        <Link
          href="/checkout"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink font-body text-base tracking-wide-label uppercase text-cream transition hover:bg-gold md:w-72"
        >
          Finalizar compra
        </Link>
      </div>
    </div>
  );
}
