import { lazy, Suspense, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { images } from "../../lib/images";
import { site } from "../../data/content";
import { properties } from "../../data/properties";
import { useStore } from "../../store/useStore";
import { bindProgress, progress } from "../../lib/scroll";
import { buildWhatsAppLink, trackWhatsAppClick, waMessages } from "../../lib/whatsapp";
import { useLang } from "../../lib/i18n";
import { Button, Eyebrow, SplitLines } from "../ui/Reveal";
import Canvas3D from "../three/Canvas3D";
import { IconArrowRight, IconArrowUpRight, IconWhatsApp } from "../ui/Icons";
import { usePrefersReducedMotion } from "../../hooks/useDevice";

const HeroDepth = lazy(() => import("../three/HeroDepth"));

/** Dusk grade used behind/over the photograph so type stays AA-legible. */
const GRADE =
  "linear-gradient(to bottom, rgba(10,13,12,0.72) 0%, rgba(10,13,12,0.18) 32%, rgba(10,13,12,0.35) 58%, rgba(10,13,12,0.94) 100%)";

export default function Hero() {
  const section = useRef<HTMLElement | null>(null);
  const leak = useRef<HTMLDivElement | null>(null);
  const layers = useRef<HTMLDivElement | null>(null);
  const webgl = useStore((s) => s.webgl);
  const reduced = usePrefersReducedMotion();
  const { t, lang } = useLang();

  const sectors = new Set(properties.map((p) => p.society)).size;

  useEffect(() => {
    const st = bindProgress("hero", section.current, { start: "top top", end: "bottom top" });
    return () => {
      st?.kill();
      progress.hero = 0;
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (leak.current) leak.current.style.opacity = String(Math.min(0.9, Math.pow(progress.hero, 1.5)));
      raf = requestAnimationFrame(tick);
    };
    if (!reduced) raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      if (reduced || !layers.current) return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      layers.current.style.setProperty("--px", nx.toFixed(4));
      layers.current.style.setProperty("--py", ny.toFixed(4));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  const viewingHref = buildWhatsAppLink({ message: waMessages.viewing() });

  return (
    <section
      ref={section}
      id="top"
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-obsidian text-ivory vignette"
    >
      {/* base photograph — always present, also the no-WebGL fallback */}
      <div
        ref={layers}
        className="absolute inset-0"
        style={{ ["--px" as any]: 0, ["--py" as any]: 0 }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${images.hero})`,
            transform: reduced
              ? undefined
              : "translate3d(calc(var(--px) * -12px), calc(var(--py) * -8px), 0) scale(1.06)",
          }}
        />
        {webgl && !reduced && (
          <div className="absolute inset-0">
            <Canvas3D
              poster={`linear-gradient(rgba(10,13,12,0.4),rgba(10,13,12,0.4)), url(${images.hero}) center/cover`}
              posterLabel="Hero depth scene"
              camera={{ position: [0, 0, 12], fov: 42, far: 60 }}
              exposure={1}
              shadows={false}
            >
              <Suspense fallback={null}>
                <HeroDepth src={images.hero} />
              </Suspense>
            </Canvas3D>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0" style={{ background: GRADE }} aria-hidden="true" />
      <div ref={leak} className="warm-leak" style={{ opacity: 0 }} aria-hidden="true" />

      {/* ── editorial overlay ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between px-[var(--gut)] pb-[calc(1.5rem+var(--safe-b))] pt-24 sm:pt-28 md:pb-10">
        <div className="flex items-start justify-between gap-6">
          <Eyebrow className="pointer-events-auto">{t.hero.eyebrow}</Eyebrow>
          <div className="hidden text-right sm:block">
            <p className="label text-mist/60">{lang === "ur" ? "باب ۰۱" : "Chapter 01"}</p>
            <p className="serif-it mt-1 text-lg text-ivory/75">
              {lang === "ur" ? "مارگلہ کی پہاڑیاں، شام کا وقت" : "Margalla Hills, blue hour"}
            </p>
          </div>
        </div>

        <div className="relative -mx-[var(--gut)] px-[var(--gut)]">
          <SplitLines
            as="h1"
            className="display pointer-events-none select-none"
            lines={[
              <span key="a" className="block text-[clamp(3.6rem,17vw,16rem)] leading-[0.8] tracking-[-0.02em]">
                {t.hero.titleA}
              </span>,
              <span key="b" className="flex flex-wrap items-end gap-x-[0.08em] text-[clamp(3.6rem,17vw,16rem)] leading-[0.8] tracking-[-0.02em]">
                <span className="gold-sheen">{t.hero.titleB}</span>
              </span>,
            ]}
          />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl md:ml-auto md:mr-0 md:mt-[-5.5rem] md:max-w-md md:text-right"
          >
            <p className="urdu text-gold-soft" lang="ur" dir="rtl">
              {site.taglineUr}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-mist">{t.hero.body}</p>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="pointer-events-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button to="/properties" variant="solid" size="lg" icon={<IconArrowRight className="h-4 w-4" />}>
                {t.cta.explore}
              </Button>
              <a
                href={viewingHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ placement: "hero_cta" })}
                data-wa="hero_cta"
                className="group/btn inline-flex items-center justify-center gap-2.5 rounded-full border border-line px-8 py-4 text-ivory transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                <IconWhatsApp className="h-4 w-4 text-wa" />
                <span className="label">{t.cta.viewing}</span>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] text-mist/70">
              <span className="label">{properties.length} live mandates</span>
              <span className="h-px w-8 bg-line" />
              <span className="label">{sectors} societies</span>
              <span className="h-px w-8 bg-line" />
              <a href={`tel:${site.phoneTel}`} className="link-underline num hover:text-gold">
                {site.phoneIntl}
              </a>
            </div>
          </div>

          <div className="pointer-events-auto flex items-end gap-8">
            <div className="hidden text-right sm:block">
              <p className="display text-[2.6rem] leading-none text-ivory">{properties.filter((p) => p.premium).length}</p>
              <p className="label mt-2 text-mist/60">Premium concepts</p>
            </div>
            <Link
              to="/properties"
              className="group flex flex-col items-center gap-3 text-mist/70 transition-colors hover:text-gold"
              aria-label={t.hero.scroll}
            >
              <span className="label">{t.hero.scroll}</span>
              <span className="scroll-cue-line relative h-14 w-px overflow-hidden bg-ivory/20" />
              <IconArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
