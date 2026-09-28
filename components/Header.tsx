"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/colecoes", label: "Coleções" },
  { href: "/sobre", label: "A Marca" },
  { href: "/contacto", label: "Ajuda" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-taupe/25 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <span className="block h-px w-6 bg-ink" />
          <span className="block h-px w-6 bg-ink" />
        </button>

        <Logo markClassName="h-7 w-7" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-sm tracking-wide-label uppercase text-ink/80 transition hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/carrinho"
          className="relative flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-taupe/40 px-3 text-ink transition hover:border-gold hover:text-gold"
          aria-label={`Carrinho, ${totalItems} ${totalItems === 1 ? "artigo" : "artigos"}`}
        >
          <span aria-hidden="true" className="text-lg">
            🛍️
          </span>
          <span className="hidden font-body text-sm sm:inline">Carrinho</span>
          {totalItems > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 font-body text-xs text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-taupe/25 bg-cream px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 font-body text-base text-ink/90 transition hover:bg-taupe/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
