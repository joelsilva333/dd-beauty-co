import Link from "next/link";
import { getActiveProducts, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; preco?: string }>;
}) {
  const { categoria, preco } = await searchParams;
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);

  let filtered = categoria
    ? products.filter((p) => p.category?.slug === categoria)
    : products;

  if (preco) {
    filtered = filtered.filter((p) => {
      const value = p.priceCents / 100;
      if (preco === "ate-15000") return value <= 15000;
      if (preco === "15000-40000") return value > 15000 && value <= 40000;
      if (preco === "mais-40000") return value > 40000;
      return true;
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <div className="mb-10 flex flex-col gap-2">
        <p className="font-body text-sm tracking-wide-label uppercase text-gold">
          Coleções
        </p>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Uma curadoria pequena, feita com cuidado
        </h1>
        <p className="max-w-lg font-body text-ink/60">
          Não encontras aqui centenas de produtos — encontras os que valem a
          pena.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <FilterLink href="/colecoes" active={!categoria}>
          Todos
        </FilterLink>
        {categories.map((cat) => (
          <FilterLink
            key={cat.id}
            href={`/colecoes?categoria=${cat.slug}`}
            active={categoria === cat.slug}
          >
            {cat.name}
          </FilterLink>
        ))}
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <PriceLink searchCategoria={categoria} preco={preco} value={undefined}>
          Qualquer preço
        </PriceLink>
        <PriceLink searchCategoria={categoria} preco={preco} value="ate-15000">
          Até 15.000 Kz
        </PriceLink>
        <PriceLink searchCategoria={categoria} preco={preco} value="15000-40000">
          15.000 — 40.000 Kz
        </PriceLink>
        <PriceLink searchCategoria={categoria} preco={preco} value="mais-40000">
          Acima de 40.000 Kz
        </PriceLink>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
          {filtered.map((product) => (
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
          Não encontrámos produtos com este filtro.
        </p>
      )}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 font-body text-sm transition ${
        active
          ? "border-gold bg-gold text-white"
          : "border-taupe/40 text-ink/70 hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </Link>
  );
}

function PriceLink({
  searchCategoria,
  preco,
  value,
  children,
}: {
  searchCategoria?: string;
  preco?: string;
  value?: string;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (searchCategoria) params.set("categoria", searchCategoria);
  if (value) params.set("preco", value);
  const href = `/colecoes${params.toString() ? `?${params.toString()}` : ""}`;
  const active = value === preco || (!value && !preco);

  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 font-body text-sm transition ${
        active
          ? "border-ink bg-ink text-cream"
          : "border-taupe/40 text-ink/70 hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}
