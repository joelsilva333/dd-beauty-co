"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Logo, LogoMark } from "./Logo";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/colecoes", label: "Coleções" },
  { href: "/sobre", label: "A Marca" },
  { href: "/contacto", label: "Ajuda" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const pathname = usePathname();

  // Fecha o menu sempre que a rota muda (ex: voltar pelo navegador).
  // Ajustado durante o render (e não num efeito) para evitar um render em cascata.
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  // Impede o scroll de fundo enquanto o menu de ecrã inteiro está aberto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    // Nota: o painel do menu de telemóvel (fixed inset-0) tem de ficar FORA do
    // <header>. O <header> usa backdrop-blur, e um backdrop-filter cria um
    // "containing block" para descendentes fixed — o painel ficava espremido
    // na altura do cabeçalho (~64px) em vez de cobrir o ecrã todo, com o resto
    // do menu a transbordar por cima da página sem fundo (parecia transparente).
    <>
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/60 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-3 items-center px-4 md:h-20 md:px-8">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-ml-2 flex h-11 w-11 items-center justify-center text-ink md:hidden"
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-[11px] font-medium tracking-[0.2em] text-ink/75 uppercase transition hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex justify-center">
          <Logo markClassName="hidden h-6 w-6 md:block" wordmarkClassName="text-base md:text-lg" />
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/carrinho"
            className="relative flex h-11 items-center gap-2 px-1 text-ink transition hover:text-ink/60"
            aria-label={`Carrinho, ${totalItems} ${totalItems === 1 ? "artigo" : "artigos"}`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
            <span className="hidden font-body text-[11px] font-medium tracking-[0.2em] uppercase sm:inline">
              Carrinho
              {totalItems > 0 && ` (${totalItems})`}
            </span>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-ink px-1 font-body text-[10px] text-cream sm:hidden">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
      </header>

      {/* Menu de telemóvel: painel de ecrã inteiro, tipografia grande, ao estilo editorial. */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-cream transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex h-16 items-center justify-between border-b border-ink/10 px-4">
          <LogoMark className="h-6 w-6" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-ink"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col justify-center gap-2 px-8 pb-16">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`fade-up border-b border-ink/10 py-5 font-display text-4xl text-ink transition hover:pl-2`}
              style={{ animationDelay: open ? `${index * 60}ms` : undefined }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/minha-conta"
            onClick={() => setOpen(false)}
            className="fade-up mt-8 font-body text-[11px] font-medium tracking-[0.22em] text-ink/60 uppercase"
            style={{ animationDelay: open ? `${NAV_LINKS.length * 60}ms` : undefined }}
          >
            Os meus pedidos
          </Link>
        </nav>
      </div>
    </>
  );
}
