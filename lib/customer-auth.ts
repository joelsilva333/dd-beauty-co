import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { customerSessionSecret } from "@/lib/customer-secret";

const COOKIE_NAME = "dd_customer_session";
const secret = customerSessionSecret;

export type CustomerSession = {
  customerId: string;
  email: string;
  name: string;
};

export async function createCustomerSession(session: CustomerSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const CUSTOMER_COOKIE_NAME = COOKIE_NAME;
