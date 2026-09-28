"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useRealtime } from "@/lib/realtime-client";

export function AddToCartForm({
  productId,
  slug,
  name,
  priceCents,
  image,
  stock: initialStock,
}: {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  stock: number;
}) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const [stock, setStock] = useState(initialStock);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // O stock atualiza-se sozinho quando outra cliente compra ou a equipa repõe.
  useRealtime({
    rooms: [`product:${productId}`],
    handlers: {
      "stock:updated": (data: { productId: string; stock: number }) => {
        if (data.productId === productId) setStock(data.stock);
      },
    },
  });

  const inCart = items.find((i) => i.productId === productId)?.quantity ?? 0;
  const available = Math.max(0, stock - inCart);
  const safeQuantity = Math.min(quantity, Math.max(1, available));

  if (stock <= 0) {
    return (
      <div className="border border-ink/15 px-5 py-4 font-body text-sm text-ink/70">
        Este produto está esgotado no momento. Fala connosco pelo botão de ajuda
        para saber quando volta.
      </div>
    );
  }

  function add() {
    addItem({ productId, slug, name, priceCents, image }, safeQuantity);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="eyebrow">Quantidade</span>
        <div className="flex items-center border border-ink/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-ink"
            aria-label="Diminuir quantidade"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-body" aria-live="polite">
            {safeQuantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(available, q + 1))}
            disabled={safeQuantity >= available}
            className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
            aria-label="Aumentar quantidade"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {available === 0 ? (
        <p className="border border-ink/15 px-4 py-3 font-body text-sm text-ink">
          Já tens no carrinho todas as unidades disponíveis deste produto.
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              add();
              router.push("/checkout");
            }}
            className="btn-dark flex-1"
          >
            Comprar agora
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              add();
              setQuantity(1);
              setAdded(true);
              setTimeout(() => setAdded(false), 4000);
            }}
            className="btn-outline flex-1"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Adicionar ao carrinho
          </button>
        </div>
      )}

      {added && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 border border-gold/50 px-4 py-3 font-body text-sm text-ink"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden="true" />
            Adicionado ao carrinho
          </span>
          <button
            type="button"
            onClick={() => router.push("/carrinho")}
            className="link-underline underline"
          >
            Ver carrinho
          </button>
        </div>
      )}
    </div>
  );
}
