"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/lib/order-number";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        disabled={saving || status === "CANCELADO"}
        onChange={async (e) => {
          const next = e.target.value;
          if (
            next === "CANCELADO" &&
            !confirm("Cancelar esta encomenda? O stock volta para a loja e a cliente é avisada.")
          ) {
            return;
          }
          setValue(next);
          setSaving(true);
          setError(null);
          const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: next }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            setError(json.error ?? "Não foi possível mudar o estado.");
            setValue(status);
          }
          setSaving(false);
          router.refresh();
        }}
        className="h-10 rounded-full border border-taupe/40 bg-white px-3 font-body text-sm text-ink disabled:opacity-60"
        aria-label="Estado da encomenda"
      >
        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {error && <p className="font-body text-xs text-ink">{error}</p>}
    </div>
  );
}
