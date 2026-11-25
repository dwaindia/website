# DWA Form & Newsletter Worker (`POST /api/newsletter`, `POST /api/contact`)

This Worker handles `POST /api/newsletter`, `POST /api/contact`, and `GET /api/health` cleanly inside Cloudflare, storing records in Cloudflare D1 (`dwa-submissions`) and dispatching email alerts via Cloudflare Email Sending (`notify.dwaindiaa.org` → `dalitwelfareassociation1@gmail.com`).

## Cloudflare Architecture (Zero Third-Party Dependencies)

1. **Unified Root Deployment (`../wrangler.jsonc`):** Deploys static site assets + `/api/*` Worker routes together under the live `website` Worker (`assets.run_worker_first: ["/api/*"]`), allowing same-origin `POST /api/newsletter` and `POST /api/contact` on `https://dwaindiaa.org` and `https://www.dwaindiaa.org`.
2. **Database (`SUBMISSIONS_DB`):** Cloudflare D1 database **`dwa-submissions`** (`65a2e47f-e25f-4904-922e-a08f207a0a60`, APAC).
3. **Email Notifications (`EMAIL`):** Cloudflare Email Sending subdomain **`notify.dwaindiaa.org`** (`forms@notify.dwaindiaa.org` → `dalitwelfareassociation1@gmail.com` with `replyTo` set to the submitter). Root Microsoft 365 Outlook MX/SPF/DKIM records on `dwaindiaa.org` remain untouched.
4. **Minimal PII Logging:** Observability logs emit `requestId` (`crypto.randomUUID()`), endpoint path, and HTTP status only—never email addresses, phone numbers, or message text.
5. **Security Guards:** Enforces origin checks, 16 KB payload cap (`413`), honeypot filtering, and optional Turnstile verification.

## Deploy & Verify Commands

From the repository root (`/home/moses/WEBSITE`):

```bash
git pull
npx wrangler deploy
curl https://dwaindiaa.org/api/health
```

Optional external CRM / Turnstile secrets (never commit secrets in code):

```bash
npx wrangler secret put CRM_WEBHOOK_URL
npx wrangler secret put CRM_AUTH_TOKEN
npx wrangler secret put TURNSTILE_SECRET_KEY
```

## D1 Tables (`dwa-submissions`)

```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  consent_given INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_enquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  enquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  consent_given INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
```
