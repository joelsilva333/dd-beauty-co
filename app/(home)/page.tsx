import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { getCuratedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SOCIAL_PROOF_STATS, TESTIMONIALS } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const curated = await getCuratedProducts();

  return (
    <div className="flex flex-col">
      <section className="relative flex h-[92vh] min-h-[600px] items-end overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop"
          alt="Ritual de beleza Deodália Dias"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/10 to-transparent" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
          <p className="fade-up eyebrow-light">Beauty &amp; Co.</p>
          <h1 className="fade-up mt-4 max-w-2xl font-display text-5xl leading-[1.05] text-cream sm:text-6xl md:text-7xl">
            A tua rotina de beleza merece isto.
          </h1>
          <p className="fade-up mt-6 max-w-md font-body text-cream/75">
            Uma curadoria pequena e cuidada de beleza angolana. Escolhida
            para ti, entregue à tua porta.
          </p>
          <Link href="/colecoes" className="fade-up btn-outline-light mt-9">
            Explorar coleções
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8 md:py-32">
        <div className="reveal mb-14 flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-6">
          <div className="flex flex-col gap-2">
            <p className="eyebrow-gold">Curadoria do mês</p>
            <h2 className="font-display text-4xl text-ink md:text-5xl">
              Escolhido a dedo para ti
            </h2>
          </div>
          <Link href="/colecoes" className="link-underline hidden sm:inline-flex">
            Ver tudo
          </Link>
        </div>

        {curated.length > 0 ? (
          <div className="reveal-stagger grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {curated.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  compareAtCents: product.compareAtCents,
                  category: product.category?.name,
                  image: product.images[0]
                    ? { url: product.images[0].url, alt: product.images[0].alt }
                    : undefined,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="font-body text-ink/60">
            A curadoria deste mês está a ser preparada. Volta em breve.
          </p>
        )}

        <Link href="/colecoes" className="link-underline mt-12 inline-flex sm:hidden">
          Ver tudo
        </Link>
      </section>

      {/* Fotografia grande, sem texto — uma respiração puramente visual entre secções. */}
      <section className="reveal relative aspect-21/9 w-full overflow-hidden bg-taupe/10 sm:aspect-3/1">
        <Image
          src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2000&auto=format&fit=crop"
          alt="Ritual de cuidado facial da curadoria Deodália Dias"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8 md:py-32">
        <div className="grid gap-6 md:grid-cols-2 md:gap-16">
          <div className="reveal relative aspect-4/5 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop"
              alt="Deodália Dias, a fundadora da marca"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="reveal relative -mt-16 ml-10 aspect-square w-2/3 self-end overflow-hidden md:mt-0 md:ml-0 md:aspect-4/5 md:w-full md:self-auto">
            <Image
              src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1200&auto=format&fit=crop"
              alt="Detalhe de um óleo da curadoria Deodália Dias"
              fill
              sizes="(max-width: 768px) 66vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="reveal mx-auto mt-16 flex max-w-2xl flex-col items-start gap-6 md:mt-20">
          <p className="eyebrow-gold">A nossa história</p>
          <h2 className="font-display text-4xl leading-tight text-ink md:text-5xl">
            Beleza angolana, feita com intenção.
          </h2>
          <p className="font-body leading-relaxed text-ink/70">
            A Deodália Dias nasceu para provar que a beleza angolana merece
            o mesmo cuidado que qualquer marca internacional. Não vendemos
            tudo — escolhemos, testamos e curamos cada produto que chega
            até ti. Cada peça carrega uma história e um ritual, comprada com
            calma para que tu também possas comprar com confiança.
          </p>
          <Link href="/sobre" className="link-underline mt-2 inline-flex w-fit">
            Conhecer a marca
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8 md:py-32">
        <div className="reveal-stagger grid gap-10 text-center sm:grid-cols-3 sm:divide-x sm:divide-ink/10">
          {SOCIAL_PROOF_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-3 px-4">
              <span className="font-display text-5xl text-ink">{stat.value}</span>
              <p className="font-body text-sm text-ink/55">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="reveal-stagger mt-20 grid gap-12 border-t border-ink/10 pt-16 md:grid-cols-3 md:gap-16">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col gap-5">
              <div className="flex gap-1 text-gold" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="font-display text-2xl leading-snug text-ink italic">
                “{t.quote}”
              </blockquote>
              <figcaption className="eyebrow">
                {t.name} — {t.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop"
          alt="Ritual de beleza com produtos Deodália Dias"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/35" aria-hidden="true" />
        <div className="reveal glass relative z-10 mx-4 flex max-w-xl flex-col items-center gap-6 px-8 py-14 text-center sm:mx-auto">
          <h2 className="font-display text-4xl text-cream md:text-5xl">
            Pronta para a tua próxima rotina?
          </h2>
          <p className="font-body text-cream/80">
            Explora a nossa curadoria e encontra o que é para ti. Compra 100%
            online, com toda a segurança.
          </p>
          <Link href="/colecoes" className="btn-outline-light mt-2">
            Ver coleções
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
