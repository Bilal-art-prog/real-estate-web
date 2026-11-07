import { create } from "zustand";
import type { Property } from "../data/properties";

export type Purpose = "all" | "buy" | "rent" | "commercial" | "plot";
export type SortKey = "featured" | "price-desc" | "price-asc" | "area-desc" | "newest";
export type Tier = "low" | "mid" | "high";

export interface Filters {
  q: string;
  purpose: Purpose;
  type: string;
  society: string;
  min: number;
  max: number;
  beds: number;
  baths: number;
  sort: SortKey;
}

export const defaultFilters: Filters = {
  q: "",
  purpose: "all",
  type: "all",
  society: "all",
  min: 0,
  max: 1_000_000_000,
  beds: 0,
  baths: 0,
  sort: "featured",
};

interface BookingDraft {
  property: Property | null;
  agentName?: string;
}

interface State {
  /* preloader */
  booted: boolean;
  bootProgress: number;
  sceneReady: Record<string, boolean>;
  setBooted: (v: boolean) => void;
  addBoot: (chunk: number) => void;
  markSceneReady: (key: string) => void;

  /* device + quality */
  tier: Tier;
  setTier: (t: Tier) => void;
  webgl: boolean;
  setWebgl: (v: boolean) => void;

  /* filters */
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  view: "grid" | "map";
  setView: (v: "grid" | "map") => void;

  /* saved */
  saved: string[];
  toggleSave: (slug: string) => void;

  /* walkthrough */
  night: boolean;
  toggleNight: () => void;
  setNight: (v: boolean) => void;
  walkStop: number;
  setWalkStop: (i: number) => void;

  /* iso map */
  hovered: string | null;
  setHovered: (slug: string | null) => void;
  drawer: Property | null;
  setDrawer: (p: Property | null) => void;

  /* booking modal */
  booking: BookingDraft | null;
  openBooking: (property?: Property | null, agentName?: string) => void;
  closeBooking: () => void;

  /* audio */
  audio: boolean;
  toggleAudio: () => void;

  /* cursor */
  cursorMode: "default" | "hover" | "label";
  cursorLabel: string;
  setCursor: (mode: State["cursorMode"], label?: string) => void;

  /* mobile menu */
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;

  /* language (English / Urdu + RTL) */
  lang: "en" | "ur";
  setLang: (l: "en" | "ur") => void;

  /* interior walk-through room index */
  room: number;
  setRoom: (i: number) => void;
  dusk: boolean;
  setDusk: (v: boolean) => void;

  /* toasts */
  toast: string | null;
  pushToast: (msg: string) => void;
}

export const useStore = create<State>((set, get) => ({
  booted: false,
  bootProgress: 0,
  sceneReady: {},
  setBooted: (v) => set({ booted: v }),
  addBoot: (chunk) => set({ bootProgress: Math.min(100, get().bootProgress + chunk) }),
  markSceneReady: (key) =>
    set((s) => ({ sceneReady: { ...s.sceneReady, [key]: true } })),

  tier: "high",
  setTier: (t) => set({ tier: t }),
  webgl: true,
  setWebgl: (v) => set({ webgl: v }),

  filters: { ...defaultFilters },
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  view: "grid",
  setView: (v) => set({ view: v }),

  saved: [],
  toggleSave: (slug) =>
    set((s) => ({
      saved: s.saved.includes(slug) ? s.saved.filter((x) => x !== slug) : [...s.saved, slug],
    })),

  night: false,
  toggleNight: () => set((s) => ({ night: !s.night })),
  setNight: (v) => set({ night: v }),
  walkStop: 0,
  setWalkStop: (i) => set({ walkStop: i }),

  hovered: null,
  setHovered: (slug) => set({ hovered: slug }),
  drawer: null,
  setDrawer: (p) => set({ drawer: p }),

  booking: null,
  openBooking: (property = null, agentName) => set({ booking: { property, agentName } }),
  closeBooking: () => set({ booking: null }),

  audio: false,
  toggleAudio: () => set((s) => ({ audio: !s.audio })),

  cursorMode: "default",
  cursorLabel: "",
  setCursor: (mode, label = "") => set({ cursorMode: mode, cursorLabel: label }),

  menuOpen: false,
  setMenuOpen: (v) => set({ menuOpen: v }),

  lang: (typeof localStorage !== "undefined" && localStorage.getItem("be.lang") === "ur" ? "ur" : "en") as "en" | "ur",
  setLang: (l) => set({ lang: l }),

  room: 0,
  setRoom: (i) => set({ room: i }),
  dusk: true,
  setDusk: (v) => set({ dusk: v }),

  toast: null,
  pushToast: (msg) => {
    set({ toast: msg });
    window.setTimeout(() => {
      if (get().toast === msg) set({ toast: null });
    }, 2600);
  },
}));
