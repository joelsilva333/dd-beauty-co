// Login com Google (OAuth 2.0, fluxo "Authorization Code") — sem bibliotecas,
// só pedidos diretos aos endpoints públicos da Google. Ver README para os
// passos de configuração no Google Cloud Console.

export function googleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function redirectUri(origin: string): string {
  return `${origin}/api/conta/google/callback`;
}

// `state` é um valor aleatório guardado num cookie e devolvido pela Google
// no callback — protege contra CSRF (alguém a forjar um login em teu nome).
export function googleAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type GoogleTokenResponse = { access_token: string; id_token: string };

export async function exchangeGoogleCode(code: string, origin: string): Promise<GoogleTokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange falhou: ${res.status} ${await res.text()}`);
  return res.json();
}

export type GoogleProfile = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
};

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google userinfo falhou: ${res.status}`);
  const json = await res.json();
  return {
    id: json.sub,
    email: json.email,
    name: json.name ?? json.email,
    picture: json.picture,
    email_verified: Boolean(json.email_verified),
  };
}
