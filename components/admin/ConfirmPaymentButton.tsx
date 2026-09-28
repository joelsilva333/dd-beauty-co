"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ConfirmPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={saving}
        onClick={async () => {
          if (!confirm("Confirmas que o pagamento foi recebido? A cliente vai ser avisada.")) return;
          setSaving(true);
          setError(null);
          const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmPayment: true }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            setError(json.error ?? "Não foi possível confirmar.");
          }
          setSaving(false);
          router.refresh();
        }}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 font-body text-sm tracking-wide-label uppercase text-white transition hover:bg-ink disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        )}
        Confirmar pagamento recebido
      </button>
      {error && <p className="font-body text-sm text-ink">{error}</p>}
    </div>
  );
}
