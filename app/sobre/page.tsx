import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "A marca — Deodália Dias",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1571875257727-256c39da42af?q=80&w=1600&auto=format&fit=crop"
          alt="Deodália Dias — Beauty & Co."
          fill
          className="object-cover opacity-70"
        />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-14 md:px-8">
          <p className="font-body text-sm tracking-wide-label uppercase text-gold">
            A nossa história
          </p>
          <h1 className="mt-3 font-display text-4xl text-cream md:text-5xl">
            Uma amiga bem informada, que já fez a curadoria por ti.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="flex flex-col gap-6 font-body text-lg leading-relaxed text-ink/80">
          <p>
            A Deodália Dias nasceu de uma convicção simples: a beleza angolana
            merece o mesmo cuidado, rigor e sofisticação de qualquer marca
            internacional de referência.
          </p>
          <p>
            Não vendemos tudo. Escolhemos. Cada produto que chega à nossa
            curadoria passa por um processo de seleção cuidadoso — testamos,
            questionamos e só avançamos quando temos a certeza de que vale o
            teu tempo e o teu dinheiro.
          </p>
          <p>
            Acreditamos que comprar beleza deve ser um momento de calma, não
            de confusão. Por isso, construímos uma experiência de compra
            simples, honesta e bonita, pensada para todas as mulheres
            angolanas — desde quem compra online todos os dias, até quem está
            a experimentar pela primeira vez.
          </p>
          <p>
            A tua rotina de beleza merece isto. Cuidamos de cada detalhe para
            que tu não precises de te preocupar com nada além de te sentires
            bem.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <ValueCard title="Curadoria" text="Escolhemos a dedo, nunca vendemos tudo." />
          <ValueCard title="Confiança" text="Preços claros, sem letras pequenas." />
          <ValueCard title="Cuidado" text="Suporte humano em cada etapa da compra." />
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/colecoes"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 font-body text-sm tracking-wide-label uppercase text-cream transition hover:bg-gold"
          >
            Ver a curadoria
          </Link>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-taupe/25 p-6 text-center">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mt-2 font-body text-sm text-ink/60">{text}</p>
    </div>
  );
}
