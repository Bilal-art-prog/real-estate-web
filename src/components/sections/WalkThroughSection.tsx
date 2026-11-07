import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { roomSequence } from "../../lib/images";
import { useStore } from "../../store/useStore";
import { bindProgress, onProgressChange, progress } from "../../lib/scroll";
import { useLang } from "../../lib/i18n";
import { Eyebrow } from "../ui/Reveal";
import { IconArrowRight, IconMoon, IconSun } from "../ui/Icons";
import { cn } from "../../lib/utils";
import { usePrefersReducedMotion } from "../../hooks/useDevice";

interface Stop {
  key: string;
  label: string;
  title: string;
  meta: string;
  slug: string;
}

/** Scroll order matches `roomSequence` in lib/images. */
const stops: Stop[] = [
  {
    key: "lobby",
    label: "Stop 01 — Entrance lobby",
    title: "Arched hall, black marble, one gold line",
    meta: "Double height · polished plaster · brass pendant",
    slug: "pine-water-villa-margalla-hills",
  },
  {
    key: "living",
    label: "Stop 02 — Living room",
    title: "Emerald velvet and a low fire",
    meta: "Fluted charcoal wall · smoked glass · night garden",
    slug: "rammed-earth-monolith-dha-5",
  },
  {
    key: "kitchen",
    label: "Stop 03 — Kitchen & dining",
    title: "Book-matched black marble island",
    meta: "Gold veining · walnut cabinetry · brushed brass",
    slug: "jali-courtyard-house-gulberg",
  },
  {
    key: "marble",
    label: "Stop 04 — Marble feature wall",
    title: "Verde marble beside black-stained timber",
    meta: "Single sculptural brass lamp · museum light",
    slug: "concrete-oak-residence-e11",
  },
  {
    key: "bedroom",
    label: "Stop 05 — Primary bedroom",
    title: "Platform bed, walnut headboard wall",
    meta: "City lights at blue hour · brass reading lights",
    slug: "cliff-cantilever-bani-gala",
  },
  {
    key: "terrace",
    label: "Stop 06 — Terrace",
    title: "Fire pit above the city bowl",
    meta: "Margalla ridge behind · warm filament light",
    slug: "skyline-penthouse-blue-area",
  },
];

/**
 * Photoreal walk-through. No modelled geometry: full-bleed room photographs
 * cross-dissolve with a slow push-in and pointer parallax as the user scrolls.
 */
export default function WalkThroughSection() {
  const sectionEl = useRef<HTMLElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rail = useRef<HTMLDivElement | null>(null);
  const nightGrade = useRef<HTMLDivElement | null>(null);
  const [stop, setStop] = useState(0);
  const dusk = useStore((s) => s.dusk);
  const setDusk = useStore((s) => s.setDusk);
  const reduced = usePrefersReducedMotion();
  const { t } = useLang();

  useEffect(() => {
    if (reduced) return;
    const st = bindProgress("walk", sectionEl.current, { start: "top top", end: "bottom bottom" });

    let raf = 0;
    const paint = () => {
      const p = progress.walk;
      const n = roomSequence.length;
      const span = 1 / n;
      if (rail.current) rail.current.style.transform = `scaleY(${Math.max(0.02, p)})`;

      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const centre = (i + 0.5) * span;
        const d = Math.abs(p - centre) / span; // 0 = centred, 1+ = far
        const o = Math.max(0, 1 - d * 1.25);
        const scale = 1.06 + (1 - Math.min(1, d)) * 0.07;
        const shift = (p - centre) * 26;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        el.style.zIndex = String(10 + Math.round(o * 10));
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      raf = 0;
    };

    const off = onProgressChange("walk", (p) => {
      let idx = 0;
      stops.forEach((_s, i) => {
        if (p >= i / stops.length - 0.02) idx = i;
      });
      setStop((prev) => (prev === idx ? prev : idx));
      if (!raf) raf = requestAnimationFrame(paint);
    });

    paint();
    return () => {
      st?.kill();
      off();
      if (raf) cancelAnimationFrame(raf);
      progress.walk = 0;
    };
  }, [reduced]);

  /* pointer parallax on the active room */
  useEffect(() => {
    if (reduced) return;
    const el = sectionEl.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--rx", `${(-ny * 5).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(nx * 7).toFixed(2)}deg`);
      el.style.setProperty("--tx", `${(-nx * 18).toFixed(2)}px`);
      el.style.setProperty("--ty", `${(-ny * 12).toFixed(2)}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const active = stops[stop];

  return (
    <section
      ref={sectionEl}
      id="step-inside"
      data-nav="dark"
      className={cn("relative bg-obsidian text-ivory", reduced ? "py-20" : "h-[520vh] md:h-[560vh]")}
      aria-label="Step inside — scroll driven walkthrough"
      style={{ ["--rx" as any]: "0deg", ["--ry" as any]: "0deg", ["--tx" as any]: "0px", ["--ty" as any]: "0px" }}
    >
      {reduced ? (
        <div className="mx-auto max-w-[1600px] px-[var(--gut)]">
          <Eyebrow>{t.sections.stepInside}</Eyebrow>
          <h2 className="display mt-5 max-w-[18ch] text-[clamp(2rem,6vw,4.4rem)] leading-[0.92]">
            Six rooms, one <span className="serif-it text-gold">continuous</span> path
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {stops.map((s, i) => (
              <figure key={s.key}>
                <img
                  src={roomSequence[i].src}
                  alt={s.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <figcaption className="mt-4">
                  <p className="label text-gold">{s.label}</p>
                  <h3 className="display mt-2 text-2xl leading-tight">{s.title}</h3>
                  <p className="mt-1 text-sm text-mist">{s.meta}</p>
                  <Link to={`/properties/${s.slug}`} className="label mt-3 inline-flex items-center gap-2 text-gold link-underline">
                    {t.cta.details} <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-obsidian">
          {/* photograph stack */}
          <div className="absolute inset-0" style={{ perspective: "1400px" }}>
            {roomSequence.map((room, i) => (
              <div
                key={room.key}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                className="absolute inset-0 will-change-transform"
                style={{
                  opacity: i === 0 ? 1 : 0,
                  transform: "scale(1.06)",
                  transformStyle: "preserve-3d",
                }}
                aria-hidden={i !== stop}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${i === stop && !dusk ? room.nightSrc : room.src})`,
                    transform: "translate3d(var(--tx), var(--ty), 0) rotateX(var(--rx)) rotateY(var(--ry)) scale(1.04)",
                    transition: "transform .9s cubic-bezier(.16,1,.3,1)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* night grade — crossfades when the Dusk/Night toggle flips */}
          <div
            ref={nightGrade}
            className="pointer-events-none absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)]"
            style={{
              opacity: dusk ? 0 : 1,
              background:
                "linear-gradient(180deg, rgba(6,10,18,0.72) 0%, rgba(6,10,18,0.35) 45%, rgba(4,8,14,0.8) 100%)",
              mixBlendMode: "multiply",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 42%, rgba(6,9,8,0.72) 100%)" }}
            aria-hidden="true"
          />

          {/* header */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-6 px-[var(--gut)] pt-24 sm:pt-28">
            <div>
              <Eyebrow>
                {t.sections.stepInside} — {dusk ? "Dusk" : "Night"}
              </Eyebrow>
              <h2 className="display mt-4 max-w-[16ch] text-[clamp(2rem,5.4vw,4.4rem)] leading-[0.9] text-ivory drop-shadow-[0_6px_30px_rgba(0,0,0,0.75)]">
                Step <span className="serif-it text-gold">inside</span>
              </h2>
            </div>
            <div className="pointer-events-auto hidden shrink-0 text-right md:block">
              <p className="label text-mist/60">Scroll to travel</p>
              <p className="num mt-2 text-3xl text-gold">{String(stop + 1).padStart(2, "0")}</p>
              <p className="label text-mist/40">/ 0{stops.length}</p>
            </div>
          </div>

          {/* progress rail */}
          <div className="pointer-events-none absolute left-[var(--gut)] top-1/2 z-20 hidden h-44 w-px -translate-y-1/2 bg-ivory/20 md:block">
            <div ref={rail} className="h-full w-px origin-top bg-gold" style={{ transform: "scaleY(0)" }} />
          </div>

          {/* dusk / night toggle */}
          <button
            type="button"
            onClick={() => setDusk(!dusk)}
            aria-pressed={!dusk}
            className="absolute right-[var(--gut)] top-1/2 z-30 flex h-11 -translate-y-1/2 items-center gap-2 rounded-full border border-line bg-obsidian/60 px-4 backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
          >
            {dusk ? <IconSun className="h-4 w-4 text-gold" /> : <IconMoon className="h-4 w-4 text-gold" />}
            <span className="label">{dusk ? "Night" : "Dusk"}</span>
          </button>

          {/* annotation */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-[var(--gut)] pb-[calc(2rem+var(--safe-b))] sm:pb-12">
            <div
              key={stop}
              className="pointer-events-auto mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-line bg-obsidian/72 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6 sm:p-5"
              style={{ animation: "annot-in .7s cubic-bezier(.16,1,.3,1) both" }}
            >
              <div className="min-w-0 flex-1">
                <p className="label text-gold">{active.label}</p>
                <h3 className="display mt-2 text-[clamp(1.3rem,3vw,2rem)] leading-tight text-ivory">{active.title}</h3>
                <p className="mt-1 text-xs text-mist">{active.meta}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-2 sm:flex">
                  <span className="num text-[0.7rem] text-mist">
                    {String(stop + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}
                  </span>
                </span>
                <Link
                  to={`/properties/${active.slug}`}
                  className="pill !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian !border-transparent"
                >
                  {t.cta.details} <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <p className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2 text-[0.58rem] uppercase tracking-[0.2em] text-mist/50 md:hidden">
            Swipe / scroll to move between rooms
          </p>
        </div>
      )}

      <style>{`@keyframes annot-in{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
