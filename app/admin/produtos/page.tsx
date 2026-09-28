import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-body text-sm text-cream transition hover:bg-gold"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo produto
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-taupe/25 bg-white">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-taupe/10 text-ink/60">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-taupe/15">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/produtos/${product.id}`}
                    className="text-ink hover:text-gold"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/60">
                  {product.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3">{formatKwanza(product.priceCents)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      product.active
                        ? "bg-gold/15 text-gold"
                        : "bg-taupe/15 text-ink/50"
                    }`}
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-8 text-center font-body text-sm text-ink/50">
            Ainda não há produtos. Cria o primeiro.
          </p>
        )}
      </div>
    </div>
  );
}
