import Link from "next/link";
import { LogoMark } from "./Logo";
import { SITE, whatsappLink } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-ink/10 bg-cream text-ink">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.3fr_1fr_1fr] md:gap-8 md:px-8 md:py-24">
        <div className="flex flex-col gap-4">
          <LogoMark className="h-7 w-7 opacity-70" />
          <p className="max-w-xs font-body text-sm leading-relaxed text-ink/55">
            Beleza angolana, escolhida a dedo. Cuidamos de cada detalhe para
            que a tua rotina se sinta um ritual.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <span className="eyebrow">Explorar</span>
          <Link href="/colecoes" className="font-body text-sm text-ink/70 transition hover:text-ink">
            Coleções
          </Link>
          <Link href="/sobre" className="font-body text-sm text-ink/70 transition hover:text-ink">
            A marca
          </Link>
          <Link href="/minha-conta" className="font-body text-sm text-ink/70 transition hover:text-ink">
            Os meus pedidos
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <span className="eyebrow">Precisas de ajuda?</span>
          <Link href="/contacto" className="font-body text-sm text-ink/70 transition hover:text-ink">
            Perguntas frequentes
          </Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="font-body text-sm text-ink/70 transition hover:text-ink"
          >
            WhatsApp: {SITE.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="border-t border-ink/10 px-4 py-6 pb-24 md:px-8 md:pb-6">
        <p className="text-center font-display text-2xl tracking-wide text-ink/15 select-none">
          DEODÁLIA DIAS
        </p>
        <p className="mt-3 text-center font-body text-xs text-ink/40">
          © {new Date().getFullYear()} Deodália Dias — Beauty &amp; Co. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
