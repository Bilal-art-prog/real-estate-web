import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "../../data/content";
import { siteConfig } from "../../lib/siteConfig";
import { useStore } from "../../store/useStore";
import { useLang } from "../../lib/i18n";
import { buildWhatsAppLink, trackWhatsAppClick, waMessages } from "../../lib/whatsapp";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Reveal";
import {
  IconArrowUpRight,
  IconClose,
  IconInstagram,
  IconMenu,
  IconSound,
  IconTikTok,
  IconWhatsApp,
  Monogram,
} from "../ui/Icons";
import { setAmbience } from "../../lib/ambience";
import { lockScroll } from "../../lib/scroll";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const menuOpen = useStore((s) => s.menuOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const saved = useStore((s) => s.saved);
  const audio = useStore((s) => s.audio);
  const toggleAudio = useStore((s) => s.toggleAudio);
  const openBooking = useStore((s) => s.openBooking);
  const { pathname } = useLocation();
  const { t, lang, toggle } = useLang();

  const links = [
    { to: "/", label: t.nav.home, n: "01" },
    { to: "/properties", label: t.nav.properties, n: "02" },
    { to: "/about", label: t.nav.about, n: "03" },
    { to: "/blog", label: t.nav.insights, n: "04" },
    { to: "/contact", label: t.nav.contact, n: "05" },
  ];

  const waHref = buildWhatsAppLink({ message: waMessages.general() });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    lockScroll(menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-[70] transition-all duration-700", scrolled ? "py-2" : "py-4 md:py-6")}>
        <div
          className={cn(
            "pointer-events-none absolute inset-0 border-b transition-opacity duration-700",
            scrolled ? "border-line bg-obsidian/80 opacity-100 backdrop-blur-xl" : "opacity-0",
          )}
        />
        <div className="relative mx-auto flex items-center justify-between gap-4 px-[var(--gut)]">
          <Link to="/" className="group flex items-center gap-3 text-ivory" aria-label={`${site.name} — home`}>
            <Monogram className="h-8 w-8 text-gold transition-transform duration-700 group-hover:rotate-[8deg]" />
            <span className="leading-none">
              <span className="display block text-[1.15rem] tracking-tight">{site.name}</span>
              <span className="label mt-1 block text-[0.5rem] text-mist/70">
                {siteConfig.brand.city} · {siteConfig.brand.country}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-ivory lg:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className="relative px-4 py-2">
                {({ isActive }) => (
                  <>
                    <span className={cn("label transition-colors duration-400", isActive ? "text-gold" : "text-mist hover:text-ivory")}>
                      {l.label}
                    </span>
                    <span className={cn("absolute bottom-1 left-4 right-4 h-px origin-left bg-gold transition-transform duration-500", isActive ? "scale-x-100" : "scale-x-0")} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="hidden h-11 items-center rounded-full border border-line px-3 text-ivory transition-colors hover:border-gold hover:text-gold sm:flex"
              aria-label={lang === "en" ? "اردو میں دیکھیں" : "View in English"}
              aria-pressed={lang === "ur"}
            >
              <span className="label">{lang === "en" ? "اردو" : "EN"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                toggleAudio();
                setAmbience(!audio);
              }}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-line text-ivory transition-colors hover:border-gold hover:text-gold sm:flex"
              aria-label={audio ? "Mute ambience" : "Play ambience"}
              aria-pressed={audio}
            >
              <IconSound muted={!audio} className="h-4 w-4" />
            </button>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-wa="navbar"
              onClick={() => trackWhatsAppClick({ placement: "navbar" })}
              className="hidden h-11 items-center gap-2 rounded-full border border-line px-4 text-ivory transition-colors hover:border-wa hover:text-wa md:flex"
            >
              <IconWhatsApp className="h-4 w-4 text-wa" />
              <span className="label">{t.cta.whatsapp}</span>
            </a>

            <button
              type="button"
              onClick={() => openBooking(null)}
              className="hidden h-11 items-center rounded-full bg-gradient-to-r from-gold via-gold-soft to-gold bg-[length:220%_100%] px-5 text-obsidian transition-[background-position] duration-700 hover:bg-[position:100%_0] xl:flex"
            >
              <span className="label">{t.cta.viewing}</span>
            </button>

            <Link
              to="/properties?saved=1"
              className="relative hidden h-11 items-center rounded-full border border-line px-4 text-ivory transition-colors hover:border-gold lg:flex"
            >
              <span className="label">{t.cta.saved}</span>
              <span className="ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.55rem] font-semibold text-obsidian">
                {saved.length}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500 lg:hidden",
                menuOpen ? "border-gold/50 text-gold" : "border-line text-ivory",
              )}
              aria-label={menuOpen ? t.cta.close : t.cta.menu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[65] flex flex-col justify-between overflow-y-auto bg-obsidian px-[var(--gut)] pb-[calc(2.5rem+var(--safe-b))] pt-28 lg:hidden"
            data-lenis-prevent
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(70% 50% at 80% 0%, rgba(23,98,79,0.5), transparent 70%), radial-gradient(60% 40% at 0% 100%, rgba(201,169,110,0.18), transparent 70%)",
              }}
            />
            <nav className="relative" aria-label="Mobile">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.18 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-line"
                >
                  <NavLink to={l.to} className="flex items-baseline justify-between gap-4 py-4">
                    <span className="display text-[clamp(2.2rem,11vw,3.6rem)] text-ivory">
                      {l.label}
                      <sup className="label ml-3 text-gold">{l.n}</sup>
                    </span>
                    <IconArrowUpRight className="h-5 w-5 shrink-0 text-mist/60" />
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7 }} className="relative mt-10 space-y-4">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-wa="mobile_menu"
                onClick={() => trackWhatsAppClick({ placement: "mobile_menu" })}
                className="pill !min-h-14 !w-full !justify-center !bg-wa !border-transparent !text-obsidian"
              >
                <IconWhatsApp className="h-4 w-4" /> {t.cta.whatsapp} · {site.phoneDisplay}
              </a>
              <Button variant="gold" className="!min-h-14 w-full" onClick={() => openBooking(null)}>
                {t.cta.viewing}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${site.phoneTel}`} className="pill justify-center">
                  {t.cta.call}
                </a>
                <a href={`mailto:${site.email}`} className="pill justify-center">
                  Email
                </a>
              </div>
              <div className="flex items-center justify-center gap-3">
                <a href={siteConfig.social.instagram.url} target="_blank" rel="noopener noreferrer" data-social="instagram" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-line text-ivory">
                  <IconInstagram className="h-4 w-4" />
                </a>
                <a href={siteConfig.social.tiktok.url} target="_blank" rel="noopener noreferrer" data-social="tiktok" aria-label="TikTok" className="grid h-11 w-11 place-items-center rounded-full border border-line text-ivory">
                  <IconTikTok className="h-4 w-4" />
                </a>
                <button type="button" onClick={toggle} className="grid h-11 place-items-center rounded-full border border-line px-4 text-ivory">
                  <span className="label">{lang === "en" ? "اردو" : "EN"}</span>
                </button>
              </div>
              <p className="urdu text-center text-sm text-gold-soft" lang="ur" dir="rtl">
                {site.taglineUr}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
