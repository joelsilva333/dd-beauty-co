import Link from "next/link";
import { ChevronRight, MessagesSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ fechadas?: string }>;
}) {
  const { fechadas } = await searchParams;
  const showClosed = fechadas === "1";

  const conversations = await prisma.chatConversation.findMany({
    where: { closed: showClosed },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Conversas</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/conversas"
            className={`rounded-full border px-4 py-2 font-body text-sm ${!showClosed ? "border-ink bg-ink text-cream" : "border-taupe/40 text-ink/70"}`}
          >
            Abertas
          </Link>
          <Link
            href="/admin/conversas?fechadas=1"
            className={`rounded-full border px-4 py-2 font-body text-sm ${showClosed ? "border-ink bg-ink text-cream" : "border-taupe/40 text-ink/70"}`}
          >
            Resolvidas
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {conversations.map((c) => {
          const last = c.messages[0];
          return (
            <Link
              key={c.id}
              href={`/admin/conversas/${c.id}`}
              className="flex items-center gap-4 rounded-xl border border-taupe/25 bg-white p-4 transition hover:border-gold"
            >
              <MessagesSquare
                className={`h-5 w-5 shrink-0 ${c.unreadByTeam > 0 ? "text-gold" : "text-taupe"}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-body ${c.unreadByTeam > 0 ? "font-medium text-ink" : "text-ink/80"}`}>
                    {c.customerName}
                  </p>
                  {c.unreadByTeam > 0 && (
                    <span className="rounded-full bg-gold px-2 py-0.5 font-body text-xs text-white">
                      {c.unreadByTeam} nova{c.unreadByTeam > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {last && (
                  <p className="truncate font-body text-sm text-ink/60">
                    {last.sender === "EQUIPA" ? "Tu: " : ""}
                    {last.body}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-body text-xs text-ink/40">
                {c.lastMessageAt.toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" })}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-taupe" aria-hidden="true" />
            </Link>
          );
        })}
        {conversations.length === 0 && (
          <p className="rounded-xl border border-taupe/25 bg-white px-4 py-8 text-center font-body text-sm text-ink/50">
            {showClosed ? "Ainda não há conversas resolvidas." : "Não há conversas abertas."}
          </p>
        )}
      </div>
    </div>
  );
}
