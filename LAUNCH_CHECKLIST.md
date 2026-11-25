# Dalit Welfare Association (DWA) — Launch & Next Steps Checklist

## Step 1: Approved Field Photography (34 Image Placeholders)
- [ ] **Select & approve field photographs** for the **34 placeholder slots** across the site:
  - `index.html`: `Plate 01–07` (Hero, Vision & Mission, 4 Programme Pillars)
  - `about.html`: `Plate A0–A5` (Page Hero, Regional Context, Heritage Timeline, Objectives & Philosophy, Founding Principles, Registered Office)
  - `programs.html`: `Plate P0–P7` (Page Hero, 4 Programme Sectors, Digital/Banking & Micro-Enterprise Feature, 6-Stage Delivery Model, Geographical Footprint)
  - `accountability.html`: `Plate C0–C3` + `Plate G1–G3` (Page Hero, Statutory Profile, Ongoing/Completed Projects, 3 Archive Plates, Public Registries)
  - `donate.html`: `Plate D0–D4` (Page Hero, Direct Impact Tier Guide, Domestic Giving, Global Workplace Giving CTA, CSR & Partnerships)
  - `winter-appeal.html`: `Plate W0` (Winter Drought Relief & Senior Care Field Photography)
- [ ] **Verify informed consent & child protection clearance** before publishing any identifiable beneficiary or government school photograph (`Plate 05`, `Plate P3`, `Plate G2`, `Plate W0`).
- [ ] **Optimize approved photos** into responsive WebP + JPEG/PNG fallbacks matching each plate's target ratio (`4:5`, `4:3`, `16:9`), preserving originals safely outside the public site root.

## Step 2: Live Cloudflare Worker Form & Newsletter API (D1 + Email Sending)
- [x] Provisioned Cloudflare D1 database **`dwa-submissions`** (`65a2e47f-e25f-4904-922e-a08f207a0a60` in `APAC`) with `newsletter_subscribers` and `contact_enquiries` tables.
- [x] Enabled Cloudflare Email Sending subdomain **`notify.dwaindiaa.org`** (`status: ready`) delivering form alerts to verified `dalitwelfareassociation1@gmail.com` without touching root Microsoft 365 MX records.
- [x] Unified root `wrangler.jsonc` (`website` Worker + `ASSETS` with `run_worker_first: ["/api/*"]`, `SUBMISSIONS_DB`, `EMAIL`) and set `<meta name="dwa-api-base" content="same-origin">` in `index.html` and `donate.html`.
- [ ] Run `git pull && npx wrangler deploy` from `/home/moses/WEBSITE` (or connect **Workers & Pages** > **website** > **Settings** > **Build** to `dwaindia/website`) to publish `/api/newsletter`, `/api/contact`, and `/api/health` on `https://dwaindiaa.org`.
- [ ] Verify `GET https://dwaindiaa.org/api/health` returns `{"ok":true,"configured":true,"d1":true,"email":true}`, then test `#dwa-newsletter-form` and `#dwa-contact-form` end-to-end and inspect records in Cloudflare Dashboard **Storage & Databases** > **D1** > `dwa-submissions`.
- [ ] *(Optional)* Configure Wrangler secrets (`CRM_WEBHOOK_URL`, `CRM_AUTH_TOKEN`, `TURNSTILE_SECRET_KEY`) only if forwarding to an external CRM or adding Turnstile.

## Step 3: SEO Indexing, Privacy-Safe Analytics & Link Checks
- [ ] Connect `https://dwaindiaa.org/` in **Google Search Console** & **Bing Webmaster Tools** and submit `https://dwaindiaa.org/sitemap.xml`.
- [ ] Enable **Cloudflare Web Analytics** (cookie-free) or consent-gated analytics without passing email, phone, or personal names in URLs or events.
- [ ] Verify Open Graph & Twitter preview cards (`dwa-logo-square.png`) and confirm all external links (`Benevity`, `Give.do`, `GuideStar India`, `NGO Darpan`, `Instagram`, `LinkedIn`).

## Step 4: Cloudflare Workers Static Assets & GitHub Sync
- [x] Domain **`dwaindiaa.org`** and **`www.dwaindiaa.org`** are attached to the Cloudflare **`website`** Worker (`has_assets: true`).
- [ ] In Cloudflare Dashboard (**Workers & Pages** > **website** > **Settings** > **Build**), connect `github.com/dwaindia/website` (`main` branch, root directory `/`, deploy command: `npx wrangler deploy`) so tonight's photo upload pushes auto-deploy to `https://dwaindiaa.org` (uses root `wrangler.jsonc` & `.assetsignore`).
- [ ] Leave Microsoft 365 `MX`/`TXT`/`SPF`/`DKIM` records untouched on both `dwaindiaa.org` and `dwaindia.org`.
- [ ] Verify `_headers` (CSP, `X-Frame-Options`, caching) and updated `_redirects` (no `.html` redirect loops), enforce HTTPS / Universal SSL, and verify live mobile rendering (`320px`, `375px`, `768px`, `1280px`) on real iOS/Android browsers.
- [ ] Confirm Governing Body sign-off on **Privacy Policy** and **Refund and Cancellation Policy** modal wording, and update domestic Indian bank transfer details in `donate.html` once ready.
- [ ] Document rollback procedure: in Cloudflare Dashboard (**Workers & Pages** > **website** > **Deployments**), roll back to any previous Worker version, or revert the commit on GitHub `main`.
