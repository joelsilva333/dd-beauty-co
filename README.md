# Deodália Dias — Beauty & Co.

E-commerce completo para a marca de beleza angolana Deodália Dias. Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma/PostgreSQL + Stripe + BitPayAO (stub).

## Estado atual (28/09/2026)

Construído nesta sessão:

- **Identidade visual**: fontes (Cormorant Garamond + Jost), paleta de cores (castanho-café, creme, taupe, dourado) em [app/globals.css](app/globals.css), logótipo em [components/Logo.tsx](components/Logo.tsx).
- **Layout global**: [Header](components/Header.tsx), [Footer](components/Footer.tsx), botão fixo de [WhatsApp](components/WhatsAppButton.tsx), tudo em [app/layout.tsx](app/layout.tsx). Ícones via `lucide-react` (sem emojis, por pedido explícito).
- **Carrinho**: contexto client-side com localStorage em [lib/cart-context.tsx](lib/cart-context.tsx).
- **Páginas públicas**: Homepage ([app/(home)/page.tsx](app/(home)/page.tsx)), Coleções com filtros ([app/colecoes/page.tsx](app/colecoes/page.tsx)), Produto ([app/produtos/[slug]/page.tsx](app/produtos/[slug]/page.tsx)), Carrinho ([app/carrinho/page.tsx](app/carrinho/page.tsx)), Checkout em 3 passos com barra de progresso ([app/checkout/page.tsx](app/checkout/page.tsx)), Confirmação de pedido ([app/checkout/confirmado/[orderNumber]/page.tsx](app/checkout/confirmado/[orderNumber]/page.tsx)), Os meus pedidos por número+telefone ([app/minha-conta/page.tsx](app/minha-conta/page.tsx)), Sobre ([app/sobre/page.tsx](app/sobre/page.tsx)), Contacto/FAQ ([app/contacto/page.tsx](app/contacto/page.tsx)).
- **Checkout/pagamentos**: [app/api/checkout/route.ts](app/api/checkout/route.ts) cria a encomenda na BD e, se Stripe, cria uma Checkout Session (conversão AOA→USD placeholder em [lib/exchange.ts](lib/exchange.ts), já que o Stripe não processa AOA). BitPayAO está como **stub**: a encomenda fica com `paymentStatus: PENDENTE` e não há integração real com a API da BitPayAO ainda — falta a documentação/credenciais deles.
- **Painel administrativo** em `/admin`: login com sessão JWT em cookie httpOnly ([lib/auth.ts](lib/auth.ts), [middleware.ts](middleware.ts)), dashboard, CRUD de produtos ([app/admin/produtos](app/admin/produtos)), gestão de encomendas com mudança de estado ([app/admin/encomendas/page.tsx](app/admin/encomendas/page.tsx)).
- **Base de dados**: schema Prisma completo em [prisma/schema.prisma](prisma/schema.prisma) (Product, Category, Order, OrderItem, AdminUser) e seed de exemplo em [prisma/seed.ts](prisma/seed.ts) com 6 produtos e utilizador admin (`admin@deodaliadias.co.ao` / `deodalia2026`).

## O que falta para ficar pronto para produção

1. **Base de dados real**: não há Postgres local nesta máquina (sem Docker). Precisas de:
   - Criar uma base de dados Postgres (recomendo [Neon](https://neon.tech), tem tier gratuito e integra bem com Vercel).
   - Copiar `.env.example` para `.env` e preencher `DATABASE_URL`.
   - Correr `npm run db:migrate` (cria as tabelas) e depois `npm run db:seed` (popula produtos + admin).
   - **Ainda não corri nada disto** — o schema nunca foi migrado contra uma BD real, por isso vale a pena testar o fluxo completo assim que tiveres a ligação.

2. **Instalação de dependências**: a instalação do `npm` nesta sessão teve problemas (o `prisma@latest` resolvido era uma release candidate da v8 que arrasta uma árvore de dependências gigante e causou erros de caminho longo no Windows). Já fixei as versões para `prisma@7.10.0` e `@prisma/client@7.10.0` (estáveis) no `package.json` e lancei um `npm install` limpo em background — **confirma que terminou sem erros** antes de continuares (`npm run dev` vai falhar se não tiver terminado bem).

3. **Stripe**: chave de teste (`STRIPE_SECRET_KEY`) e webhook secret (`STRIPE_WEBHOOK_SECRET`) ainda por preencher no `.env`. O webhook está em [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts) — precisa de `stripe listen` local para testar.

4. **BitPayAO**: não tenho documentação da API deles nesta sessão, por isso o fluxo é apenas um placeholder (marca a encomenda como pendente e mostra uma mensagem no ecrã de confirmação). Quando tiveres as credenciais/documentação, será preciso substituir o bloco `if (data.paymentMethod === "BITPAY_AO")` em `app/api/checkout/route.ts`.

5. **Imagens**: as fotos usadas são placeholders do Unsplash (só para visualizar o layout). Substituir por fotografia real de produto antes de lançar — o domínio `images.unsplash.com` está autorizado em [next.config.ts](next.config.ts), vais precisar de adicionar o domínio onde alojares as fotos finais (ex: Vercel Blob, Cloudinary).

6. **Notificações**: o requisito de emails/SMS/WhatsApp automáticos de confirmação ainda não está implementado — falta escolher um provedor (ex: Resend para email, WhatsApp Business API ou Twilio para mensagens).

7. **Testar em telemóvel real** numa rede lenta, como pede o briefing — ainda não foi validado.

## Como continuar

```bash
# 1. confirmar que as dependências instalaram bem
npm install

# 2. configurar a base de dados
cp .env.example .env
# preencher DATABASE_URL no .env

npm run db:migrate
npm run db:seed

# 3. arrancar o site
npm run dev
```

Login do admin (depois do seed): `admin@deodaliadias.co.ao` / `deodalia2026` em `/admin/login`.

## Decisões tomadas nesta sessão

- **Base de dados**: PostgreSQL + Prisma (confirmado pelo utilizador).
- **Hosting alvo**: Vercel (confirmado pelo utilizador).
- **Pagamentos**: sandbox/placeholders por agora (confirmado pelo utilizador) — Stripe funcional em modo teste, BitPayAO como stub.
- **Conta de cliente**: em vez de sistema de login com password para clientes, optei por consulta de pedido por número + telefone (`/minha-conta`), mais simples para o público com baixa literacia digital descrito no briefing. Se preferires contas com password, é uma mudança a discutir.
- **Sem emojis na interface** — todos os ícones usam `lucide-react` (pedido explícito do utilizador a meio da sessão).
