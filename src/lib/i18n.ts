import { useCallback, useEffect } from "react";
import { useStore } from "../store/useStore";

export type Lang = "en" | "ur";

/**
 * UI dictionary. Property records stay in English (their own bilingual fields
 * can be added later — marked TODO_ADD_URDU_LISTINGS in the README).
 */
const dict = {
  en: {
    dir: "ltr",
    nav: { home: "Home", properties: "Properties", about: "About", insights: "Insights", contact: "Contact" },
    cta: {
      explore: "Explore properties",
      viewing: "Book a private viewing",
      whatsapp: "WhatsApp Us",
      call: "Call now",
      details: "View details",
      ask: "Ask on WhatsApp",
      saved: "Saved",
      menu: "Menu",
      close: "Close",
      backToTop: "Back to top",
      subscribe: "Subscribe",
      send: "Send on WhatsApp",
      continueWa: "Continue on WhatsApp",
      allListings: "All listings",
    },
    hero: {
      eyebrow: "Islamabad · Rawalpindi — Pakistan",
      titleA: "Bilal",
      titleB: "Estate",
      body: "Find the space where your life begins. Verified residential, commercial and land mandates across the Islamabad belt — photographed, measured and documented before they ever reach you.",
      scroll: "Scroll",
    },
    labels: {
      buy: "Buy",
      rent: "Rent",
      commercial: "Commercial",
      plot: "Plots",
      all: "All",
      bed: "bed",
      bath: "bath",
      area: "Area",
      price: "Price",
      status: "Status",
      filters: "Filters",
      search: "Search",
      sort: "Sort",
      reset: "Reset",
      results: "properties",
      name: "Full name",
      phone: "Phone / WhatsApp",
      email: "Email",
      budget: "Budget",
      interest: "I am interested in",
      message: "Message",
      hours: "Opening hours",
      office: "Office",
      language: "Language",
    },
    sections: {
      stepInside: "Step inside",
      portfolio: "The portfolio",
      neighbourhood: "The neighbourhood",
      services: "What we do",
      why: "Why Bilal Estate",
      about: "About Bilal",
      journal: "Insights",
      contact: "Talk to us",
    },
  },
  ur: {
    dir: "rtl",
    nav: { home: "ہوم", properties: "املاک", about: "ہمارے بارے میں", insights: "مضامین", contact: "رابطہ" },
    cta: {
      explore: "املاک دیکھیں",
      viewing: "نجی وزٹ بک کریں",
      whatsapp: "واٹس ایپ کریں",
      call: "ابھی کال کریں",
      details: "تفصیلات دیکھیں",
      ask: "واٹس ایپ پر پوچھیں",
      saved: "محفوظ",
      menu: "مینو",
      close: "بند کریں",
      backToTop: "اوپر جائیں",
      subscribe: "سبسکرائب",
      send: "واٹس ایپ پر بھیجیں",
      continueWa: "واٹس ایپ پر جاری رکھیں",
      allListings: "تمام املاک",
    },
    hero: {
      eyebrow: "اسلام آباد · راولپنڈی — پاکستان",
      titleA: "بلال",
      titleB: "اسٹیٹ",
      body: "جہاں آپ کی نئی زندگی شروع ہوتی ہے۔ اسلام آباد اور راولپنڈی میں رہائشی، کمرشل اور زمین کی تصدیق شدہ املاک — ہر فائل جانچنے کے بعد ہی آپ تک پہنچائی جاتی ہے۔",
      scroll: "نیچے جائیں",
    },
    labels: {
      buy: "خریدیں",
      rent: "کرایہ",
      commercial: "کمرشل",
      plot: "پلاٹ",
      all: "تمام",
      bed: "بیڈ",
      bath: "باتھ",
      area: "رقبہ",
      price: "قیمت",
      status: "حیثیت",
      filters: "فلٹرز",
      search: "تلاش",
      sort: "ترتیب",
      reset: "ری سیٹ",
      results: "املاک",
      name: "پورا نام",
      phone: "فون / واٹس ایپ",
      email: "ای میل",
      budget: "بجٹ",
      interest: "مجھے دلچسپی ہے",
      message: "پیغام",
      hours: "اوقات کار",
      office: "دفتر",
      language: "زبان",
    },
    sections: {
      stepInside: "اندر قدم رکھیں",
      portfolio: "ہمارا پورٹ فولیو",
      neighbourhood: "علاقہ",
      services: "ہماری خدمات",
      why: "بلال اسٹیٹ کیوں",
      about: "بلال کے بارے میں",
      journal: "مضامین",
      contact: "ہم سے بات کریں",
    },
  },
} as const;

export type Dict = (typeof dict)["en"];

export function useLang() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang === "ur" ? "ur-PK" : "en-PK";
    root.dir = dict[lang].dir;
    root.classList.toggle("rtl", lang === "ur");
    try {
      localStorage.setItem("be.lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = dict[lang];
  const toggle = useCallback(() => setLang(lang === "en" ? "ur" : "en"), [lang, setLang]);
  return { lang, setLang, toggle, t };
}

export function storedLang(): Lang {
  try {
    const v = localStorage.getItem("be.lang");
    return v === "ur" ? "ur" : "en";
  } catch {
    return "en";
  }
}
