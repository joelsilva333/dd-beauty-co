import { Check } from "lucide-react";

const STEPS = ["Carrinho", "Entrega", "Pagamento", "Confirmado"];

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="mb-12 flex items-center justify-between gap-2">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center border font-body text-xs ${
                  done
                    ? "border-ink bg-ink text-cream"
                    : active
                      ? "border-ink text-ink"
                      : "border-ink/25 text-ink/35"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : stepNumber}
              </span>
              <span
                className={`hidden font-body text-[11px] font-medium tracking-[0.15em] uppercase sm:inline ${
                  active || done ? "text-ink" : "text-ink/35"
                }`}
              >
                {label}
              </span>
            </div>
            {stepNumber < STEPS.length && (
              <span
                className={`h-px flex-1 ${done ? "bg-ink" : "bg-ink/15"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
