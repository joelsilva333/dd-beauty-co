import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "A marca — Deodália Dias",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1571875257727-256c39da42af?q=80&w=1600&auto=format&fit=crop"
          alt="Deodália Dias — Beauty & Co."
          priority
          sizes="100vw"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/5 to-transparent" aria-hidden="true" />
        <div className="fade-up relative z-10 mx-auto w-full max-w-4xl px-4 pb-14 md:px-8">
          <p className="eyebrow-light">A nossa história</p>
          <h1 className="mt-3 font-display text-4xl text-cream md:text-5xl">
            Uma amiga bem informada, que já fez a curadoria por ti.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
        <div className="reveal-stagger flex flex-col gap-6 font-body text-lg leading-relaxed text-ink/80">
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
        </div>

        <div className="reveal relative mt-14 aspect-video w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1631730359585-38a4935cbec4?q=80&w=1600&auto=format&fit=crop"
            alt="Ritual de beleza da curadoria Deodália Dias"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <div className="reveal-stagger mt-14 flex flex-col gap-6 font-body text-lg leading-relaxed text-ink/80">
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

        <div className="reveal-stagger mt-16 grid gap-10 border-t border-ink/10 pt-12 sm:grid-cols-3">
          <ValueCard title="Curadoria" text="Escolhemos a dedo, nunca vendemos tudo." />
          <ValueCard title="Confiança" text="Preços claros, sem letras pequenas." />
          <ValueCard title="Cuidado" text="Suporte humano em cada etapa da compra." />
        </div>

        <div className="mt-16 text-center">
          <Link href="/colecoes" className="btn-dark">
            Ver a curadoria
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="font-body text-sm text-ink/60">{text}</p>
    </div>
  );
}
