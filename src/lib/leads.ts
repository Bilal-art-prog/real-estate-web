import { siteConfig } from "./siteConfig";

/**
 * Lead + event capture.
 *
 * This build is a static single-file SPA (Vite), so there is no server runtime
 * available to host Prisma/SQLite API routes. Storage is therefore:
 *   • localStorage (always) — so /#/admin, CSV export and "reply on WhatsApp"
 *     work end-to-end in the browser you tested with; and
 *   • an optional POST to `${VITE_API_BASE}/api/leads|events` when that env var
 *     is set at build time — the exact contract a Next.js/Express/Supabase
 *     backend can implement later without touching any component.
 * Nothing is mocked inside the UI: what you see in /#/admin is what was saved.
 */

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  budget?: string;
  message?: string;
  propertyId?: string;
  propertyTitle?: string;
  source: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

export interface TrackedEvent {
  id?: string;
  type: "whatsapp_click" | "call_click" | "page_view" | "lead_created" | "social_click";
  page?: string;
  placement?: string;
  propertyId?: string;
  propertyTitle?: string;
  at: string;
}

const LEAD_KEY = "be.leads.v1";
const EVENT_KEY = "be.events.v1";
const MAX_EVENTS = 400;

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — non-fatal */
  }
};

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

async function post(path: string, body: unknown) {
  const base = siteConfig.endpoints.apiBase;
  if (!base || typeof fetch === "undefined") return;
  try {
    await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    /* offline / CORS — local copy is already saved */
  }
}

/** Naive client-side rate limit: max 5 leads per 10 minutes per browser. */
function rateLimited(): boolean {
  const leads = read<Lead[]>(LEAD_KEY, []);
  const cutoff = Date.now() - 10 * 60 * 1000;
  return leads.filter((l) => new Date(l.createdAt).getTime() > cutoff).length >= 5;
}

export interface SaveLeadInput extends Omit<Lead, "id" | "status" | "createdAt"> {
  /** honeypot — must stay empty; bots fill it */
  website?: string;
}

export function saveLead(input: SaveLeadInput): { ok: boolean; lead?: Lead; error?: string } {
  if (input.website) return { ok: false, error: "spam" };
  if (!input.name?.trim() || !input.phone?.trim()) return { ok: false, error: "Name and phone are required." };
  if (rateLimited()) return { ok: false, error: "Too many requests from this browser. Please try again later." };

  const lead: Lead = {
    ...input,
    id: uid(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const leads = read<Lead[]>(LEAD_KEY, []);
  write(LEAD_KEY, [lead, ...leads].slice(0, 500));
  void post(siteConfig.endpoints.leadsPath, lead);
  logEvent({ type: "lead_created", propertyId: lead.propertyId, at: lead.createdAt });
  return { ok: true, lead };
}

export const listLeads = () => read<Lead[]>(LEAD_KEY, []);

export function setLeadStatus(id: string, status: Lead["status"]) {
  write(
    LEAD_KEY,
    listLeads().map((l) => (l.id === id ? { ...l, status } : l)),
  );
}

export function deleteLead(id: string) {
  write(
    LEAD_KEY,
    listLeads().filter((l) => l.id !== id),
  );
}

export function clearLeads() {
  write(LEAD_KEY, []);
}

export function logEvent(e: Omit<TrackedEvent, "at"> & { at?: string }) {
  const event: TrackedEvent = { ...e, id: uid(), at: e.at ?? new Date().toISOString() };
  const events = read<TrackedEvent[]>(EVENT_KEY, []);
  write(EVENT_KEY, [event, ...events].slice(0, MAX_EVENTS));
  void post(siteConfig.endpoints.eventsPath, event);
}

export const listEvents = () => read<TrackedEvent[]>(EVENT_KEY, []);
export const clearEvents = () => write(EVENT_KEY, []);

export function leadsToCsv(leads: Lead[] = listLeads()) {
  const head = ["id", "createdAt", "name", "phone", "email", "interest", "budget", "propertyTitle", "source", "status", "message"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [head.join(","), ...leads.map((l) => head.map((k) => esc((l as any)[k])).join(","))].join("\n");
}

export function downloadCsv(filename = "bilal-estate-leads.csv") {
  const blob = new Blob([leadsToCsv()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function analyticsSummary() {
  const events = listEvents();
  const leads = listLeads();
  const byProperty = new Map<string, number>();
  events
    .filter((e) => e.type === "whatsapp_click" && e.propertyTitle)
    .forEach((e) => byProperty.set(e.propertyTitle!, (byProperty.get(e.propertyTitle!) ?? 0) + 1));
  return {
    leads: leads.length,
    newLeads: leads.filter((l) => l.status === "new").length,
    whatsappClicks: events.filter((e) => e.type === "whatsapp_click").length,
    callClicks: events.filter((e) => e.type === "call_click").length,
    pageViews: events.filter((e) => e.type === "page_view").length,
    topProperties: [...byProperty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}
