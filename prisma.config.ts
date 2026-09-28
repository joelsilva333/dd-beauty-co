import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: a ligação à base de dados deixou de estar no schema.prisma.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` não precisa de ligação, por isso não falha sem DATABASE_URL.
    url: process.env.DATABASE_URL ?? "",
  },
});
