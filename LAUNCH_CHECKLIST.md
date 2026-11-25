# Dalit Welfare Association (DWA) — Launch & Next Steps Checklist

## Step 1: Approved Field Photography (33 Image Placeholders)
- [ ] **Select & approve field photographs** for the **33 placeholder slots** across the site:
  - `index.html`: `Plate 01–07` (Hero, Vision & Mission, 4 Programme Pillars)
  - `about.html`: `Plate A0–A5` (Page Hero, Regional Context, Heritage Timeline, Objectives & Philosophy, Founding Principles, Registered Office)
  - `programs.html`: `Plate P0–P7` (Page Hero, 4 Programme Sectors, Digital/Banking & Micro-Enterprise Feature, 6-Stage Delivery Model, Geographical Footprint)
  - `accountability.html`: `Plate C0–C3` + `Plate G1–G3` (Page Hero, Statutory Profile, Ongoing/Completed Projects, 3 Archive Plates, Public Registries)
  - `donate.html`: `Plate D0–D4` (Page Hero, Direct Impact Tier Guide, Domestic Giving, Global Workplace Giving CTA, CSR & Partnerships)
- [ ] **Verify informed consent & child protection clearance** before publishing any identifiable beneficiary or government school photograph (`Plate 05`, `Plate P3`, `Plate G2`).
- [ ] **Optimize approved photos** into responsive WebP + JPEG/PNG fallbacks matching each plate's target ratio (`4:5`, `4:3`, `16:9`), preserving originals safely outside the public site root.

## Step 2: Live Cloudflare Worker Form & Newsletter API
- [ ] Install Node/Wrangler locally and run `npx wrangler login` inside `workers/form-api/`.
- [ ] Configure Wrangler secrets (`CRM_WEBHOOK_URL`, `CRM_AUTH_TOKEN`, optional `TURNSTILE_SECRET_KEY`).
- [ ] Deploy the Worker (`npx wrangler deploy`) and verify `GET /api/health` returns `{"ok":true,"configured":true}`.
- [ ] Set `<meta name="dwa-api-base" content="https://...">` in `index.html` and `donate.html` (or configure Cloudflare Pages route `/api/*`).
- [ ] Test `#dwa-newsletter-form` and `#dwa-contact-form` end-to-end and verify submissions arrive in CRM.

## Step 3: SEO Indexing, Privacy-Safe Analytics & Link Checks
- [ ] Connect `https://dalitwelfareassociation.org/` in **Google Search Console** & **Bing Webmaster Tools** and submit `https://dalitwelfareassociation.org/sitemap.xml`.
- [ ] Enable **Cloudflare Web Analytics** (cookie-free) or consent-gated analytics without passing email, phone, or personal names in URLs or events.
- [ ] Verify Open Graph & Twitter preview cards (`dwa-logo-square.png`) and confirm all external links (`Benevity`, `Give.do`, `GuideStar India`, `NGO Darpan`, `Instagram`, `LinkedIn`).

## Step 4: Cloudflare Pages Deployment, Sign-Off & Rollback
- [ ] Connect `github.com/dwaindia/website` (`main` branch) to **Cloudflare Pages** (Framework preset: `None`, Build command: empty, Output directory: `/`).
- [ ] Verify `_headers` (CSP, `X-Frame-Options`, caching) and `_redirects` are active on the Pages deployment.
- [ ] Connect custom production domain, enforce HTTPS / Universal SSL, and verify live mobile rendering (`320px`, `375px`, `768px`, `1280px`) on real iOS/Android browsers.
- [ ] Confirm Governing Body sign-off on **Privacy Policy** and **Refund and Cancellation Policy** modal wording, and update domestic Indian bank transfer details in `donate.html` once ready.
- [ ] Document rollback procedure: in Cloudflare Pages **Deployments**, click **Rollback to this deployment** on any previous production build, or revert the commit on GitHub `main`.
