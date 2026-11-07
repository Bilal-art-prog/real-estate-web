/**
 * SINGLE SOURCE OF TRUTH for every contact detail on the site.
 * Change the number / handles here once and all 20+ WhatsApp, call, Instagram
 * and TikTok links update together.
 */

const env = ((import.meta as any).env ?? {}) as Record<string, string | undefined>;

export const siteConfig = {
  brand: {
    name: "Bilal Estate",
    shortName: "Bilal",
    tagline: "Find the space where your life begins.",
    taglineUr: "جہاں آپ کی نئی زندگی شروع ہوتی ہے",
    city: "Islamabad",
    alsoServes: "Rawalpindi",
    country: "Pakistan",
    currency: "PKR",
  },

  phone: {
    /** local display */
    display: "0345 0655699",
    /** international display */
    intlDisplay: "+92 345 0655699",
    /** wa.me / click-to-chat: country code + number, digits only, no leading + */
    whatsapp: "923450655699",
    /** tel: href */
    tel: "+923450655699",
    /** raw local form used by older helpers */
    local: "03450655699",
  },

  owner: {
    name: "Bilal",
    role: "Founder & Property Consultant",
    languages: ["English", "Urdu", "Punjabi"],
    /**
     * OWNER PHOTO — drop the real portrait at public/images/owner/bilal.jpg
     * (4:5 crop). Until then the component falls back to a neutral silhouette.
     */
    photo: "/images/owner/bilal.jpg",
    photoAlt: "Bilal, founder of Bilal Estate",
    photoFallbackNote: "TODO_ADD_OWNER_PHOTO → public/images/owner/bilal.jpg",
  },

  /**
   * Exact profile URLs supplied by the owner — do not rewrite, shorten or
   * normalise them. Every Instagram / TikTok control on the site reads these
   * two values (navbar menu, footer, contact section, team/about section), so
   * this is the single place to change a handle.
   */
  social: {
    instagram: { handle: "@i.bilalmunir_", url: "https://www.instagram.com/i.bilalmunir_/" },
    tiktok: { handle: "@i.bilalmunir_", url: "https://www.tiktok.com/@i.bilalmunir_?lang=en-GB" },
  },

  /** Provided by the owner in the project brief. */
  email: "Muhammadbilal42030@gmail.com",

  /**
   * DO NOT INVENT FACTS. Everything below is an explicit placeholder for the
   * owner to fill in. Components render them as muted "to be confirmed" copy
   * rather than as invented company claims.
   */
  todo: {
    officeAddress: "TODO_ADD_OFFICE_ADDRESS",
    openingHours: "TODO_ADD_OPENING_HOURS",
    licenseNumber: "TODO_ADD_LICENSE_NUMBER",
    yearsInBusiness: "TODO_ADD_YEARS",
    emailAlternate: "",
  },

  /** Map defaults for the Islamabad aerial section (real geography). */
  map: {
    center: { lat: 33.6261, lng: 73.0715 },
    bounds: { north: 33.75, south: 33.45, west: 72.95, east: 73.22 },
  },

  /**
   * Optional backend. When VITE_API_BASE is set at build time, leads and
   * analytics events are POSTed to `${base}/api/leads` and `${base}/api/events`.
   * With no backend configured they are stored locally in the browser so the
   * admin view still works end-to-end (see README → "Backend").
   */
  endpoints: {
    apiBase: env.VITE_API_BASE ?? "",
    eventsPath: "/api/events",
    leadsPath: "/api/leads",
  },

  legal: {
    visualsNote: "Property visuals are architectural concept renderings.",
    verifiedBadgeLabel: "Verified listing",
  },

  /**
   * Build stamp — shown on #/diagnostics and printed to the console on boot.
   * If a browser shows an OLD stamp, it is serving a stale cached artifact, not
   * the current build. Bump this whenever contact config changes.
   */
  buildStamp: "v3 · wa.me/923450655699 · @i.bilalmunir_",
} as const;

export const isPlaceholder = (v: string) => v.startsWith("TODO_");

export const waNumber = siteConfig.phone.whatsapp;
