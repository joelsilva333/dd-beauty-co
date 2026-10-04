import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeGoogleCode, fetchGoogleProfile } from "@/lib/google-oauth";
import { createCustomerSession } from "@/lib/customer-auth";

const STATE_COOKIE = "dd_google_state";

function failure(origin: string, message: string) {
  const url = new URL("/conta/entrar", origin);
  url.searchParams.set("erro", message);
  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const stored = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !returnedState || !stored) {
    return failure(origin, "O pedido de login expirou. Tenta novamente.");
  }

  const [expectedState, next] = stored.split("|");
  if (returnedState !== expectedState) {
    return failure(origin, "O pedido de login não é válido. Tenta novamente.");
  }

  try {
    const tokens = await exchangeGoogleCode(code, origin);
    const profile = await fetchGoogleProfile(tokens.access_token);

    // Já existe conta ligada a esta Google? Senão, liga pelo email (mesma
    // pessoa que já tinha conta com password); senão, cria conta nova.
    let customer = await prisma.customer.findUnique({ where: { googleId: profile.id } });
    if (!customer) {
      const byEmail = await prisma.customer.findUnique({ where: { email: profile.email } });
      customer = byEmail
        ? await prisma.customer.update({
            where: { id: byEmail.id },
            data: { googleId: profile.id, avatarUrl: profile.picture ?? byEmail.avatarUrl },
          })
        : await prisma.customer.create({
            data: {
              name: profile.name,
              email: profile.email,
              googleId: profile.id,
              avatarUrl: profile.picture,
            },
          });
    }

    await createCustomerSession({ customerId: customer.id, email: customer.email, name: customer.name });

    const response = NextResponse.redirect(new URL(next || "/", origin));
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (error) {
    console.error("[google-oauth] callback falhou:", error);
    return failure(origin, "Não foi possível entrar com a Google. Tenta novamente.");
  }
}
