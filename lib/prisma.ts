import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  // Prisma 7 liga-se à base de dados através de um driver adapter.
  //
  // IMPORTANTE: em produção (Vercel), a DATABASE_URL TEM de ser o Transaction
  // Pooler do Supabase (porta 6543), nunca o Session Pooler (porta 5432).
  // Cada função serverless abre a sua própria pool de ligações — com o
  // Session Pooler (limite de 15 ligações no total) isso esgota-se com
  // qualquer tráfego real ("max clients reached in session mode"). O
  // Session Pooler só deve ser usado a partir de uma máquina de
  // desenvolvimento para correr `prisma migrate deploy` (precisa de
  // funcionalidades de sessão que o Transaction Pooler não suporta).
  //
  // `max` baixo por processo: cada instância serverless só precisa mesmo
  // de 1-2 ligações; mantém isto para não esgotar a pool do lado do Supabase
  // mesmo com muitas instâncias simultâneas.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
