# Deodália Dias — Beauty & Co.

E-commerce da marca de beleza angolana Deodália Dias. Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma 7/PostgreSQL + Stripe + BitPay + socket.io + Uploadthing.

## Arquitetura

```
Vercel  ── site Next.js (páginas, API, pagamentos, notificações) ──► PostgreSQL
   │                                                    ▲
   │ POST /emit (HTTP, autenticado)                     │
   ▼                                                    │
Render  ── servidor socket.io (pasta realtime/) ──► browsers (cliente e equipa)
```

- **O site é a única fonte de verdade.** O servidor de tempo real não tem base de dados: recebe eventos do site e entrega-os às salas certas.
- **Salas**: `product:<id>` (pública, stock ao vivo), `order:<número>` (estado do pedido para a cliente), `chat:<id>` (conversa de apoio) e `admin` (novas encomendas, pagamentos, mensagens). As privadas exigem um token JWT curto, emitido pelo site.
- **Se o tempo real estiver em baixo, nada falha**: o chat e o pagamento Express passam a atualizar-se por consulta periódica.

## Como correr localmente

```bash
npm install
cp .env.example .env        # preencher (ver secções abaixo)
npm run db:migrate          # ou: npx prisma migrate deploy
npm run db:seed             # 6 produtos + admin

npm run dev                 # site em http://localhost:3000
npm run dev:realtime        # (outro terminal) tempo real em http://localhost:4000
```

Admin: `/admin/login` → `admin@deodaliadias.co.ao` / `deodalia2026` (**mudar antes de produção**).

A base local `deodalia` já está criada no PostgreSQL 16 desta máquina, separada da `fluvon_tv`.

## O que está implementado

**Loja**
- Homepage (hero, curadoria do mês, história, avaliações e números, chamada final), coleções com filtros simples, página de produto com galeria e zoom, "Comprar agora" e "Adicionar ao carrinho", stock ao vivo e tabela de entregas.
- Checkout linear com barra de progresso (Carrinho → Entrega → Pagamento → Confirmado): dados de entrega, escolha de pagamento, revisão final e confirmação com número do pedido e próximo passo.
- **Stock**: é reservado na mesma transação que cria a encomenda (nunca se vende o que não existe) e devolvido quando uma encomenda é cancelada ou o pagamento expira, sem risco de devolver duas vezes.
- Entregas por província em 3 zonas, com preço e prazo ([lib/shipping.ts](lib/shipping.ts)).
- "Os meus pedidos": pesquisa por número e telefone (aceita qualquer formato, ex.: `+244 923…`), com a linha do tempo "Recebido → Em preparação → A caminho → Entregue" a atualizar ao vivo.
- Botão "Precisas de ajuda?", com chat no site, WhatsApp e chamada telefónica.
- Animações de entrada ao fazer scroll (CSS nativo, com alternativa `IntersectionObserver`; respeitam `prefers-reduced-motion`), imagens AVIF/WebP e layout pensado primeiro para telemóvel.

**Pagamentos**
- **Stripe** (cartão): Checkout Session em USD, porque o Stripe não aceita AOA. A taxa de câmbio é fixa em [lib/exchange.ts](lib/exchange.ts) e a cliente vê o valor aproximado em dólares antes de pagar. O pagamento é confirmado por webhook **e** por consulta direta na página de confirmação.
- **BitPay** ([lib/bitpay.ts](lib/bitpay.ts)): Payment Intents, com tudo dentro do site.
  - *Multicaixa Express*: a cliente aprova na app e o ecrã atualiza sozinho.
  - *Referência Multicaixa*: mostramos entidade, referência e montante, com botões "Copiar"; a encomenda fica guardada até 72 h.
  - Se o Express for recusado, a cliente pode tentar outra vez ou mudar para Referência, sem perder a encomenda.
  - Webhook assinado (`BitPay-Signature`, HMAC com tolerância de 600 s) em `/api/webhooks/bitpay`.
  - Sem chave BitPay, funciona em modo manual: a equipa carrega em "Confirmar pagamento recebido".

**Notificações** ([lib/notifications.ts](lib/notifications.ts)): encomenda recebida (com a referência Multicaixa, quando se aplica), pagamento confirmado e cada mudança de estado, por WhatsApp (Meta Cloud API), SMS (Twilio, só se não houver WhatsApp) e email (Resend). Cada canal liga-se sozinho quando as suas chaves existem; sem elas, a mensagem só fica no log.

**Contas de cliente** (`/conta`)
- Registo e entrada por email/password, ou "Continuar com a Google" (OAuth 2.0 direto, sem bibliotecas — [lib/google-oauth.ts](lib/google-oauth.ts)). As duas formas levam à mesma conta quando o email coincide.
- Sessão própria, separada da do admin ([lib/customer-auth.ts](lib/customer-auth.ts), cookie `dd_customer_session`), protegida pelo mesmo `proxy.ts` que já guardava o `/admin`.
- Perfil: editar nome/telefone, e definir ou mudar a password (quem entrou só pela Google ainda não tem nenhuma).
- **Encomendas da conta**: lista e detalhe de todas as compras feitas com sessão iniciada (a compra sem conta continua possível — ver Decisões), com a mesma linha do tempo de estado da área "Os meus pedidos".
- **Fatura em PDF** por encomenda paga ([lib/invoice.tsx](lib/invoice.tsx), `@react-pdf/renderer`), só para a própria cliente (ou a equipa, pelo admin) — nunca por quem só souber o número do pedido.

**Painel** (`/admin`, também usável no telemóvel)
- Painel com o que precisa de atenção: encomendas para preparar, pagamentos por confirmar, mensagens por responder, vendas do mês e stock a acabar.
- Encomendas com filtros e pesquisa; página de detalhe com morada, botões "Ligar" e "WhatsApp", mudança de estado e confirmação manual do pagamento.
- Conversas do chat, com respostas em tempo real.
- Produtos: criar e editar, com **fotos carregadas do telemóvel ou do computador** (Uploadthing), foto principal e ordem.
- Avisos em tempo real (toast e som discreto) para novas encomendas e mensagens.

## Testes feitos (04/10/2026) — contas de cliente

- **Ponta a ponta com o site a correr (23/23)**: redirecionamento para `/conta/entrar` sem sessão (com `next` preservado); registo; email duplicado recusado; entrar/sair; editar perfil; definir e mudar password (exige a atual, exceto quando ainda não existe nenhuma); encomenda feita com sessão fica ligada à conta e aparece em `/conta/encomendas`; fatura em PDF só para a dona da encomenda (outra conta recebe 404 no detalhe e 401 na fatura).
- **Não testado**: o login com a Google em si (fluxo real contra `accounts.google.com`) — precisa de `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` reais, que não existem neste ambiente. A troca de código por token e a leitura do perfil seguem a API documentada da Google, mas só ficam confirmadas depois de testadas com credenciais verdadeiras.

## Testes feitos (28/09/2026)

- **Ponta a ponta com o site a correr (45/45)**:
  - páginas públicas e do admin;
  - reserva e devolução de stock;
  - Express aprovado (`923000000`) e recusado (`923000001`), com nova tentativa por Referência;
  - sessão Stripe de teste real;
  - seguimento do pedido;
  - regras do admin (sem sessão, estado inválido, cancelar duas vezes, reabrir);
  - chat;
  - eventos em tempo real.
- **Servidor de tempo real (13/13)**: salas públicas e privadas, tokens falsos ou de outra encomenda, e `/emit` sem a chave certa.
- **BitPay (10/10)**: verificação de assinatura do webhook e estados reais no sandbox.
- `eslint` limpo e `next build` a compilar.
- **Ainda não testado**: um telemóvel real numa rede lenta, e as notificações reais (não há chaves de WhatsApp, SMS ou email).

## Deploy

**Vercel (site)**: importar o repositório e definir as variáveis do `.env.example`. Obrigatórias: `DATABASE_URL`, `ADMIN_SESSION_SECRET` e `CUSTOMER_SESSION_SECRET` (o site recusa arrancar o admin ou as contas de cliente sem elas em produção — têm de ser diferentes uma da outra) e `NEXT_PUBLIC_SITE_URL`. Correr `npx prisma migrate deploy` contra a base de produção (ex.: Neon).

**Google Cloud Console (login com a Google)**: em [console.cloud.google.com](https://console.cloud.google.com) → criar projeto → *APIs & Services* → *OAuth consent screen* (tipo "External", preencher nome e email) → *Credentials* → *Create credentials* → *OAuth client ID* → tipo "Web application" → em *Authorized redirect URIs* adicionar `https://<site>/api/conta/google/callback` (e `http://localhost:3000/api/conta/google/callback` para testar em local). Copiar o *Client ID* e o *Client secret* para `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`. Sem estas chaves, o botão "Continuar com a Google" fica só desativado — email/password continua a funcionar.

**Render (tempo real)**: o [render.yaml](render.yaml) já define o serviço. Definir `REALTIME_SECRET` (igual ao da Vercel) e `ALLOWED_ORIGINS` (domínio do site). Na Vercel: `REALTIME_SERVER_URL` e `NEXT_PUBLIC_REALTIME_URL` com o URL do Render. Usar o plano *starter*: o gratuito adormece e corta as ligações.

**Webhooks a registar**
- Stripe → `https://<site>/api/webhooks/stripe`, com os eventos `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` e `checkout.session.async_payment_failed`.
- BitPay → `https://<site>/api/webhooks/bitpay` (painel BitPay → Developers → Webhooks) e copiar o `whsec_…` para `BITPAY_WEBHOOK_SECRET`.

## O que falta (depende de vocês)

1. **BitPay em produção**: a BitPay ainda só tem sandbox (aguarda a certificação da EMIS). Quando abrir, trocar `BITPAY_BASE_URL` para `https://api.bitpay.ao/v1` e usar a `sk_live_…`.
2. **`BITPAY_WEBHOOK_SECRET` e `STRIPE_WEBHOOK_SECRET`** por preencher. Localmente, o pagamento é confirmado por consulta direta, por isso funciona sem eles.
3. **Fotografia e textos reais**: as imagens são placeholders do Unsplash. Os testemunhos e números da homepage ([lib/site-content.ts](lib/site-content.ts)) são **exemplos** e têm de ser substituídos por avaliações reais antes do lançamento.
4. **Contactos reais**: `NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY` ainda têm o número placeholder.
5. **Notificações**: criar contas Resend, WhatsApp Business (Meta; é preciso um modelo de mensagem aprovado, com uma variável `{{1}}`) e/ou Twilio, e preencher as chaves.
6. **Taxa AOA→USD** fixa (950) em [lib/exchange.ts](lib/exchange.ts): atualizar regularmente ou ligar a uma fonte de câmbio.
7. **Mudar a password do admin** do seed.
8. **Testar num telemóvel real** com rede móvel.
9. **`CUSTOMER_SESSION_SECRET` e `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`** por preencher (ver secção *Deploy*). Sem o login com a Google configurado, o botão mostra uma mensagem a pedir para usar email e password — nada quebra.
10. **Sem "esqueci-me da password"**: por agora, quem perde a password tem de voltar a entrar pela Google (se o email coincidir) ou falar com a equipa para repor manualmente na base de dados.

## Decisões

- PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`; a ligação está em [prisma.config.ts](prisma.config.ts)). A instalação falhava antes porque o Prisma 7 deixou de aceitar `url` no `schema.prisma`.
- Hosting: Vercel (site) + Render (socket.io), porque a Vercel não mantém ligações WebSocket.
- Contas de cliente por sessão JWT própria (igual ao admin, não `NextAuth`/`Auth.js`) — mantém o site sem dependências pesadas de autenticação e todo o fluxo a correr do mesmo jeito que o resto do projeto. A compra sem conta continua possível: quem não quer criar conta consulta o pedido por número e telefone em "Os meus pedidos", como antes.
- Sem verificação de email nem "esqueci-me da password" nesta primeira versão — o login com a Google cobre a maior parte de quem não quer gerir mais uma password.
- BitPay integrada por Payment Intents, e não pelo checkout alojado, para que todo o pagamento aconteça dentro do site.
- Sem emojis na interface: os ícones são `lucide-react`.
- Paleta estrita: até os erros usam castanho e taupe, nunca vermelho.
