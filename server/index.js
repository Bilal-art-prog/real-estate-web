/**
 * Bilal Estate API — Express + Prisma.
 * Matches the contract the website already calls: POST /api/leads, POST /api/events.
 * SQLite by default (zero setup); switch provider in prisma/schema.prisma for Postgres.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret";
const ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim());

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());

/* ── tiny in-memory rate limiter (swap for Redis/upstash when scaling) ── */
const buckets = new Map();
const limit = (key, max, windowMs) => (req, res, next) => {
  const id = `${key}:${req.ip}`;
  const now = Date.now();
  const hit = buckets.get(id) || { n: 0, t: now };
  if (now - hit.t > windowMs) buckets.set(id, { n: 1, t: now });
  else if (++hit.n > max) return res.status(429).json({ error: "Too many requests. Please try again later." });
  else buckets.set(id, hit);
  next();
};

/* ── validation ─────────────────────────────────────────────────────────── */
const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(24),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  interest: z.string().max(120).optional(),
  budget: z.string().max(120).optional(),
  message: z.string().max(4000).optional(),
  propertyId: z.string().max(64).optional(),
  propertyTitle: z.string().max(180).optional(),
  source: z.string().max(40).optional(),
  website: z.string().max(0).optional(), // honeypot — must stay empty
});

const eventSchema = z.object({
  type: z.enum(["whatsapp_click", "call_click", "page_view", "lead_created", "social_click"]),
  page: z.string().max(200).optional(),
  placement: z.string().max(60).optional(),
  propertyId: z.string().max(64).optional(),
  propertyTitle: z.string().max(180).optional(),
});

const propertySchema = z.object({
  slug: z.string().min(3).max(120),
  title: z.string().min(2).max(160),
  purpose: z.enum(["buy", "rent", "commercial", "plot"]),
  type: z.string().min(2).max(60),
  price: z.number().int().nonnegative(),
  area: z.number().int().positive(),
  city: z.string().min(2).max(60),
  society: z.string().min(1).max(80),
}).passthrough();

/* ── auth ───────────────────────────────────────────────────────────────── */
const sign = (user) => jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "12h" });

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.be_admin || (req.headers.authorization || "").replace(/^Bearer /, "");
    if (!token) return res.status(401).json({ error: "Sign in required." });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "Session expired." });
    req.admin = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid session." });
  }
};

const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 12 * 3600 * 1000 };

/* ── public API ─────────────────────────────────────────────────────────── */
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.get("/api/properties", async (req, res) => {
  const { purpose, type, city, sector, minPrice, maxPrice, beds, baths, search, sort = "featured", page = 1, perPage = 24 } = req.query;
  const where = {};
  if (purpose && purpose !== "all") where.purpose = purpose;
  if (type && type !== "all") where.type = type;
  if (city && city !== "all") where.city = city;
  if (sector) where.sector = { contains: sector };
  if (minPrice || maxPrice) where.price = {};
  if (minPrice) where.price.gte = Number(minPrice);
  if (maxPrice) where.price.lte = Number(maxPrice);
  if (beds && Number(beds) > 0) where.beds = { gte: Number(beds) };
  if (baths && Number(baths) > 0) where.baths = { gte: Number(baths) };
  if (search) where.OR = [{ title: { contains: search } }, { society: { contains: search } }, { sector: { contains: search } }, { amenities: { contains: search } }];

  const orderBy = { "price-desc": { price: "desc" }, "price-asc": { price: "asc" }, "area-desc": { area: "desc" }, newest: { year: "desc" }, featured: [{ featured: "desc" }, { premium: "desc" }] }[sort] || { createdAt: "desc" };
  const take = Math.min(60, Number(perPage) || 24);
  const skip = (Math.max(1, Number(page)) - 1) * take;

  const [items, total] = await Promise.all([prisma.property.findMany({ where, orderBy, take, skip }), prisma.property.count({ where })]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / take) });
});

app.get("/api/properties/:slug", async (req, res) => {
  const p = await prisma.property.findUnique({ where: { slug: req.params.slug } });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
});

app.get("/api/posts", async (_req, res) => res.json(await prisma.post.findMany({ where: { published: true }, orderBy: { postedAt: "desc" } })));
app.get("/api/testimonials", async (_req, res) => res.json(await prisma.testimonial.findMany({ where: { approved: true }, orderBy: { sort: "asc" } })));
app.get("/api/agents", async (_req, res) => res.json(await prisma.agent.findMany({ orderBy: { sort: "asc" } })));

app.post("/api/leads", limit("lead", 5, 10 * 60 * 1000), async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input." });
  if (parsed.data.website) return res.status(200).json({ ok: true }); // bot — accept silently

  const lead = await prisma.lead.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      ip: req.ip,
      userAgent: (req.headers["user-agent"] || "").slice(0, 240),
    },
  });
  await prisma.event.create({ data: { type: "lead_created", propertyId: lead.propertyId, propertyTitle: lead.propertyTitle } });
  notifyLead(lead).catch(() => {});
  res.status(201).json({ ok: true, id: lead.id });
});

app.post("/api/events", limit("event", 120, 60 * 1000), async (req, res) => {
  const batch = Array.isArray(req.body) ? req.body : [req.body];
  const rows = batch.map((b) => eventSchema.safeParse(b)).filter((r) => r.success).map((r) => r.data);
  if (rows.length) await prisma.event.createMany({ data: rows });
  res.status(202).json({ ok: true, accepted: rows.length });
});

/* ── admin ──────────────────────────────────────────────────────────────── */
app.post("/api/auth/login", limit("login", 8, 15 * 60 * 1000), async (req, res) => {
  const { email, password } = req.body || {};
  const user = await prisma.adminUser.findUnique({ where: { email: String(email || "").toLowerCase() } });
  if (!user || !(await bcrypt.compare(String(password || ""), user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  res.cookie("be_admin", sign(user), cookieOpts).json({ ok: true, name: user.name || user.email });
});

app.post("/api/auth/logout", (_req, res) => res.clearCookie("be_admin").json({ ok: true }));
app.get("/api/auth/me", requireAdmin, (req, res) => res.json({ id: req.admin.id, email: req.admin.email, name: req.admin.name }));

app.get("/api/admin/leads", requireAdmin, async (req, res) => {
  const where = req.query.status && req.query.status !== "all" ? { status: req.query.status } : {};
  res.json(await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 }));
});

app.patch("/api/admin/leads/:id", requireAdmin, async (req, res) => {
  const status = z.enum(["new", "contacted", "closed"]).parse(req.body.status);
  res.json(await prisma.lead.update({ where: { id: req.params.id }, data: { status } }));
});

app.delete("/api/admin/leads/:id", requireAdmin, async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.get("/api/admin/leads.csv", requireAdmin, async (_req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const head = ["id", "createdAt", "name", "phone", "email", "interest", "budget", "propertyTitle", "source", "status", "message"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [head.join(","), ...leads.map((l) => head.map((k) => esc(l[k])).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="bilal-estate-leads.csv"');
  res.send(csv);
});

app.get("/api/admin/properties", requireAdmin, async (_req, res) => res.json(await prisma.property.findMany({ orderBy: { createdAt: "desc" } })));
app.post("/api/admin/properties", requireAdmin, async (req, res) => {
  const p = propertySchema.parse(req.body);
  res.status(201).json(await prisma.property.create({ data: { ...p, materials: JSON.stringify(p.materials || []), images: JSON.stringify(p.images || []), highlights: JSON.stringify(p.highlights || []), amenities: JSON.stringify(p.amenities || []), floorplan: JSON.stringify(p.floorplan || []) } }));
});
app.patch("/api/admin/properties/:id", requireAdmin, async (req, res) => {
  const { id, ...data } = req.body;
  for (const k of ["materials", "images", "highlights", "amenities", "floorplan"]) if (data[k] && typeof data[k] !== "string") data[k] = JSON.stringify(data[k]);
  res.json(await prisma.property.update({ where: { id: req.params.id }, data }));
});
app.delete("/api/admin/properties/:id", requireAdmin, async (req, res) => {
  await prisma.property.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.get("/api/admin/analytics", requireAdmin, async (_req, res) => {
  const [leads, events, properties] = await Promise.all([
    prisma.lead.findMany({ take: 1000, orderBy: { createdAt: "desc" } }),
    prisma.event.findMany({ take: 5000, orderBy: { at: "desc" } }),
    prisma.property.count(),
  ]);
  const count = (t) => events.filter((e) => e.type === t).length;
  const byProperty = {};
  events.filter((e) => e.type === "whatsapp_click" && e.propertyTitle).forEach((e) => { byProperty[e.propertyTitle] = (byProperty[e.propertyTitle] || 0) + 1; });
  res.json({
    properties,
    leads: leads.length,
    newLeads: leads.filter((l) => l.status === "new").length,
    whatsappClicks: count("whatsapp_click"),
    callClicks: count("call_click"),
    pageViews: count("page_view"),
    topProperties: Object.entries(byProperty).sort((a, b) => b[1] - a[1]).slice(0, 8),
    recentLeads: leads.slice(0, 10),
  });
});

/* ── lead notification hook (email + WhatsApp Cloud API) ────────────────── */
async function notifyLead(lead) {
  const to = process.env.NOTIFY_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (to && key) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Bilal Estate <leads@bilalestate.pk>",
        to: [to],
        subject: `New lead — ${lead.name} (${lead.source})`,
        text: `Name: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email || "-"}\nInterest: ${lead.interest || "-"}\nBudget: ${lead.budget || "-"}\nProperty: ${lead.propertyTitle || "-"}\n\n${lead.message || ""}`,
      }),
    });
  }
  const waToken = process.env.WA_CLOUD_TOKEN;
  const waPhone = process.env.WA_CLOUD_PHONE_ID;
  if (waToken && waPhone) {
    await fetch(`https://graph.facebook.com/v20.0/${waPhone}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${waToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: "923450655699",
        type: "text",
        text: { body: `New lead: ${lead.name} · ${lead.phone}${lead.propertyTitle ? ` · ${lead.propertyTitle}` : ""}` },
      }),
    });
  }
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => console.log(`Bilal Estate API on http://localhost:${PORT} → allowed origins: ${ORIGINS.join(", ")}`));
