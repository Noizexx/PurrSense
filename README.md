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

Apri `wrangler.toml` e incolla il `database_id` dove indicato.

---

## PARTE 4 — Configura le variabili d'ambiente

Genera due stringhe random (esegui due volte):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Apri `.env.local` e compila:
```env
AUTH_SECRET=<prima-stringa-random>
AUTH_URL=http://localhost:3000
RESEND_API_KEY=<da resend.com - gratis>
RESEND_FROM=Dashboard Gatto <noreply@tuodominio.com>
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SHARE_SECRET=<seconda-stringa-random>
```

Per `RESEND_API_KEY`: registrati su https://resend.com → API Keys → Create.

---

## PARTE 5 — Crea le tabelle e testa in locale

```bash
npm run db:migrate:local    # crea le tabelle
npm run db:seed:local       # carica dati di esempio (opzionale)
npm run dev                 # avvia in locale su http://localhost:3000
```

---

## PARTE 6 — Carica su GitHub

1. Vai su https://github.com/new → crea repo `gatto-dashboard` (Private)
2. Esegui:

```bash
git init
git add .
git commit -m "feat: dashboard gatto MVP"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/gatto-dashboard.git
git push -u origin main
```

---

## PARTE 7 — Deploy su Cloudflare Pages

### 7.1 Collega il repo

1. **dash.cloudflare.com** → Workers & Pages → Create → Pages
2. Connect to Git → autorizza GitHub → seleziona `gatto-dashboard`
3. Clicca "Begin setup"

### 7.2 Configura il build

| Campo | Valore |
|-------|--------|
| Framework preset | `Next.js` |
| Build command | `npx @cloudflare/next-on-pages@1` |
| Build output directory | `.vercel/output/static` |

### 7.3 Aggiungi le variabili d'ambiente

Nella stessa schermata, sezione "Environment variables":

| Variabile | Valore |
|-----------|--------|
| `NODE_VERSION` | `20` |
| `AUTH_SECRET` | *(stessa di .env.local)* |
| `RESEND_API_KEY` | *(la tua chiave Resend)* |
| `RESEND_FROM` | `Dashboard Gatto <noreply@tuodominio.com>` |
| `SHARE_SECRET` | *(stessa di .env.local)* |

Clicca **Save and Deploy** → attendi 3-5 minuti.

---

### 7.4 Aggiungi i binding D1 e R2

Dopo il deploy: **Settings → Functions**

**D1 binding:**
- Add binding → Variable name: `DB` → seleziona `gatto-dashboard-db` → Save

**R2 binding:**
- Add binding → Variable name: `R2` → seleziona `gatto-uploads` → Save

---

### 7.5 Aggiungi l'URL definitivo

Il tuo URL sarà tipo `https://gatto-dashboard.pages.dev`

In **Settings → Environment variables** aggiungi:

| Variabile | Valore |
|-----------|--------|
| `AUTH_URL` | `https://gatto-dashboard.pages.dev` |
| `NEXT_PUBLIC_BASE_URL` | `https://gatto-dashboard.pages.dev` |

---

### 7.6 Re-deploy finale

**Deployments** → tre puntini sull'ultimo deployment → **Retry deployment**

---

## PARTE 8 — Carica il database in produzione

```bash
npm run db:migrate:prod     # crea le tabelle sul D1 di produzione
npm run db:seed:prod        # opzionale: dati di esempio
```

---

## ✅ L'app è online!

Vai su `https://gatto-dashboard.pages.dev`:
1. Clicca Registrati
2. Inserisci nome, email, password
3. Verifica l'email → Login → Crea il tuo gatto

---

## Aggiornamenti futuri (automatici)

```bash
git add .
git commit -m "descrizione modifica"
git push
# → Cloudflare fa il deploy automatico in ~2 minuti
```

---

## Risoluzione problemi

| Problema | Soluzione |
|----------|-----------|
| Build fallisce | Controlla che tutti i file siano stati committati |
| "No such binding DB" | Aggiungi il D1 binding in Settings → re-deploy |
| Login non funziona | Verifica `AUTH_SECRET` e `AUTH_URL` in produzione |
| Email non arriva | Controlla `RESEND_API_KEY` e spam |
| Foto non si caricano | Verifica binding R2 in Settings |

---

## Costi (piano Free Cloudflare)

| Servizio | Limite | Note |
|----------|--------|------|
| Pages builds | 500/mese | Più che sufficiente |
| D1 database | 5M letture/giorno | OK per 100+ utenti |
| R2 storage | 10 GB | Per le foto dei gatti |
| **Totale** | **€0** | Piano free copre tutto |

---

## Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Database**: Cloudflare D1 (SQLite serverless)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5 (email/password + Google opzionale)
- **Email**: Resend (verifica account)
- **Storage foto**: Cloudflare R2
- **Deploy**: Cloudflare Pages (CI/CD da GitHub)
