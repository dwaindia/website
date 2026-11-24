# Dalit Welfare Association (DWA) — Launch & Handover Checklist (Phases 4–6)

## Phase 4: Approved Field Photography & Public Documents
- [ ] **Select & approve photos** for all 15 placeholder slots (`Plate 01–05`, `Plate A1–A2`, `Plate P1–P4`, `Plate G1–G3`, `Plate D1`).
- [ ] **Verify informed consent & child protection clearance** before publishing any identifiable beneficiary or school photograph.
- [ ] **Optimize images** into WebP + JPEG/PNG fallbacks matching each plate's target aspect ratio (`4:5`, `4:3`, `16:9`), preserving originals separately outside the public site root.
- [ ] **Upload signed public PDFs** (Society Bylaws, MHA FCRA Renewal `010270166`, Audited Statements `FY 2020–21` to `FY 2024–25`) into `assets/documents/` or Cloudflare R2 and link them in `accountability.html#downloads`.

## Phase 3 Connection: Live Worker Form & Newsletter API
- [ ] Authenticate Wrangler (`npx wrangler login`) inside `workers/form-api/`.
- [ ] Configure Wrangler secrets (`CRM_WEBHOOK_URL`, `CRM_AUTH_TOKEN`, optional `TURNSTILE_SECRET_KEY`).
- [ ] Deploy the Worker (`npx wrangler deploy`) and verify `GET /api/health` returns `{"ok":true,"configured":true}`.
- [ ] Set `<meta name="dwa-api-base" content="https://...">` in `index.html` and `donate.html` (or configure Cloudflare Pages route `/api/*`).
- [ ] Test `#dwa-newsletter-form` and `#dwa-contact-form` end-to-end and verify records arrive in Salesforce / CRM.

## Phase 5: Privacy-Safe Analytics & Outreach
- [ ] Enable **Cloudflare Web Analytics** (cookie-free) or consent-gated GA4 without passing email, phone, or personal names in URLs or events.
- [ ] Verify Open Graph social cards (`dwa-logo-square.png`) and canonical URL (`https://dalitwelfareassociation.org/`) match your final custom domain.
- [ ] Confirm all external links (`Benevity`, `Give.do`, `GuideStar India`, `NGO Darpan`, `Instagram`, `LinkedIn`).

## Phase 6: Cloudflare Pages Deployment, DNS & Rollback
- [ ] Connect `github.com/dwaindia/website` (`main` branch) to **Cloudflare Pages** (Framework preset: `None`, Build command: empty, Output directory: `/`).
- [ ] Verify `_headers` (CSP, `X-Frame-Options`, caching) and `_redirects` are active on the Pages deployment.
- [ ] Connect your production custom domain, enable HTTPS / Universal SSL, and verify `robots.txt` + `sitemap.xml`.
- [ ] Confirm Governing Body sign-off on **Privacy Policy** and **Refund and Cancellation Policy** modal wording, domestic bank details (when ready), and reconciled `FY 2024–25` audit totals.
- [ ] Document rollback procedure: in Cloudflare Pages **Deployments**, click **Rollback to this deployment** on any previous production build, or revert the commit on GitHub `main`.
