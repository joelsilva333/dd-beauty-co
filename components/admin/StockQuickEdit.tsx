"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus } from "lucide-react";

/**
 * Ajuste rápido de stock direto na lista de produtos: +/-1 ou escrever o
 * valor final, sem abrir o formulário completo do produto.
 */
export function StockQuickEdit({ productId, stock }: { productId: string; stock: number }) {
  const router = useRouter();
  const [value, setValue] = useState(stock);
  const [saving, setSaving] = useState(false);

  async function save(next: number) {
    if (next < 0 || next === stock) return;
    setSaving(true);
    setValue(next);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: next }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
    else setValue(stock);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => save(value - 1)}
        disabled={saving || value <= 0}
        aria-label="Diminuir stock"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-taupe/30 text-ink/60 transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={() => save(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        disabled={saving}
        className="h-7 w-14 rounded-md border border-taupe/30 text-center font-body text-sm"
      />
      <button
        type="button"
        onClick={() => save(value + 1)}
        disabled={saving}
        aria-label="Aumentar stock"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-taupe/30 text-ink/60 transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    </div>
  );
}
