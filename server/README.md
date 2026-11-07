# Bilal Estate API (self-hosted option)

Express + Prisma + **SQLite by default** (zero setup) → switch one line for PostgreSQL.
Implements exactly the contract the website already calls, so the frontend needs
nothing but `VITE_API_BASE`.

## 1. Run it

```bash
cd server
cp .env.example .env          # set ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET
npm run setup                 # install + prisma migrate + seed (admin, 12 properties, 3 posts)
npm run dev                   # http://localhost:4000
```

## 2. Point the website at it

```bash
# in the project root
echo "VITE_API_BASE=http://localhost:4000" > .env
npm run build                 # leads + events now persist in the database
npm run preview
```

Open `#/diagnostics` → submit the contact form → `GET /api/admin/leads` (or
`npx prisma studio`) shows the row.

## 3. Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | liveness |
| GET | `/api/properties?purpose&type&city&sector&minPrice&maxPrice&beds&baths&search&sort&page` | – | filtered, paginated register |
| GET | `/api/properties/:slug` | – | single listing |
| GET | `/api/posts` · `/api/testimonials` · `/api/agents` | – | content |
| **POST** | **`/api/leads`** | – | contact form / booking modal / quick enquiry (zod-validated, honeypot, 5 per 10 min per IP) |
| **POST** | **`/api/events`** | – | `whatsapp_click`, `call_click`, `page_view`, `social_click` (batch accepted, 120/min) |
| POST | `/api/auth/login` · `/api/auth/logout` · GET `/api/auth/me` | – | admin session (bcrypt + httpOnly cookie, 12 h) |
| GET/PATCH/DELETE | `/api/admin/leads[/:id]` | admin | lead pipeline |
| GET | `/api/admin/leads.csv` | admin | CSV export |
| GET/POST/PATCH/DELETE | `/api/admin/properties[/:id]` | admin | listing CRUD |
| GET | `/api/admin/analytics` | admin | leads, clicks, page views, top properties |

## 4. Notifications

Set `RESEND_API_KEY` + `NOTIFY_EMAIL` to email yourself on every lead, and/or
`WA_CLOUD_TOKEN` + `WA_CLOUD_PHONE_ID` (WhatsApp Cloud API) to get a WhatsApp
message on your own number. Both are fire-and-forget: if they fail, the lead is
still saved.

## 5. Production

- **Host:** Render / Railway / Fly.io / a VPS (`npm start` behind nginx + TLS),
  or Vercel Serverless (wrap the Express app with `@vercel/node`).
- **Database:** change `provider = "sqlite"` → `"postgresql"` in
  `prisma/schema.prisma`, set `DATABASE_URL` to Neon/Supabase/Railway Postgres,
  then `npm run prisma:deploy && npm run seed`.
- **Env:** `CORS_ORIGIN` must list the site's real domain(s); set a 64-char
  `JWT_SECRET`; change `ADMIN_PASSWORD` before the first deploy.
- **Uploads:** add `multer` + S3/Cloudinary/Supabase Storage and a
  `POST /api/admin/media` route; the site reads image URLs from the property
  record, so no component changes are needed.

## 6. Alternative: no server at all

Use `supabase/schema.sql` instead — Postgres + auto REST + Row Level Security.
The public anon key can read properties and insert leads/events, but can never
read leads or write properties. Then the frontend talks to Supabase directly
(`@supabase/supabase-js`) and you skip hosting entirely.
