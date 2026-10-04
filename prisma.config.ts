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
    // As migrações (prisma migrate deploy/dev) correm aqui, SEPARADO do que a
    // app usa em runtime (lib/prisma.ts, sempre DATABASE_URL). Em produção, a
    // app liga-se pelo Transaction Pooler do Supabase (porta 6543) — mas esse
    // pooler não é fiável para DDL (criar/alterar tabelas). As migrações
    // precisam do Session Pooler ou da ligação direta (porta 5432), por isso
    // usam DIRECT_DATABASE_URL quando existir; localmente não há essa
    // distinção, por isso cai para DATABASE_URL.
    // `prisma generate` não precisa de ligação, por isso não falha sem nenhuma das duas.
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
});
