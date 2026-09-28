"use client";

import { useState } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { formatKwanza } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/order-number";

type OrderResult = {
  orderNumber: string;
  status: string;
  totalCents: number;
  province: string;
  municipality: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; priceCents: number }[];
};

export default function MyAccountPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const params = new URLSearchParams({ numero: orderNumber, telefone: phone });
      const res = await fetch(`/api/pedido?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Não foi possível encontrar o pedido.");
        return;
      }
      setOrder(json.order);
    } catch {
      setError("Ocorreu um problema de ligação. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 md:px-8">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <PackageSearch className="h-10 w-10 text-gold" aria-hidden="true" />
        <h1 className="font-display text-3xl text-ink">Os meus pedidos</h1>
        <p className="font-body text-ink/60">
          Indica o número do pedido e o telefone usado na compra para ver o
          estado da tua encomenda.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <input
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Número do pedido (ex: DD-2609-1234)"
          className="input"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone usado na compra"
          className="input"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-ink font-body text-sm tracking-wide-label uppercase text-cream transition hover:bg-gold disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Ver o meu pedido
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-center font-body text-sm text-red-700">
          {error}
        </p>
      )}

      {order && (
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-taupe/25 p-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-ink">{order.orderNumber}</span>
            <span className="rounded-full bg-gold/15 px-3 py-1 font-body text-sm text-gold">
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between font-body text-sm">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatKwanza(item.priceCents * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-taupe/25 pt-3 font-display text-ink">
            <span>Total</span>
            <span>{formatKwanza(order.totalCents)}</span>
          </div>
          <p className="font-body text-sm text-ink/60">
            Entrega em {order.municipality}, {order.province}
          </p>
        </div>
      )}
    </div>
  );
}
