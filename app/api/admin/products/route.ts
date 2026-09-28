import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      shortDesc: body.shortDesc,
      story: body.story,
      ritual: body.ritual || null,
      priceCents: Math.round(Number(body.price) * 100),
      compareAtCents: body.compareAtPrice
        ? Math.round(Number(body.compareAtPrice) * 100)
        : null,
      stock: Number(body.stock) || 0,
      featured: Boolean(body.featured),
      curatedMonth: Boolean(body.curatedMonth),
      active: body.active !== false,
      categoryId: body.categoryId || null,
      images: {
        create: (body.imageUrls as string[]).map((url, index) => ({
          url,
          alt: body.name,
          order: index,
        })),
      },
    },
  });

  return NextResponse.json({ product });
}
