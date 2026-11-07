import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Cursor from "./components/ui/Cursor";
import BookingModal from "./components/ui/BookingModal";
import WhatsAppFab, { Toasts } from "./components/ui/WhatsAppFab";
import Preloader from "./components/sections/Preloader";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import { BlogIndex, BlogPost } from "./pages/Blog";
import Admin from "./pages/Admin";
import Diagnostics from "./pages/Diagnostics";
import ExternalLinkHelper from "./components/ui/ExternalLinkHelper";
import NotFound from "./pages/NotFound";
import { useDeviceBootstrap } from "./hooks/useDevice";
import { initSmoothScroll, ScrollTrigger, scrollToTop } from "./lib/scroll";
import { logEvent } from "./lib/leads";
import { useStore } from "./store/useStore";
import { setAmbience } from "./lib/ambience";
import { storedLang } from "./lib/i18n";
import { siteConfig } from "./lib/siteConfig";
import { buildWhatsAppLink, isEmbeddedFrame } from "./lib/whatsapp";

function ScrollManager() {
  const { pathname } = useLocation();

  // Only on route changes — never on `search`, otherwise every filter tweak on
  // /properties would yank the page back to the top.
  useEffect(() => {
    scrollToTop(true);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 220);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // analytics: page_view per route
  useEffect(() => {
    logEvent({ type: "page_view", page: pathname });
  }, [pathname]);

  return null;
}

function Boot() {
  useDeviceBootstrap();
  const audio = useStore((s) => s.audio);
  const setLang = useStore((s) => s.setLang);

  useEffect(() => {
    // Build stamp + resolved destinations, printed once so a stale artifact or a
    // blocked frame can be identified from the console in seconds.
    try {
      console.info(
        `%c Bilal Estate %c ${siteConfig.buildStamp}`,
        "background:#C9A96E;color:#0A0D0C;font-weight:700;border-radius:3px 0 0 3px;padding:2px 6px",
        "background:#121917;color:#F4EFE6;border-radius:0 3px 3px 0;padding:2px 6px",
      );
      console.info("WhatsApp:", buildWhatsAppLink({}), "\nInstagram:", siteConfig.social.instagram.url, "\nTikTok:", siteConfig.social.tiktok.url);
      if (isEmbeddedFrame()) console.warn("Running inside a frame/preview shell — wa.me, Instagram and TikTok send X-Frame-Options: DENY, so in-frame loads fail with ERR_BLOCKED_BY_RESPONSE. Open /#/diagnostics.");
    } catch {
      /* console only */
    }
    setLang(storedLang());
    initSmoothScroll();
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    // late refreshes cover lazy canvases and web-font metrics
    const a = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    const b = window.setTimeout(() => ScrollTrigger.refresh(), 1800);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [setLang]);

  useEffect(() => {
    setAmbience(audio);
  }, [audio]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <Boot />
      <ScrollManager />
      <Preloader />
      <Cursor />
      <div className="grain relative min-h-screen bg-obsidian">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:slug" element={<PropertyDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
      <ExternalLinkHelper />
      <WhatsAppFab />
      <Toasts />
      <BookingModal />
    </HashRouter>
  );
}
