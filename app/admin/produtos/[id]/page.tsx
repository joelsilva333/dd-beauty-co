import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Editar produto</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDesc: product.shortDesc,
          story: product.story,
          ritual: product.ritual ?? "",
          price: (product.priceCents / 100).toString(),
          compareAtPrice: product.compareAtCents
            ? (product.compareAtCents / 100).toString()
            : "",
          stock: product.stock.toString(),
          categoryId: product.categoryId ?? "",
          featured: product.featured,
          curatedMonth: product.curatedMonth,
          active: product.active,
          imageUrls: product.images.map((i) => i.url).join(", "),
        }}
      />
    </div>
  );
}
