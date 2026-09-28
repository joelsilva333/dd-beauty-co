import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeMessage } from "@/lib/chat";
import { whatsappLink } from "@/lib/site-config";
import { AdminChatThread } from "@/components/admin/AdminChatThread";

export const dynamic = "force-dynamic";

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 300 } },
  });
  if (!conversation) notFound();

  if (conversation.unreadByTeam > 0) {
    await prisma.chatConversation.update({ where: { id }, data: { unreadByTeam: 0 } });
  }

  const phone = conversation.customerPhone ? `244${conversation.customerPhone}` : null;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/conversas"
        className="flex items-center gap-2 font-body text-sm text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Todas as conversas
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">{conversation.customerName}</h1>
          <p className="font-body text-sm text-ink/60">
            Início: {conversation.createdAt.toLocaleString("pt-AO", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        {phone && (
          <div className="flex gap-2">
            <a
              href={`tel:+${phone}`}
              className="flex h-11 items-center gap-2 rounded-full border border-taupe/40 px-4 font-body text-sm text-ink hover:border-gold"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Ligar
            </a>
            <a
              href={whatsappLink(undefined, phone)}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-2 rounded-full border border-taupe/40 px-4 font-body text-sm text-ink hover:border-gold"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        )}
      </div>

      <AdminChatThread
        conversationId={conversation.id}
        closed={conversation.closed}
        initialMessages={conversation.messages.map(serializeMessage)}
      />
    </div>
  );
}
