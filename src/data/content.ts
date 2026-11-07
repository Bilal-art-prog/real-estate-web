import { images, placeholderStock } from "../lib/images";
import { siteConfig } from "../lib/siteConfig";
import { properties } from "./properties";

/**
 * All agency copy. Derived from `siteConfig` where a fact is known, and marked
 * `TODO_ADD_*` where it is not — nothing here is invented.
 */

export const site = {
  name: siteConfig.brand.name,
  tagline: siteConfig.brand.tagline,
  taglineUr: siteConfig.brand.taglineUr,
  founder: siteConfig.owner.name,
  city: siteConfig.brand.city,
  alsoServes: siteConfig.brand.alsoServes,
  country: siteConfig.brand.country,
  currency: siteConfig.brand.currency,
  phoneDisplay: siteConfig.phone.display,
  phoneIntl: siteConfig.phone.intlDisplay,
  phoneTel: siteConfig.phone.tel,
  whatsapp: siteConfig.phone.whatsapp,
  email: siteConfig.email,
  instagram: siteConfig.social.instagram.handle,
  instagramUrl: siteConfig.social.instagram.url,
  tiktok: siteConfig.social.tiktok.handle,
  tiktokUrl: siteConfig.social.tiktok.url,
  address: {
    line1: siteConfig.todo.officeAddress,
    line2: `${siteConfig.brand.city}, ${siteConfig.brand.country}`,
    city: siteConfig.brand.city,
    country: siteConfig.brand.country,
  },
  hours: [{ day: siteConfig.todo.openingHours, time: siteConfig.todo.openingHours }],
  license: siteConfig.todo.licenseNumber,
  years: siteConfig.todo.yearsInBusiness,
  visualsNote: siteConfig.legal.visualsNote,
  socials: [
    { label: "WhatsApp", handle: siteConfig.phone.display, href: `https://wa.me/${siteConfig.phone.whatsapp}`, icon: "whatsapp" as const },
    { label: "Instagram", handle: siteConfig.social.instagram.handle, href: siteConfig.social.instagram.url, icon: "instagram" as const },
    { label: "TikTok", handle: siteConfig.social.tiktok.handle, href: siteConfig.social.tiktok.url, icon: "tiktok" as const },
    { label: "Email", handle: siteConfig.email, href: `mailto:${siteConfig.email}`, icon: "mail" as const },
  ],
};

export interface Agent {
  id: string;
  name: string;
  role: string;
  languages: string[];
  phone: string;
  photo: string | null;
  bio: string;
  speciality: string;
  placeholder?: boolean;
}

/**
 * Only one real person is known: Bilal, the owner. The remaining slots are
 * explicit placeholders — no stock faces, no invented bios.
 */
export const agents: Agent[] = [
  {
    id: "bilal",
    name: siteConfig.owner.name,
    role: siteConfig.owner.role,
    languages: [...siteConfig.owner.languages],
    phone: siteConfig.phone.local,
    photo: siteConfig.owner.photo,
    bio: "Founder of Bilal Estate. Handles every mandate personally — sourcing, file verification, negotiation and transfer across Islamabad and Rawalpindi, including purchases completed while the buyer is overseas.",
    speciality: "Islamabad & Rawalpindi · overseas buyers",
  },
  {
    id: "agent-2",
    name: "TODO_ADD_AGENT",
    role: "TODO_ADD_ROLE",
    languages: [],
    phone: siteConfig.phone.local,
    photo: null,
    bio: "Add a second consultant here: name, role, languages and a portrait in public/images/team/.",
    speciality: "TODO_ADD_SPECIALITY",
    placeholder: true,
  },
  {
    id: "agent-3",
    name: "TODO_ADD_AGENT",
    role: "TODO_ADD_ROLE",
    languages: [],
    phone: siteConfig.phone.local,
    photo: null,
    bio: "Add a third consultant here, or delete the slot from src/data/content.ts.",
    speciality: "TODO_ADD_SPECIALITY",
    placeholder: true,
  },
];

export const owner = agents[0];

export interface Service {
  id: string;
  title: string;
  titleUr: string;
  icon: "key" | "house" | "handshake" | "chart" | "compass" | "scales";
  blurb: string;
  bullets: string[];
}

export const services: Service[] = [
  {
    id: "buy",
    title: "Buy",
    titleUr: "خریدیں",
    icon: "key",
    blurb: "Sourcing, verification and negotiation on residential property across Islamabad and Rawalpindi.",
    bullets: ["Title & file verification", "Society / authority checks", "Negotiation mandate", "Transfer day handled"],
  },
  {
    id: "sell",
    title: "Sell",
    titleUr: "فروخت کریں",
    icon: "house",
    blurb: "A discreet, properly documented listing that reaches real buyers instead of the open market noise.",
    bullets: ["Photography & walkthrough", "Valuation note", "Private buyer list", "Paperwork handled"],
  },
  {
    id: "rent",
    title: "Rent",
    titleUr: "کرایہ",
    icon: "handshake",
    blurb: "Tenancy agreements, inventory and renewal tracking for landlords who do not want midnight calls.",
    bullets: ["Tenant screening", "Registered agreements", "Inventory & handover", "Renewal reminders"],
  },
  {
    id: "manage",
    title: "Property Management",
    titleUr: "پراپرٹی مینجمنٹ",
    icon: "compass",
    blurb: "Full custody for overseas owners: bills, maintenance, tenants and a monthly statement.",
    bullets: ["Monthly statements", "Maintenance crew", "Utility & tax payments", "Photo report each quarter"],
  },
  {
    id: "invest",
    title: "Investment Advisory",
    titleUr: "سرمایہ کاری مشاورت",
    icon: "chart",
    blurb: "Yield modelling, phased payment plans and exit strategy — for portfolios, not single purchases.",
    bullets: ["Yield modelling", "Society comparison", "Phased entry plans", "Exit timing"],
  },
  {
    id: "legal",
    title: "Interior & Legal Support",
    titleUr: "انٹیریئر اور قانونی معاونت",
    icon: "scales",
    blurb: "Design direction plus a legal panel for inheritance, power of attorney and society disputes.",
    bullets: ["Interior direction", "Legal panel", "Power of attorney", "Inheritance transfer"],
  },
];

/**
 * Derived, honest numbers only. Anything that would be an invented claim
 * (years in business, deals closed, value handled) is a visible TODO instead.
 */
export const stats = [
  { key: "listings", label: "Live mandates", value: properties.length, suffix: "", note: "currently on the register" },
  { key: "sectors", label: "Sectors covered", value: new Set(properties.map((p) => p.society)).size, suffix: "+", note: "Islamabad & Rawalpindi" },
  { key: "years", label: "Years in the market", value: null as number | null, suffix: "", note: siteConfig.todo.yearsInBusiness },
  { key: "deals", label: "Deals closed", value: null as number | null, suffix: "+", note: "TODO_ADD_DEALS_CLOSED" },
];

export interface Testimonial {
  quote: string;
  name: string;
  meta: string;
  /** sample copy until real, consented client quotes are supplied */
  sample: true;
}

export const testimonials: Testimonial[] = [
  {
    quote: "Sample placeholder — replace with a real client quote. Example shape: “The file was checked before we were asked for a token, and we saw every document ourselves.”",
    name: "TODO_ADD_CLIENT_NAME",
    meta: "TODO_ADD_CLIENT_CONTEXT",
    sample: true,
  },
  {
    quote: "Sample placeholder — replace with a real client quote. Example shape: “We bought from abroad and never had to fly in for the transfer.”",
    name: "TODO_ADD_CLIENT_NAME",
    meta: "TODO_ADD_CLIENT_CONTEXT",
    sample: true,
  },
  {
    quote: "Sample placeholder — replace with a real client quote. Example shape: “One statement a month and one call a year — exactly what I wanted from a manager.”",
    name: "TODO_ADD_CLIENT_NAME",
    meta: "TODO_ADD_CLIENT_CONTEXT",
    sample: true,
  },
];

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  cover: string;
  body: string[];
  /** editorial drafts — review before publishing as advice */
  draft?: boolean;
}

export const posts: Post[] = [
  {
    slug: "how-to-verify-a-property-file",
    title: "How to verify a property file in Pakistan (a real checklist)",
    excerpt:
      "Seven documents, three phone calls and one physical visit. The sequence we run before a client is asked for a token.",
    category: "Legal",
    date: "2026-01-18",
    author: "Bilal Estate",
    cover: placeholderStock.blog1,
    draft: true,
    body: [
      "A file is a promise. Before you pay against it, you want to know that the promise is recorded, unencumbered, and that the person selling it is the person who owns it.",
      "Start with the allotment letter and the transfer letter in the seller's name. Then ask the society or authority office for a fresh ownership record — not a screenshot from a dealer's phone. In the developed authorities you can often verify through an online portal; in the smaller societies you must go in person.",
      "Check for encumbrance: a bank mortgage, a lien, an inheritance claim, or unpaid development charges. Unpaid charges are the most common surprise, and they follow the file to you.",
      "Confirm that the person signing has the right to sign. If they are abroad you need a registered power of attorney, verified with the embassy and the registrar — an attested photocopy is not enough.",
      "Finally, walk the plot. Boundaries move on paper. A physical visit with the authority's own map catches roughly one problem in ten, and that one problem is usually worth more than any fee you paid.",
    ],
  },
  {
    slug: "overseas-buyers-guide",
    title: "A buyer's guide for overseas Pakistanis",
    excerpt: "Banking routes, tax treatment for non-residents, and how to complete a purchase without boarding a flight.",
    category: "Invest",
    date: "2025-12-06",
    author: "Bilal Estate",
    cover: placeholderStock.blog2,
    draft: true,
    body: [
      "A large share of enquiries we receive come from buyers who have not stood inside the property they are considering. That works, but only if the sequence is right.",
      "Money should arrive through a banking channel — a foreign-currency remittance into your own Pakistani account. It creates the paper trail you need if you ever want to repatriate proceeds, which a cash route never will.",
      "Tax treatment for non-residents differs by holding period and by province. Ask your adviser to model both the purchase-side advance tax and the capital gains position on exit before you commit, and confirm the current rates with a tax professional — we do not publish rates as facts.",
      "Register your power of attorney at the Pakistani embassy, then with the registrar here. Two steps, both necessary, and the second is the one people forget.",
      "From there the process is identical to a local purchase: verification, token, agreement, transfer day. We send video of every step, including the counter itself.",
    ],
  },
  {
    slug: "designing-for-islamabad-light",
    title: "Designing for Islamabad light: why the west wall matters",
    excerpt:
      "The Margallas turn gold late in the afternoon and every architect in the city argues about how much glass to put facing them.",
    category: "Design",
    date: "2025-11-14",
    author: "Bilal Estate",
    cover: placeholderStock.blog3,
    draft: true,
    body: [
      "Islamabad sits with a hill range on its north-west edge, which means the best hour of light comes in low and warm across the Margallas. Every good house here has a plan for it.",
      "The naive answer is a wall of west-facing glass. It photographs beautifully and overheats the living room from May to September. The considered answer is deep eaves — roughly 1.2 to 1.8 metres — which admit the low winter sun and cut the high summer sun entirely.",
      "Stone, lime plaster and dark timber earn their reputation here: they hold warm light and return it slowly after sunset, which is exactly when families actually sit outside.",
      "When we assess a house, aspect is one of the first things we look at. The same plan facing north-west can be worth meaningfully more than the identical plan facing a service lane — ask for comparables rather than accepting an assertion.",
    ],
  },
];

/** Indicative travel times from the Margalla Hills / Park Road belt — verify before publishing. */
export const nearby = [
  { label: "Faisal Mosque", type: "Landmark", time: "TODO_MIN", x: 0.42, y: 0.3 },
  { label: "Centaurus Mall", type: "Retail", time: "TODO_MIN", x: 0.5, y: 0.52 },
  { label: "Blue Area", type: "Business", time: "TODO_MIN", x: 0.55, y: 0.6 },
  { label: "Shifa International Hospital", type: "Hospital", time: "TODO_MIN", x: 0.33, y: 0.66 },
  { label: "Islamabad Intl. Airport", type: "Airport", time: "TODO_MIN", x: 0.16, y: 0.78 },
  { label: "Margalla Trail 5", type: "Recreation", time: "TODO_MIN", x: 0.4, y: 0.16 },
];

export const purposeLabels: Record<string, string> = {
  all: "All listings",
  buy: "Buy",
  rent: "Rent",
  commercial: "Commercial",
  plot: "Plots",
};

export const purposeLabelsUr: Record<string, string> = {
  all: "تمام",
  buy: "خریدیں",
  rent: "کرایہ",
  commercial: "کمرشل",
  plot: "پلاٹ",
};

export const officeImage = placeholderStock.office;
export const heroImages = { dusk: images.hero, night: images.heroNight, aerial: images.aerial };
