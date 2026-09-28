import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-taupe/25 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-8">
        <div className="flex flex-col gap-3">
          <Logo className="items-start text-cream" markClassName="h-8 w-8" />
          <p className="max-w-xs font-body text-sm text-cream/70">
            Beleza angolana, escolhida a dedo. Cuidamos de cada detalhe para
            que a tua rotina se sinta um ritual.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-body text-sm tracking-wide-label uppercase text-gold">
            Explorar
          </span>
          <Link href="/colecoes" className="font-body text-sm text-cream/80 hover:text-gold">
            Coleções
          </Link>
          <Link href="/sobre" className="font-body text-sm text-cream/80 hover:text-gold">
            A marca
          </Link>
          <Link href="/minha-conta" className="font-body text-sm text-cream/80 hover:text-gold">
            Os meus pedidos
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-body text-sm tracking-wide-label uppercase text-gold">
            Precisas de ajuda?
          </span>
          <Link href="/contacto" className="font-body text-sm text-cream/80 hover:text-gold">
            Perguntas frequentes
          </Link>
          <a
            href="https://wa.me/244900000000"
            target="_blank"
            rel="noreferrer"
            className="font-body text-sm text-cream/80 hover:text-gold"
          >
            WhatsApp: +244 900 000 000
          </a>
        </div>
      </div>
      <div className="border-t border-cream/10 px-4 py-5 text-center font-body text-xs text-cream/50 md:px-8">
        © {new Date().getFullYear()} Deodália Dias — Beauty & Co. Todos os direitos reservados.
      </div>
    </footer>
  );
}
