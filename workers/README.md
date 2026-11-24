# DWA Phase 3 — Cloudflare Worker Form & Newsletter API

This Worker handles `POST /api/newsletter` and `POST /api/contact` securely without exposing CRM credentials or API tokens in browser JavaScript.

## Security & Data Rules

1. **Zero secrets in Git:** Configure CRM and Turnstile keys exclusively via Wrangler secrets (`wrangler secret put`). Never commit `.dev.vars` or `.env`.
2. **No false confirmations:** The Worker returns `503 BACKEND_NOT_CONFIGURED` unless `CRM_WEBHOOK_URL` or a D1 `SUBMISSIONS_DB` binding confirms receipt.
3. **Minimal PII logging:** Observability logs emit `requestId` (`crypto.randomUUID()`), endpoint path, and HTTP status only—never email addresses, phone numbers, or message text.
4. **Payload bounds & CORS:** Rejects payloads over 16 KB (`413`) and enforces `ALLOWED_ORIGINS`.

## Setup & Deployment Commands

1. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Configure required secrets:
   ```bash
   cd workers/form-api
   npx wrangler secret put CRM_WEBHOOK_URL
   npx wrangler secret put CRM_AUTH_TOKEN
   # Optional spam protection:
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```
3. Run locally:
   ```bash
   npx wrangler dev
   ```
4. Deploy to Cloudflare Workers:
   ```bash
   npx wrangler deploy
   ```
5. Connect the static site (`index.html` and `donate.html`) to the deployed Worker by setting `<meta name="dwa-api-base" content="https://dwa-form-api.<subdomain>.workers.dev">` (or adding a Cloudflare route on `/api/*` on the production domain).

## Optional D1 Schema (If Used Alongside Salesforce / CRM)

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
