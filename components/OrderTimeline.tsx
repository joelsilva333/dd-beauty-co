import { Check } from "lucide-react";

// Estados que a cliente vê, por ordem. "Pendente" e "Pago" juntam-se em "Recebido".
const STEPS = [
  { key: "RECEBIDO", label: "Pedido recebido" },
  { key: "EM_PREPARACAO", label: "Em preparação" },
  { key: "A_CAMINHO", label: "A caminho" },
  { key: "ENTREGUE", label: "Entregue" },
];

function stepIndex(status: string) {
  if (status === "EM_PREPARACAO") return 1;
  if (status === "A_CAMINHO") return 2;
  if (status === "ENTREGUE") return 3;
  return 0;
}

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELADO") {
    return (
      <p className="border border-ink/15 px-4 py-3 font-body text-sm text-ink">
        Este pedido foi cancelado. Se tiveres dúvidas, fala connosco.
      </p>
    );
  }

  const current = stepIndex(status);

  return (
    <ol className="flex flex-col gap-0" aria-label="Estado da encomenda">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center border font-body text-sm ${
                  done || active
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/25 text-ink/35"
                }`}
              >
                {done || (active && index === STEPS.length - 1) ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              {index < STEPS.length - 1 && (
                <span className={`h-6 w-px ${done ? "bg-ink" : "bg-ink/15"}`} aria-hidden="true" />
              )}
            </div>
            <span
              className={`pt-1 font-body text-sm ${active ? "font-medium text-ink" : done ? "text-ink/70" : "text-ink/40"}`}
              aria-current={active ? "step" : undefined}
            >
              {step.label}
              {active && index < STEPS.length - 1 && " — estamos aqui"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
