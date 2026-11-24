# Dalit Welfare Association (DWA) — Official Website (Version 2)

Official institutional website for **Dalit Welfare Association (DWA)**, Andhra Pradesh, India.

> **Design Direction (Version 2):** Minimalist, monochrome editorial design inspired by leading international foundations, research institutions, and established human rights organizations.  
> **Visual Identity:** 90% monochrome with rare, restrained red accents (`#B5121B` / `#8F0E16`). Strictly square corners (`border-radius: 0`) throughout. Generous whitespace, large editorial serif headlines, and authentic documentary photography placeholders.  
> **Technology Stack:** Pure Semantic HTML5, locally compiled production CSS (`assets/css/styles.css`), and lightweight Vanilla JavaScript. Zero external CDN dependencies. Directly viewable in any modern desktop or mobile browser.  
> **Implementation Model:** Phased rollout with mandatory approval gates.

---

## 1. Project Directory Structure

```text
WEBSITE/
├── index.html                # Editorial Homepage with Hero, Meter, Featured Programs, Credentials & Benevity
├── about.html                # About Page: Context, 1993–2026 History, Bylaws, Honorary Board & Credentials
├── programs.html             # Core Programs Page: 4 Priority Focus Sectors, 6-Stage Delivery & Archives
├── accountability.html       # Public Accountability: Statutory IDs, 5-Year Financials, Governance & Projects
├── donate.html               # Donate & Support Page: Amount Selector, Domestic/FCRA Giving, Grants & Contact
├── assets/
│   ├── css/
│   │   └── styles.css        # Monochrome design tokens, fluid typography, inner-page & form utilities (zero CDN)
│   ├── js/
│   │   └── main.js           # Menu overlay, focus traps, scroll-spy tabs, donation selector, Worker form client
│   ├── documents/            # Public approved statutory certificates & audited PDF library (pending upload)
│   └── images/               # Square DWA logo variants (WebP/PNG) exported from logo.jpg
├── workers/
│   ├── form-api/             # Phase 3 Cloudflare Worker (POST /api/newsletter, POST /api/contact) & wrangler.jsonc
│   └── README.md             # Worker secrets, D1 schema & deployment guide
├── _headers                  # Cloudflare Pages security headers (CSP, X-Frame-Options, cache policies)
├── _redirects                # Clean canonical extensionless route redirects
├── LAUNCH_CHECKLIST.md       # Phases 4–6 media, analytics, DNS & production launch checklist
├── robots.txt                # Search engine crawler directives
├── sitemap.xml               # Approved 5-page canonical sitemap
└── README.md                 # Project architecture, design decisions & preview guide
```

---

## 2. Monochrome Editorial Design Tokens (Version 2)

| Element | Hex Value | Purpose |
| :--- | :--- | :--- |
| **Primary Background** | `#FFFFFF` | Core reading surfaces |
| **Secondary Background** | `#F5F5F3` | Subtle contrast sections (Vision & Mission, Credentials, Footer) |
| **Primary Text** | `#171717` | High-contrast editorial titles, headings, and primary body copy |
| **Secondary Text** | `#626262` | Subtitles, supporting copy, metadata, and captions |
| **Borders & Dividers** | `#E5E5E5` | Hairline dividers and structured grids |
| **Primary Accent Red** | `#B5121B` | Highly restrained: Main Donate button, primary hero CTA, small markers |
| **Dark Red Hover** | `#8F0E16` | Interactive hover states for primary buttons |

*Strict Corner Rule:* All corners across all buttons, cards, images, modals, inputs, and containers are strictly square (`border-radius: 0`).

---

## 3. Approved Homepage Content Structure (Section Flow)

The homepage consists of exactly eight focused sections in the following order:

1. **Full-Screen Editorial Hero (90–100vh):**
   - Left Column: Eyebrow ("Working in Andhra Pradesh Since 1993"), grand headline ("Building Dignity. Creating Opportunity. Strengthening Communities."), introductory narrative, and dual CTA buttons ("Explore Our Work" in accent red, "Support Our Mission" in monochrome).
   - Right Column: Large rectangular authentic documentary photograph placeholder with square corners.
2. **Impact Number Meter:**
   - Clean horizontal layout with thin dividers displaying verified institutional milestones:
     - `30+` Years of Community Service
     - `10` Government Primary Schools
     - `50` Women per Programme Cycle
     - `2028` FCRA Active Through Sept.
3. **Vision and Mission:**
   - Minimal two-column editorial layout on `#F5F5F3` with generous whitespace, large serif typography, and zero decorative cards or icons.
4. **Featured Programmes:**
   - Refined editorial grid displaying the four priority areas:
     1. Women's Empowerment and Livelihoods (`programs.html#womens-empowerment`)
     2. Child Education and Advancement (`programs.html#child-education`)
     3. Water Conservation and Climate Adaptation (`programs.html#water-conservation`)
     4. Community Development and Welfare (`programs.html#community-development`)
5. **Institutional Credentials:**
   - Compact credibility section presenting verified statutory numbers: Society Reg. 384/1993, FCRA Reg. 010270166, NGO Darpan AP/2021/0276162, PAN AAKFD2353B.
6. **International Visitors – Benevity:**
   - Visually distinctive block for international corporate workplace giving via Benevity with FCRA compliance disclosures and configuration placeholders.
7. **Newsletter Subscription:**
   - Minimalist form with honeypot spam protection, email validation, Privacy Policy modal trigger, and honest staging notification.
8. **Institutional Footer & Policy Modals:**
   - Square emblem, 4 primary destinations (About, Programs, Accountability, Donate), registered office address, official email (`dalitwelfareassociation1@gmail.com`), monochrome social media icons with subtle red hover, and accessible pop-up modals for Privacy Policy and Refund & Cancellation Policy.

---

## 4. Navigation Architecture

- **Desktop Header:**
  - Full square DWA logo (linking to `index.html`).
  - Standalone "Home" link removed from visible navigation.
  - Visible primary items: **About**, **Programs**, **Accountability**, and **Donate** (accent red button).
  - Dedicated **Menu** button.
- **Full-Screen Menu Overlay:**
  - Opens a full-viewport structured directory.
  - Column 1: Main navigation (Home, About, Programs, Accountability, Donate).
  - Columns 2–5: Multi-column breakdown of subsections for About, Programs, Accountability, and Donate.
  - Complete keyboard navigation, Escape key handler, focus trap, and background scroll lock.

---

## 5. Local Preview Instructions

The website requires zero build steps or Node.js runtime:

### Option A: Direct Browser File
Double-click `index.html` or open it directly in any desktop or mobile browser.

### Option B: Local HTTP Server
Run the built-in HTTP server:
```bash
python3 -m http.server 8080
```
Then visit: [http://localhost:8080](http://localhost:8080)

---

## 6. Cloudflare Pages Deployment & Custom Domain Setup

This website is built with 100% static standard HTML5, CSS3, and modern Vanilla JS. It requires zero server runtimes, zero package installations, and zero build commands, making it ideal for lightning-fast deployment on **Cloudflare Pages**.

### Step 1: Connect Repository to Cloudflare Pages
1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, navigate to **Compute (Workers & Pages)** > **Create application** > **Pages** tab.
3. Select **Connect to Git** and choose GitHub.
4. Authorize Cloudflare to access the `dwaindia/website` repository and select branch `main`.

### Step 2: Configure Build Settings
- **Project Name:** `dwa-website` (or your preferred name)
- **Production Branch:** `main`
- **Framework Preset:** `None`
- **Build Command:** *(leave empty)*
- **Build Output Directory:** `/` (root directory)
- Click **Save and Deploy**. Cloudflare Pages will build and deploy the entire site globally within seconds.

### Step 3: Connect Custom Domain
1. In the Cloudflare Pages project dashboard, click on the **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Enter your domain name (e.g., `dalitwelfareassociation.org` or your registered apex/subdomain).
4. If your domain's DNS is managed on Cloudflare, Cloudflare will automatically configure the CNAME records. If managed elsewhere, add the CNAME record pointing to `<project-name>.pages.dev` as instructed.
5. Cloudflare will automatically provision a free universal SSL/TLS certificate and enable global edge caching.
