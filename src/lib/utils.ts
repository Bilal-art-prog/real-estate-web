export { cn } from "../utils/cn";

/* Money + land-area units live in ./units (single implementation). */
export {
  formatPKR,
  formatNumber,
  formatArea,
  sqftToMarla,
  convertArea,
  areaBreakdown,
  unitLabels,
  type AreaUnit,
} from "./units";

/* WhatsApp lives in ./whatsapp (single implementation). */
export {
  buildWhatsAppLink,
  normalizePhone,
  decodeWhatsAppLink,
  waMessages,
  trackWhatsAppClick,
  propertyUrl,
  isEmbeddedFrame,
} from "./whatsapp";

import { buildWhatsAppLink } from "./whatsapp";

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent damping. */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + ((clamp(v, inMin, inMax) - inMin) / (inMax - inMin || 1)) * (outMax - outMin);

/**
 * Legacy shorthand kept so existing call sites stay valid.
 * Always resolves to `https://wa.me/923450655699?text=<encoded>` — never to
 * api.whatsapp.com, and never double-encoded.
 */
export const waLink = (message?: string, phone?: string) => buildWhatsAppLink({ message, phone });

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function readTime(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).length / 210));
}
