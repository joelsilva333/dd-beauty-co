import { Check } from "lucide-react";

const STEPS = ["Carrinho", "Entrega", "Pagamento", "Confirmado"];

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="mb-10 flex items-center justify-between gap-2">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-body text-sm ${
                  done
                    ? "bg-gold text-white"
                    : active
                      ? "border-2 border-gold text-gold"
                      : "border border-taupe/40 text-taupe"
                }`}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : stepNumber}
              </span>
              <span
                className={`hidden font-body text-sm sm:inline ${
                  active || done ? "text-ink" : "text-ink/40"
                }`}
              >
                {label}
              </span>
            </div>
            {stepNumber < STEPS.length && (
              <span
                className={`h-px flex-1 ${done ? "bg-gold" : "bg-taupe/30"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
