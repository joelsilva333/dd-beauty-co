import Image from "next/image";
import Link from "next/link";
import { getCuratedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const curated = await getCuratedProducts();

  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[85vh] items-end overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop"
          alt="Ritual de beleza Deodália Dias"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
          <p className="fade-up font-body text-sm tracking-wide-label uppercase text-gold">
            Beauty &amp; Co.
          </p>
          <h1 className="fade-up mt-3 max-w-xl font-display text-4xl text-cream md:text-6xl">
            A tua rotina de beleza merece isto.
          </h1>
          <p className="fade-up mt-4 max-w-md font-body text-cream/80">
            Uma curadoria pequena e cuidada de beleza angolana. Escolhida
            para ti, entregue à tua porta.
          </p>
          <Link
            href="/colecoes"
            className="fade-up mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-body text-sm tracking-wide-label uppercase text-white transition hover:bg-cream hover:text-ink"
          >
            Explorar coleções
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
        <div className="mb-10 flex flex-col gap-2">
          <p className="font-body text-sm tracking-wide-label uppercase text-gold">
            Curadoria do mês
          </p>
          <h2 className="font-display text-3xl text-ink">
            Escolhido a dedo para ti
          </h2>
        </div>

        {curated.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
            {curated.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  slug: product.slug,
                  name: product.name,
                  shortDesc: product.shortDesc,
                  priceCents: product.priceCents,
                  compareAtCents: product.compareAtCents,
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
      </section>

      <section className="bg-taupe/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop"
              alt="Deodália Dias, a fundadora da marca"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-5">
            <p className="font-body text-sm tracking-wide-label uppercase text-gold">
              A nossa história
            </p>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              Beleza angolana, feita com intenção.
            </h2>
            <p className="font-body text-ink/70">
              A Deodália Dias nasceu para provar que a beleza angolana merece
              o mesmo cuidado que qualquer marca internacional. Não vendemos
              tudo — escolhemos, testamos e curamos cada produto que chega
              até ti.
            </p>
            <p className="font-body text-ink/70">
              Cada peça da nossa coleção carrega uma história e um ritual.
              Compramos com calma, para que tu também possas comprar com
              confiança.
            </p>
            <Link
              href="/sobre"
              className="font-body text-sm tracking-wide-label uppercase text-gold underline underline-offset-4"
            >
              Conhecer a marca
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-4xl text-gold">4.9/5</span>
            <p className="font-body text-sm text-ink/60">
              avaliação média das nossas clientes
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-4xl text-gold">+2.500</span>
            <p className="font-body text-sm text-ink/60">
              clientes satisfeitas em todo o país
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-4xl text-gold">18</span>
            <p className="font-body text-sm text-ink/60">
              províncias já entregues
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-center text-cream">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4">
          <h2 className="font-display text-3xl md:text-4xl">
            Pronta para a tua próxima rotina?
          </h2>
          <p className="font-body text-cream/70">
            Explora a nossa curadoria e encontra o que é para ti. Compra 100%
            online, com toda a segurança.
          </p>
          <Link
            href="/colecoes"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-body text-sm tracking-wide-label uppercase text-white transition hover:bg-cream hover:text-ink"
          >
            Ver coleções
          </Link>
        </div>
      </section>
    </div>
  );
}
