"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm text-ink/60 transition hover:bg-taupe/10"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sair
    </button>
  );
}
