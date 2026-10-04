import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl, googleOAuthConfigured } from "@/lib/google-oauth";

const STATE_COOKIE = "dd_google_state";

// Começa o login com a Google. `next` é opcional (para onde voltar depois,
// ex: a cliente estava no checkout) — só aceitamos caminhos locais, nunca um
// URL externo, para não servir de redirecionador aberto.
export async function GET(request: NextRequest) {
  if (!googleOAuthConfigured()) {
    // É um clique num link, não um pedido de API — uma página amigável, não um JSON cru.
    const url = new URL("/conta/entrar", request.nextUrl.origin);
    url.searchParams.set("erro", "O login com a Google ainda não está disponível. Usa o email e a password.");
    return NextResponse.redirect(url);
  }

  const next = request.nextUrl.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/conta";

  const state = randomBytes(24).toString("base64url");
  const response = NextResponse.redirect(googleAuthUrl(request.nextUrl.origin, state));
  response.cookies.set(STATE_COOKIE, `${state}|${safeNext}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
