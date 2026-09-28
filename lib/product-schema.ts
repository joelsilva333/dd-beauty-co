import { z } from "zod";
import { Prisma } from "@prisma/client";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Indica o nome do produto"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O endereço só pode ter letras minúsculas, números e hífenes"),
  shortDesc: z.string().trim().min(5, "Escreve uma descrição curta"),
  story: z.string().trim().min(10, "Conta a história por trás do produto"),
  ritual: z.string().trim().optional(),
  price: z.coerce.number().positive("O preço tem de ser maior que zero"),
  compareAtPrice: z.union([z.literal(""), z.coerce.number().nonnegative()]).optional(),
  stock: z.coerce.number().int().min(0, "O stock não pode ser negativo"),
  featured: z.boolean().default(false),
  curatedMonth: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string().optional(),
  imageUrls: z.array(z.url("Um dos links de imagem não é válido")).default([]),
});

export function productData(input: z.infer<typeof productSchema>) {
  return {
    name: input.name,
    slug: input.slug,
    shortDesc: input.shortDesc,
    story: input.story,
    ritual: input.ritual || null,
    priceCents: Math.round(input.price * 100),
    compareAtCents: input.compareAtPrice ? Math.round(Number(input.compareAtPrice) * 100) : null,
    stock: input.stock,
    featured: input.featured,
    curatedMonth: input.curatedMonth,
    active: input.active,
    categoryId: input.categoryId || null,
    images: {
      create: input.imageUrls.map((url, index) => ({ url, alt: input.name, order: index })),
    },
  };
}

export function productErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "Já existe um produto com este endereço (slug). Escolhe outro.";
    if (error.code === "P2003")
      return "Este produto já tem encomendas e não pode ser eliminado. Desmarca “Produto ativo” para o esconder do site.";
  }
  return null;
}
