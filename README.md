# Bilal Estate — dark-luxe property website (Islamabad)

*"Find the space where your life begins." · "جہاں آپ کی نئی زندگی شروع ہوتی ہے"*

Obsidian · Emerald · Champagne Gold. Photoreal, full-bleed imagery with depth
parallax — no modelled toy geometry anywhere.

---

## 0. The WhatsApp bug: root cause and fix

**Reported symptom:** clicking any WhatsApp button showed
`api.whatsapp.com is blocked` / `api.whatsapp.com refused to connect` / `ERR_BLOCKED_BY_RESPONSE`.

**Root cause (verified, not guessed):**

1. `api.whatsapp.com` **was never used by this codebase** — a full audit of every
   source file and of the built `dist/index.html` found zero references. All
   links already resolved to `https://wa.me/923450655699`.
2. `wa.me` is a short link that **302-redirects to `api.whatsapp.com/send/?phone=…`**,
   and that endpoint responds with `X-Frame-Options: DENY` / CSP `frame-ancestors`.
   Chrome reports `ERR_BLOCKED_BY_RESPONSE` **only when the response is being
   loaded inside a frame**. So the navigation was being resolved inside an
   embedded preview shell / iframe, not in a real browser tab.
3. Two code paths made this worse: the booking modal and the contact form used
   `window.open(url, "_blank", "noopener,noreferrer")`. Inside a sandboxed
   preview frame (no `allow-popups-to-escape-sandbox`) that call is refused, and
   some shells then retry the URL in-frame → the exact error above.

**Fix applied:**

- New single helper `src/lib/whatsapp.ts` → `buildWhatsAppLink({ message, phone })`
  producing exactly `https://wa.me/923450655699?text=<encodeURIComponent(msg)>`
  (one encode, one `text` param, digits-only international number).
- `normalizePhone()` accepts `03450655699`, `+92 345 0655699`, `(0345) 065-5699`,
  `0092…` and always yields `923450655699`.
- **Every** WhatsApp control is now a real `<a href target="_blank" rel="noopener noreferrer">`
  — top-level navigation from a genuine user click. `window.open()` was removed
  from both forms; they now save the lead and reveal a **"Continue on WhatsApp"**
  anchor, so no popup blocker can intervene.
- `src/lib/utils.ts` keeps the legacy `waLink()` name but delegates to the new
  helper, so all 18 pre-existing call sites were fixed at once with no drift.
- `isEmbeddedFrame()` detects a preview shell and the floating button explains
  that WhatsApp refuses to be framed, instead of looking broken.
- Click tracking: `trackWhatsAppClick({placement, propertyId, propertyTitle})`
  logs `whatsapp_click` events (page, placement, property, timestamp).

**Test it for real:** open the deployed URL (or `npm run preview`) in a normal
Chrome/Safari tab — *not* inside an editor preview pane — then click any
WhatsApp control. Mobile opens the WhatsApp app; desktop opens WhatsApp Web.

---

## 1. Stack

| Layer | Choice |
| --- | --- |
| Framework | **React 19 + Vite 7 + TypeScript**, built to one static `dist/index.html` |
| Styling | **Tailwind CSS v4** + design tokens in `src/index.css` |
| 3D | **three.js + @react-three/fiber + drei** — used *only* for depth effects over photographs (`HeroDepth` displacement plane, gold-dust particles, the gold emblem) |
| Motion | GSAP + ScrollTrigger, Lenis, Framer Motion |
| State | Zustand |
| Routing | react-router-dom v7 `HashRouter` (`#/properties/:slug`, `#/admin`, …) |
| Data | Typed local catalogue `src/data/properties.ts` (12 unique concepts) |

> **Next.js / Prisma / SQLite / NextAuth / Playwright are not available here.**
> This repository builds to a single static HTML file with no server runtime, so
> App-Router API routes, a database and browser-driven E2E cannot run. The
> backend is implemented as a **documented contract + working local store**
> (see §6) rather than being faked.

---

## 2. Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/index.html  (single self-contained file)
npm run preview    # serve the real build — use THIS to test WhatsApp
node scripts/verify.mjs   # WhatsApp + build audit suite (27 checks)
npx tsc --noEmit   # typecheck (currently 0 errors)
```

---

## 3. Contact configuration (one place)

`src/lib/siteConfig.ts` holds everything:

```
phone.whatsapp  923450655699      → all wa.me links
phone.display   0345 0655699      → UI copy
phone.tel       +923450655699     → tel: links
email           Muhammadbilal42030@gmail.com
social          instagram.com/i.bilalmunir_/ · tiktok.com/@i.bilalmunir_?lang=en-GB
                (exact owner URLs — one definition, read by navbar menu,
                 footer, contact section and team/about section)
owner           Bilal + photo path + languages
todo            officeAddress / openingHours / licenseNumber / yearsInBusiness
endpoints       apiBase (VITE_API_BASE) + /api/leads + /api/events
```

Change the number **once** here and every button, card, sticky bar, footer,
modal, admin reply link and analytics payload updates.

Nothing is invented: unknown facts render as visible dashed `TODO_ADD_*`
placeholders (office address, hours, licence, years in business, deals closed,
client testimonials, travel times) instead of fake claims.

---

## 3b. When a button still shows ERR_BLOCKED_BY_RESPONSE

Open `#/diagnostics` on the running site. It reads the LIVE DOM and prints the
exact `href`, `target` and `rel` of every WhatsApp / Instagram / TikTok / call /
email control, plus whether the page is inside a frame, and the build stamp
(`siteConfig.buildStamp`) so a stale cached artifact is obvious at a glance.
If the stamp is old → hard-refresh or redeploy. If "Running inside a frame" says
YES → the block comes from the preview shell, not the site: WhatsApp, Instagram
and TikTok all send `X-Frame-Options: DENY`. A dismissible helper panel appears
automatically in that case with copyable URLs. Verify in a normal browser tab via
`npm run preview` or the deployed domain.

## 4. Owner photo

Drop the real portrait at:

```
public/images/owner/bilal.jpg      (4:5 crop, face near the top third)
```

`<OwnerPortrait>` renders it arch-masked with a 1px gold border and tuned
`object-position`, and appears in **About**, the **Team** card, the **Contact**
section, the **booking-modal header** and the **property detail** sidebar.
Until the file exists it shows a neutral silhouette with a
`TODO_ADD_OWNER_PHOTO` caption — no generated face is substituted.

---

## 5. Images

`src/lib/images.ts` is the single image map; no component hardcodes a path.

**Generated for this build (in `public/images/`):**
`hero-dusk` `hero-night` `room-lobby` `room-living` `room-kitchen` `room-marble`
`room-bedroom` `room-terrace` `aerial-islamabad` `property-pine-water-villa`

**Still temporary stock photography — replace with your own unique concept renders**
(`placeholderStock` in `src/lib/images.ts`): property covers `p2…p12`,
`office`, `blog1…blog3`. Until then every card carries a "Concept" tag and the
footer states *"Property visuals are architectural concept renderings."* When a
listing is real, set `visualStatus: "verified"` in `src/data/properties.ts` and
it shows the **Verified listing** badge instead.

**Depth technique:** `HeroDepth` displaces a photo plane with a procedural depth
map (sky = far, mass = near, water = nearest) and pushes the camera in on scroll
— real parallax with 100% photoreal quality. To use a true Depth-Anything map,
drop `hero-depth.jpg` in `public/images/` and load it in `makeDepthTexture()`.

---

## 6. Leads, events and the "backend"

`src/lib/leads.ts` saves every lead and analytics event to `localStorage`, and
additionally `POST`s JSON to `${VITE_API_BASE}/api/leads` and `/api/events` when
that env var exists at build time:

```bash
VITE_API_BASE=https://api.yourdomain.com npm run build
```

Payloads are exactly what a Next.js/Express/Supabase handler should accept
(`Lead` and `TrackedEvent` in that file). Client-side protections already in
place: honeypot field, required-field validation, rate limit (5 leads / 10 min),
500-lead / 400-event caps, CSV export.

## 6b. Attaching a real backend (two ready-made paths)

**Path 1 — self-hosted API (already written):** `cd server && cp .env.example .env && npm run setup && npm run dev`, then in the project root `echo "VITE_API_BASE=http://localhost:4000" > .env && npm run build`. Express + Prisma + SQLite (switch one line for PostgreSQL), zod validation, honeypot, rate limits, JWT admin auth in an httpOnly cookie, lead CRUD + CSV, property CRUD, analytics, Resend email and WhatsApp Cloud API notification hooks. Full route table in `server/README.md`.

**Path 2 — Supabase (no server to host):** run `supabase/schema.sql` in the SQL editor. Postgres + auto REST + Row Level Security: the public anon key may read properties/posts and insert leads/events, and can never read leads or write properties. Give me the project URL + anon key and the frontend is wired in one file.

Either way the frontend contract is unchanged: `POST /api/leads`, `POST /api/events`, `GET /api/properties`, `GET /api/properties/:slug`.

`#/admin` is a working local desk: lead table with status changes, one-click
**Reply on WhatsApp** to the lead's own number, CSV export, analytics summary
and the raw event log. It is explicitly labelled as browser-local and
**not** an authenticated admin area — put real auth and a database behind the
same contract before using it commercially.

---

## 7. Localisation & units

- **English / اردو toggle** in the navbar and mobile menu. Switching sets
  `<html lang dir>`, swaps the dictionary (`src/lib/i18n.ts`), loads Noto
  Nastaliq Urdu and flips layout to RTL (marquee direction, rule growth origin,
  letter-spacing). The choice is remembered in `localStorage`.
  Property records are still English-only → `TODO_ADD_URDU_LISTINGS`.
- **PKR formatting**: `PKR 9.2 Crore`, `PKR 85 Lakh`, `PKR 425,000/month`.
- **Area units**: `src/lib/units.ts` converts sq ft ↔ sq yd ↔ marla ↔ kanal
  (1 marla = 272.25 sq ft, 1 kanal = 20 marla). The detail page shows a live
  four-unit breakdown.
- Location filter list for Islamabad/Rawalpindi lives in
  `properties.ts → locationOptions`.

---

## 8. Accessibility, performance, SEO

- Tap targets ≥ 44px (`.pill`, `.field` min-heights), visible `:focus-visible`
  gold rings, `aria-pressed` on every toggle, `aria-label` on icon-only buttons
  and socials, keyboard lightbox (`←/→/Esc`), `Esc` closes modals/drawers,
  scroll locks without breaking Lenis.
- `prefers-reduced-motion`: Lenis off, ScrollTrigger off, canvases switch to
  `frameloop="demand"`, the walkthrough becomes a static gallery, Ken Burns and
  grain disabled.
- No WebGL → poster gradients/images plus an explicit notice.
- Device tier (`low/mid/high`) clamps DPR to 1 / 1.4 / 1.8; `<PerformanceMonitor>`
  degrades further on a frame-rate decline; canvases pause off-screen.
- `touch-action: pan-y` on every canvas and `data-lenis-prevent` on inner
  scrollers → the page never gets scroll-trapped; the map needs a deliberate
  "Tap to explore" on touch devices.
- JSON-LD: `RealEstateAgent`/`Organization`, `WebSite`, per-listing
  `RealEstateListing` + `Residence`, per-article `Article`. OG/Twitter tags,
  theme colour, semantic landmarks, one `h1` per page.
- Bundle: one HTML file ≈ 1.78 MB (514 KB gzip); photography is served from
  `/images/` and lazy-loaded.

---

## 9. Folder structure

```
src/
  App.tsx                  router, boot (Lenis, tier, audio, lang), page_view tracking
  index.css                Obsidian/Emerald/Gold tokens, type, surfaces, motion, RTL
  lib/     siteConfig · whatsapp · leads · images · units · i18n · utils · scroll · ambience
  store/   useStore.ts     filters, saved, drawer, booking, lang, dusk, audio, cursor, tier
  hooks/   useDevice.ts    useMagnetic.ts
  data/    properties.ts (12 concepts) · content.ts (owner, services, stats, posts, nearby)
  components/
    three/ Canvas3D.tsx · HeroDepth.tsx · Emblem.tsx · lib.ts
    layout/ Navbar.tsx · Footer.tsx
    ui/     Reveal · PropertyCard · OwnerPortrait · BookingModal · WhatsAppFab · Cursor · Icons
    sections/ Preloader Hero WalkThroughSection Featured MapSection Services WhyUs(+Team) Journal ContactSection
  pages/   Home Properties PropertyDetail About ContactPage Blog(+BlogPost) Admin NotFound
public/
  images/  10 generated dark-luxe assets (+ owner/ slot)
  models/  drop-in .glb slots
scripts/verify.mjs          WhatsApp + build audit suite
```

---

## 10. Deploy

```bash
npm i -g vercel
VITE_API_BASE=https://api.yourdomain.com vercel --prod
```

Framework preset **Vite**, build `npm run build`, output `dist`. The hash router
needs no rewrites on any host. If you later switch to `BrowserRouter`, add
`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.

Then replace `TODO_ADD_DOMAIN` in `index.html` (canonical + OG image URLs).

---

## 11. Placeholder inventory

| Item | Location | Replace with |
| --- | --- | --- |
| Owner portrait | `public/images/owner/bilal.jpg` | your photo (4:5) |
| Property covers `p2…p12`, office, blog covers | `src/lib/images.ts → placeholderStock` | your unique concept renders |
| Spa image | `images.spa` | `public/images/room-spa.jpg` |
| Office address, hours, licence, years | `src/lib/siteConfig.ts → todo` | real details |
| Deals closed / years stats | `src/data/content.ts → stats` | audited numbers |
| Testimonials | `src/data/content.ts → testimonials` | real, consented quotes |
| Travel times | `src/data/content.ts → nearby` | measured minutes |
| Team slots 2–3 | `src/data/content.ts → agents` | real consultants or delete |
| Urdu listing copy | `src/data/properties.ts` | bilingual fields |
| Newsletter provider | `src/pages/Blog.tsx`, Journal section | Mailchimp/Buttondown endpoint |
| Domain + OG image | `index.html` | production URL |
| Mortgage rate | `PropertyDetail → Calculator` | live bank rates |
| Backend | `VITE_API_BASE` | hosted `/api/leads` + `/api/events` |
