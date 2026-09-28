"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatKwanza } from "@/lib/currency";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalCents, hydrated } = useCart();

  if (!hydrated) return <div className="min-h-[50vh]" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-32 text-center">
        <ShoppingBag className="h-9 w-9 text-taupe" aria-hidden="true" strokeWidth={1.25} />
        <h1 className="font-display text-3xl text-ink">
          O teu carrinho está vazio
        </h1>
        <p className="font-body text-ink/60">
          Vamos encontrar algo especial para ti.
        </p>
        <Link href="/colecoes" className="btn-dark mt-3">
          Ver coleções
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-20">
      <h1 className="mb-10 font-display text-4xl text-ink">O teu carrinho</h1>

      <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
        {items.map((item) => (
          <div
            key={item.productId}
            className="reveal flex flex-wrap items-center gap-x-5 gap-y-4 py-6"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-taupe/10">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 basis-[calc(100%-6.5rem)] flex-col gap-1 sm:basis-0">
              <Link
                href={`/produtos/${item.slug}`}
                className="font-body text-base text-ink transition hover:text-ink/60"
              >
                {item.name}
              </Link>
              <span className="font-body text-sm text-ink/60">
                {formatKwanza(item.priceCents)}
              </span>
            </div>

            <div className="flex items-center border border-ink/20 max-sm:ml-24">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="flex h-11 w-11 items-center justify-center"
                aria-label={`Diminuir quantidade de ${item.name}`}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-6 text-center font-body">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="flex h-11 w-11 items-center justify-center"
                aria-label={`Aumentar quantidade de ${item.name}`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="link-underline min-h-11 px-2 underline max-sm:ml-auto"
              aria-label={`Remover ${item.name} do carrinho`}
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-end gap-4 pt-2">
        <div className="flex w-full items-center justify-between md:w-72">
          <span className="font-body text-ink/70">Subtotal</span>
          <span className="font-display text-xl text-ink">
            {formatKwanza(totalCents)}
          </span>
        </div>
        <p className="font-body text-xs text-ink/50 md:w-72 md:text-right">
          A entrega é calculada no próximo passo.
        </p>
        <Link href="/checkout" className="btn-dark w-full md:w-72">
          Finalizar compra
        </Link>
      </div>
    </div>
  );
}
