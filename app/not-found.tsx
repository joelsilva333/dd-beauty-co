import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Logo markClassName="h-9 w-9" />

      <Compass className="h-9 w-9 text-taupe" aria-hidden="true" strokeWidth={1.25} />

      <div>
        <p className="eyebrow-gold">Erro 404</p>
        <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
          Esta página não existe
        </h1>
        <p className="mt-4 font-body text-ink/60">
          O link pode estar errado, ou a página foi movida. Vamos levar-te de volta ao
          caminho certo.
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-dark">
          Voltar à página inicial
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/colecoes" className="btn-outline">
          Ver coleções
        </Link>
      </div>
    </div>
  );
}
