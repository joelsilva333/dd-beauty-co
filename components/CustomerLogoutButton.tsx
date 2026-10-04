"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function CustomerLogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/conta/sair", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="flex items-center gap-2 font-body text-[11px] font-medium tracking-[0.2em] text-ink/55 uppercase transition hover:text-ink"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
      Sair
    </button>
  );
}
