import { siteConfig } from "./siteConfig";
import { logEvent } from "./leads";

/**
 * Official WhatsApp click-to-chat.
 *
 * IMPORTANT — why `wa.me` and not `api.whatsapp.com`:
 * `https://wa.me/<number>` is the official short link. It 302-redirects to
 * `https://api.whatsapp.com/send/?phone=…`, and that endpoint answers with
 * `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'`. If anything tries to
 * load it inside a frame (a website-builder preview, an embedded browser, an
 * iframe modal), Chrome reports exactly:
 *     "api.whatsapp.com refused to connect" / ERR_BLOCKED_BY_RESPONSE
 * The fix is therefore two-fold:
 *   1. always build `https://wa.me/<digits>?text=<encodeURIComponent(msg)>`
 *   2. always navigate from a REAL anchor with target="_blank" (top-level), and
 *      never from `window.open()` inside a sandboxed frame.
 */

/** Strips +, spaces, dashes, brackets; converts a local 03xx number to 923xx. */
export function normalizePhone(input: string, defaultCountryCode = "92"): string {
  let digits = String(input ?? "").replace(/[^\d]/g, "");
  if (!digits) return siteConfig.phone.whatsapp;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = defaultCountryCode + digits.slice(1);
  else if (digits.length === 10 && !digits.startsWith(defaultCountryCode)) {
    digits = defaultCountryCode + digits;
  }
  return digits;
}

export interface WhatsAppLinkOptions {
  message?: string;
  phone?: string;
}

/** `buildWhatsAppLink({ message })` → https://wa.me/923450655699?text=… */
export function buildWhatsAppLink({ message, phone }: WhatsAppLinkOptions = {}): string {
  const number = normalizePhone(phone ?? siteConfig.phone.whatsapp);
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  // single, correct encode — never pre-encoded input (that would double-encode)
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Decode check used by the test suite / QA report. */
export function decodeWhatsAppLink(href: string) {
  const url = new URL(href);
  return {
    host: url.host,
    path: url.pathname,
    phone: url.pathname.replace("/", ""),
    text: url.searchParams.get("text") ?? "",
    paramCount: Array.from(url.searchParams.keys()).length,
  };
}

/** Absolute URL of a property page (used inside WhatsApp messages). */
export function propertyUrl(slug: string): string {
  if (typeof window === "undefined") return `https://bilalestate.pk/#/properties/${slug}`;
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/properties/${slug}`;
}

export const waMessages = {
  general: () =>
    `Assalam o Alaikum ${siteConfig.brand.name}, I found you on your website and would like to discuss a property in ${siteConfig.brand.city}.`,

  viewing: () =>
    `Assalam o Alaikum ${siteConfig.brand.name}, I would like to book a private viewing.`,

  property: (p: { title: string; location?: string; priceLabel?: string; slug?: string }) => {
    const parts = [
      "Assalam o Alaikum,",
      `I am interested in ${p.title}${p.location ? `, ${p.location}` : ""}${p.priceLabel ? ` priced at ${p.priceLabel}` : ""}.`,
    ];
    if (p.slug) parts.push(`Link: ${propertyUrl(p.slug)}`);
    parts.push("Please share more details.");
    return parts.join(" ");
  },

  lead: (lead: {
    name?: string;
    phone?: string;
    budget?: string;
    interest?: string;
    message?: string;
    propertyTitle?: string;
  }) =>
    [
      `Assalam o Alaikum ${siteConfig.brand.name},`,
      "",
      "I just submitted the enquiry form on your website:",
      lead.name ? `• Name: ${lead.name}` : "",
      lead.phone ? `• Phone: ${lead.phone}` : "",
      lead.interest ? `• Interested in: ${lead.interest}` : "",
      lead.budget ? `• Budget: ${lead.budget}` : "",
      lead.propertyTitle ? `• Property: ${lead.propertyTitle}` : "",
      lead.message ? `• Message: ${lead.message}` : "",
    ]
      .filter(Boolean)
      .join("\n"),

  booking: (d: {
    name?: string;
    phone?: string;
    date?: string;
    time?: string;
    mode?: string;
    budget?: string;
    message?: string;
    propertyTitle?: string;
    agentName?: string;
  }) =>
    [
      `Assalam o Alaikum ${siteConfig.brand.name},`,
      "",
      "I would like to book a private viewing.",
      d.propertyTitle ? `Property: ${d.propertyTitle}` : "Interest: general consultation",
      d.agentName ? `Requested consultant: ${d.agentName}` : "",
      "",
      d.name ? `Name: ${d.name}` : "",
      d.phone ? `Phone: ${d.phone}` : "",
      `Preferred: ${d.date || "flexible"}${d.time ? ` at ${d.time}` : ""}`,
      d.mode ? `Mode: ${d.mode}` : "",
      d.budget ? `Budget: ${d.budget}` : "",
      d.message || "",
    ]
      .filter(Boolean)
      .join("\n"),

  post: (title: string) =>
    `Assalam o Alaikum, I read "${title}" on the ${siteConfig.brand.name} website and have a question.`,
};

/** Analytics: every WhatsApp tap is recorded (page, property, timestamp). */
export function trackWhatsAppClick(payload: {
  propertyId?: string;
  propertyTitle?: string;
  placement: string;
  message?: string;
}) {
  logEvent({
    type: "whatsapp_click",
    page: typeof window === "undefined" ? "/" : window.location.hash || "/",
    placement: payload.placement,
    propertyId: payload.propertyId,
    propertyTitle: payload.propertyTitle,
    at: new Date().toISOString(),
  });
}

/**
 * True when the site is running inside somebody else's frame (website-builder
 * preview, embedded browser). In that case a plain anchor with target="_blank"
 * is still the correct answer — but we surface a hint so the user knows the
 * block came from the preview shell, not from the site.
 */
export function isEmbeddedFrame(): boolean {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * DELIBERATELY ABSENT: a programmatic-open helper (window.open / a synthetic
 * a.click()). Both are refused inside sandboxed preview shells and are the
 * classic source of "blocked" behaviour. Every social control on this site is a
 * plain anchor with target="_blank" rel="noopener noreferrer" so the browser
 * performs a genuine top-level navigation from a real user click.
 */

/** Back-compat shim used by older call sites. Prefer buildWhatsAppLink. */
export const waLink = (message?: string, phone?: string) =>
  buildWhatsAppLink({ message, phone: phone ?? siteConfig.phone.local });
