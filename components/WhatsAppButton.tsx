import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/244900000000?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20a%20minha%20compra"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-cream shadow-lg shadow-ink/20 transition hover:bg-gold"
      aria-label="Falar connosco pelo WhatsApp"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden font-body text-sm sm:inline">Precisas de ajuda?</span>
    </a>
  );
}
