import { z } from "zod";
import { Prisma } from "@prisma/client";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Indica o nome da categoria"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O endereço só pode ter letras minúsculas, números e hífenes"),
  order: z.coerce.number().int().min(0, "A ordem não pode ser negativa").default(0),
});

export function categoryErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "Já existe uma categoria com este endereço (slug). Escolhe outro.";
  }
  return null;
}
