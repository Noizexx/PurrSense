# 🐾 Dashboard Gatto

App web multi-utente per monitorare salute e benessere dei gatti.
Ogni utente si registra e gestisce i propri gatti in modo completamente privato.

> ⚠️ Strumento di monitoraggio personale — non sostituisce la visita veterinaria.
> Range indicativi da WSAVA/AAHA/AAFP. Consulta sempre il tuo veterinario.

---

## PARTE 1 — Prepara il progetto

```bash
cd gatto-dashboard
npm install
cp .env.example .env.local
```

---

## PARTE 2 — Account Cloudflare + Wrangler

1. Crea account gratis su https://dash.cloudflare.com/sign-up
2. Installa il tool Cloudflare:

```bash
npm install -g wrangler
wrangler login
# Si apre il browser → clicca Allow
```

---

## PARTE 3 — Crea database D1 e storage R2

```bash
# Crea il database
wrangler d1 create gatto-dashboard-db
# → Copia il database_id dall'output!

# Crea lo storage per le foto
wrangler r2 bucket create gatto-uploads
```

Apri `wrangler.toml` e incolla il `database_id` dove indicato:

```toml
name = "gatto-dashboard"
main = ".open-next/worker.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[d1_databases]]
binding = "DB"
database_name = "gatto-dashboard-db"
database_id = "IL-TUO-DATABASE-ID"

[[r2_buckets]]
binding = "R2"
bucket_name = "gatto-uploads"
```

---

## PARTE 4 — Configura le variabili d'ambiente

Genera due stringhe random (esegui due volte):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.1 Sviluppo locale — `.env.local`

```env
AUTH_SECRET=<prima-stringa-random>
AUTH_URL=http://localhost:3000
RESEND_API_KEY=<da resend.com - gratis>
RESEND_FROM=Dashboard Gatto <noreply@tuodominio.com>
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SHARE_SECRET=<seconda-stringa-random>
```

Per `RESEND_API_KEY`: registrati su https://resend.com → API Keys → Create.

### 4.2 Produzione — variabili sul Worker

Le variabili d'ambiente per il Worker si impostano tramite Wrangler (mai committare i segreti nel `wrangler.toml`):

```bash
wrangler secret put AUTH_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM
wrangler secret put SHARE_SECRET
wrangler secret put AUTH_URL          # es. https://gatto-dashboard.workers.dev
wrangler secret put NEXT_PUBLIC_BASE_URL  # stesso valore di AUTH_URL
```

Oppure in una sola volta dal pannello: **dash.cloudflare.com → Workers & Pages → gatto-dashboard → Settings → Variables and Secrets**.

---

## PARTE 5 — Crea le tabelle e testa in locale

```bash
npm run db:migrate:local    # crea le tabelle nel D1 locale
npm run db:seed:local       # carica dati di esempio (opzionale)
npm run dev                 # avvia Next.js in locale su http://localhost:3000
```

Per testare con il runtime Cloudflare in locale (miniflare):

```bash
npm run preview             # build OpenNext + wrangler dev
```

---

## PARTE 6 — Carica su GitHub

```bash
git init
git add .
git commit -m "feat: dashboard gatto MVP"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/gatto-dashboard.git
git push -u origin main
```

> Il `database_id` nel `wrangler.toml` non è un segreto — può stare nel repo.
> I segreti (password, API key) vanno **solo** tramite `wrangler secret put`.

---

## PARTE 7 — Deploy su Cloudflare Worker

### 7.1 Build e deploy

```bash
npm run deploy
# equivale a: opennextjs-cloudflare build && wrangler deploy
```

Al primo deploy il Worker sarà disponibile su:
`https://gatto-dashboard.<tuo-account>.workers.dev`

### 7.2 Dominio personalizzato (opzionale)

**dash.cloudflare.com → Workers & Pages → gatto-dashboard → Settings → Domains & Routes**
→ Add Custom Domain → inserisci il tuo dominio.

---

## PARTE 8 — Carica il database in produzione

```bash
npm run db:migrate:prod     # crea le tabelle sul D1 di produzione
npm run db:seed:prod        # opzionale: dati di esempio
```

---

## ✅ L'app è online!

Vai su `https://gatto-dashboard.<tuo-account>.workers.dev`:
1. Clicca **Registrati**
2. Inserisci nome, email, password
3. Verifica l'email → Login → Crea il tuo gatto

---

## Aggiornamenti futuri

```bash
git add .
git commit -m "descrizione modifica"
git push

# Deploy manuale:
npm run deploy
```

> Per CI/CD automatico da GitHub: **dash.cloudflare.com → Workers & Pages → gatto-dashboard → Deployments → Connect to Git**.

---

## Risoluzione problemi

| Problema | Soluzione |
|----------|-----------|
| Build fallisce | Controlla che tutti i file siano stati committati |
| `DB is not defined` | Verifica `database_id` nel `wrangler.toml` e che il binding si chiami `DB` |
| Login non funziona | Verifica `AUTH_SECRET` e `AUTH_URL` con `wrangler secret list` |
| Email non arriva | Controlla `RESEND_API_KEY` e spam |
| Foto non si caricano | Verifica che il bucket R2 esista e il binding si chiami `R2` |
| Worker non trovato | Esegui `wrangler whoami` per verificare l'account attivo |

---

## Costi (piano Free Cloudflare)

| Servizio | Limite | Note |
|----------|--------|------|
| Workers requests | 100K/giorno | Più che sufficiente |
| D1 database | 5M letture/giorno | OK per 100+ utenti |
| R2 storage | 10 GB | Per le foto dei gatti |
| **Totale** | **€0** | Piano free copre tutto |

---

## Stack

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Runtime**: Cloudflare Workers (via `@opennextjs/cloudflare`)
- **Database**: Cloudflare D1 (SQLite serverless)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5 (email/password + Google opzionale)
- **Email**: Resend (verifica account)
- **Storage foto**: Cloudflare R2
- **Deploy**: `npm run deploy` → `opennextjs-cloudflare build` + `wrangler deploy`
