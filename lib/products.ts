import { prisma } from "@/lib/prisma";

export function getActiveProducts() {
  return prisma.product.findMany({
    where: { active: true },
    include: { images: { orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getCuratedProducts() {
  return prisma.product.findMany({
    where: { active: true, curatedMonth: true },
    include: { images: { orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export function getProductsByCategory(categorySlug: string) {
  return prisma.product.findMany({
    where: { active: true, category: { slug: categorySlug } },
    include: { images: { orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });
}
