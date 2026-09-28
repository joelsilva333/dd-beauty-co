"use client";

import { use, useState } from "react";
import { AlertCircle, Clock, Loader2, PackageSearch, Search } from "lucide-react";
import { formatKwanza } from "@/lib/currency";
import { useRealtime } from "@/lib/realtime-client";
import { OrderTimeline } from "@/components/OrderTimeline";

type OrderResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalCents: number;
  shippingCents: number;
  province: string;
  municipality: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; priceCents: number }[];
};

export default function MyAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ numero?: string }>;
}) {
  // Links das mensagens de confirmação já trazem o número do pedido.
  const { numero } = use(searchParams);
  const [orderNumber, setOrderNumber] = useState(numero ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);

  useRealtime({
    rooms: order && token ? [`order:${order.orderNumber}`] : [],
    token,
    handlers: {
      "order:updated": (data: { status: string; paymentStatus: string }) => {
        setOrder((o) => (o ? { ...o, status: data.status, paymentStatus: data.paymentStatus } : o));
        setJustUpdated(true);
      },
    },
  });

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    setJustUpdated(false);

    try {
      const params = new URLSearchParams({ numero: orderNumber, telefone: phone });
      const res = await fetch(`/api/pedido?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Não foi possível encontrar o pedido.");
        return;
      }
      setOrder(json.order);
      setToken(json.token);
    } catch {
      setError("Ocorreu um problema de ligação. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 md:px-8 md:py-20">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <PackageSearch className="h-8 w-8 text-gold" aria-hidden="true" strokeWidth={1.25} />
        <h1 className="font-display text-4xl text-ink">Os meus pedidos</h1>
        <p className="font-body text-ink/60">
          Indica o número do pedido e o telefone usado na compra para ver o
          estado da tua encomenda.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="eyebrow">Número do pedido</span>
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ex: DD-2609-1234"
            autoCapitalize="characters"
            className="input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="eyebrow">Telefone usado na compra</span>
          <input
            required
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9XX XXX XXX"
            className="input"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-dark mt-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          Ver o meu pedido
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-6 flex items-start gap-3 border border-ink/20 bg-ink/5 px-4 py-3 font-body text-sm text-ink"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
          {error}
        </p>
      )}

      {order && (
        <div className="mt-10 flex flex-col gap-6 border border-ink/10 p-7">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl text-ink">{order.orderNumber}</span>
            <span className="font-body text-xs text-ink/45">
              {new Date(order.createdAt).toLocaleDateString("pt-AO")}
            </span>
          </div>

          {justUpdated && (
            <p role="status" className="border border-gold/40 bg-gold/5 px-3 py-2 font-body text-sm text-ink">
              O estado do teu pedido acabou de ser atualizado.
            </p>
          )}

          {order.paymentStatus !== "PAGO" && order.status !== "CANCELADO" && (
            <p className="flex items-center gap-2 font-body text-sm text-ink/70">
              <Clock className="h-4 w-4 text-taupe" aria-hidden="true" strokeWidth={1.5} />
              A aguardar confirmação do pagamento.
            </p>
          )}

          <OrderTimeline status={order.status} />

          <div className="flex flex-col gap-2 border-t border-ink/10 pt-5">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between font-body text-sm">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatKwanza(item.priceCents * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-body text-sm text-ink/60">
              <span>Entrega</span>
              <span>{formatKwanza(order.shippingCents)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-3 font-display text-lg text-ink">
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
