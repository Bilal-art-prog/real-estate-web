import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { properties, type Property } from "../../data/properties";
import { nearby, purposeLabels, site } from "../../data/content";
import { images } from "../../lib/images";
import { siteConfig } from "../../lib/siteConfig";
import { useStore, type Purpose } from "../../store/useStore";
import { Eyebrow, SplitLines } from "../ui/Reveal";
import { IconArrowRight, IconPin, IconWhatsApp } from "../ui/Icons";
import { buildWhatsAppLink, formatPKR, trackWhatsAppClick, waMessages } from "../../lib/utils";

const chips: Purpose[] = ["all", "buy", "rent", "commercial", "plot"];
const { north, south, west, east } = siteConfig.map.bounds;

const project = (lat: number, lng: number) => ({
  x: ((lng - west) / (east - west)) * 100,
  y: ((north - lat) / (north - south)) * 100,
});

export default function MapSection({ embedded = false }: { embedded?: boolean }) {
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const hovered = useStore((s) => s.hovered);
  const setHovered = useStore((s) => s.setHovered);
  const drawer = useStore((s) => s.drawer);
  const setDrawer = useStore((s) => s.setDrawer);

  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [armed, setArmed] = useState(typeof window !== "undefined" && !("ontouchstart" in window));
  const stage = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ on: false, sx: 0, sy: 0, ox: 0, oy: 0, pinch: 0 });

  const hoveredProperty = properties.find((p) => p.slug === hovered) ?? null;
  const matches = (p: Property) => filters.purpose === "all" || p.purpose === filters.purpose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDrawer]);

  /* pan + zoom (wheel/pinch/drag). Never traps vertical page scroll until armed. */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!armed) return;
      e.preventDefault();
      setView((v) => ({ ...v, s: Math.min(3.4, Math.max(1, v.s - e.deltaY * 0.0016)) }));
    };
    const onDown = (e: PointerEvent) => {
      if (!armed || e.pointerType === "touch") return;
      drag.current = { ...drag.current, on: true, sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.on) return;
      const lim = 120 * (view.s - 1) + 40;
      setView((v) => ({
        ...v,
        x: Math.max(-lim, Math.min(lim, drag.current.ox + (e.clientX - drag.current.sx))),
        y: Math.max(-lim, Math.min(lim, drag.current.oy + (e.clientY - drag.current.sy))),
      }));
    };
    const onUp = () => {
      drag.current.on = false;
    };
    const onTouch = (e: TouchEvent) => {
      if (!armed) return;
      if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        if (drag.current.pinch) {
          const delta = d - drag.current.pinch;
          setView((v) => ({ ...v, s: Math.min(3.4, Math.max(1, v.s + delta * 0.004)) }));
        }
        drag.current.pinch = d;
        e.preventDefault();
      } else drag.current.pinch = 0;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("touchmove", onTouch, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("touchmove", onTouch);
    };
  }, [armed, view.s, view.x, view.y]);

  const mapStage = (
    <div
      ref={stage}
      data-lenis-prevent={armed ? undefined : undefined}
      className="relative h-full w-full cursor-grab touch-pan-y overflow-hidden bg-obsidian active:cursor-grabbing"
      onPointerDown={() => !armed && setArmed(true)}
      role="application"
      aria-label="Interactive map of Bilal Estate listings across Islamabad and Rawalpindi"
    >
      <div
        className="absolute inset-0 origin-center will-change-transform"
        style={{
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
          transition: drag.current.on ? "none" : "transform .5s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* dark aerial plate */}
        <img
          src={images.aerial}
          alt="Aerial dusk photograph of a premium residential area in Islamabad with the Margalla Hills behind"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,13,12,0.72), rgba(10,13,12,0.35) 40%, rgba(10,13,12,0.82)), radial-gradient(80% 60% at 50% 45%, rgba(23,98,79,0.28), transparent 70%)",
            mixBlendMode: "multiply",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
          aria-hidden="true"
        />

        {/* pins */}
        {properties.map((p) => {
          const { x, y } = project(p.coordinates.lat, p.coordinates.lng);
          const dim = !matches(p);
          const on = hovered === p.slug;
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDrawer(p);
              }}
              onPointerEnter={() => setHovered(p.slug)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(p.slug)}
              onBlur={() => setHovered(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
              style={{ left: `${x}%`, top: `${y}%`, opacity: dim ? 0.22 : 1, zIndex: on ? 30 : 20 }}
              aria-label={`${p.title}, ${p.society} — ${formatPKR(p.price, { monthly: !!p.monthly })}`}
            >
              <span className="relative grid place-items-center">
                <span
                  className={`absolute h-7 w-7 rounded-full ${on ? "bg-gold/30" : "bg-gold/15"} ${dim ? "" : "animate-ping"}`}
                  style={{ animationDuration: "3.4s" }}
                  aria-hidden="true"
                />
                <span
                  className={`relative grid h-6 w-6 place-items-center rounded-full border transition-all duration-500 ${
                    on ? "scale-125 border-gold bg-gold text-obsidian" : "border-gold/70 bg-obsidian/85 text-gold"
                  }`}
                >
                  <IconPin className="h-3.5 w-3.5" />
                </span>
              </span>
            </button>
          );
        })}

        {/* amenity markers (indicative) */}
        {nearby.map((n) => (
          <span
            key={n.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[0.58rem] uppercase tracking-[0.18em] text-mist/70"
            style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
            title={n.label}
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-mist/70 align-middle" />
            {n.label}
          </span>
        ))}
      </div>

      {/* hover tooltip */}
      <AnimatePresence>
        {hoveredProperty && matches(hoveredProperty) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute left-1/2 top-4 z-40 w-[min(88vw,20rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-obsidian/92 backdrop-blur-xl"
          >
            <img src={hoveredProperty.poster} alt="" className="h-24 w-full object-cover" loading="lazy" />
            <div className="p-4">
              <p className="label text-gold">{hoveredProperty.society} · {hoveredProperty.city}</p>
              <p className="display mt-1.5 text-xl leading-tight text-ivory">{hoveredProperty.title}</p>
              <p className="num mt-1 text-sm text-mist">
                {formatPKR(hoveredProperty.price, { monthly: !!hoveredProperty.monthly })} · {hoveredProperty.area.toLocaleString()} sq ft
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!armed && (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="absolute inset-0 z-40 grid place-items-center bg-obsidian/45 backdrop-blur-[2px]"
        >
          <span className="pill !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian">
            Tap to explore the map
          </span>
        </button>
      )}

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-obsidian/75 px-4 py-2 backdrop-blur-md">
        <span className="label text-mist/70">{armed ? "Drag to pan · scroll to zoom" : "Two-finger drag to explore"}</span>
        <span className="num text-[0.65rem] text-gold">{view.s.toFixed(1)}×</span>
      </div>

      <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">
        {[
          { l: "+", d: 1, a: "Zoom in" },
          { l: "−", d: -1, a: "Zoom out" },
          { l: "⌂", d: 0, a: "Reset view" },
        ].map((b) => (
          <button
            key={b.l}
            type="button"
            aria-label={b.a}
            onClick={() =>
              setView((v) =>
                b.d === 0 ? { s: 1, x: 0, y: 0 } : { ...v, s: Math.min(3.4, Math.max(1, v.s + b.d * 0.45)) },
              )
            }
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-obsidian/80 text-lg text-ivory backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
          >
            {b.l}
          </button>
        ))}
      </div>
    </div>
  );

  if (embedded) return mapStage;

  return (
    <section
      id="neighbourhood"
      className="relative overflow-hidden bg-graphite py-20 text-ivory sm:py-24"
      aria-label="Neighbourhood map"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: "radial-gradient(70% 55% at 15% 0%, rgba(23,98,79,0.35), transparent 65%)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1600px] gap-10 px-[var(--gut)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <Eyebrow>{site.name} — {siteConfig.brand.city} & {siteConfig.brand.alsoServes}</Eyebrow>
          <SplitLines
            className="display mt-5 text-[clamp(2.2rem,5.6vw,4.6rem)] leading-[0.9]"
            lines={[
              <span key="1">A dark aerial of</span>,
              <span key="2" className="serif-it text-gold">everywhere we work</span>,
            ]}
          />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-mist">
            {properties.length} live mandates plotted on real Islamabad geography. Hover a gold pin for the price,
            tap it to open the file, and use the filters to isolate one kind of deal.
          </p>

          <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filter map by purpose">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter("purpose", c)}
                className="pill pill-dark"
                data-active={filters.purpose === c}
                aria-pressed={filters.purpose === c}
              >
                {purposeLabels[c]}
                <span className="num ml-1 text-[0.55rem] opacity-70">
                  {c === "all" ? properties.length : properties.filter((p) => p.purpose === c).length}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="label text-gold">Nearby (indicative travel times — {siteConfig.todo.officeAddress})</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {nearby.map((n) => (
                <li key={n.label} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-obsidian/45 px-4 py-3">
                  <span className="min-w-0">
                    <span className="label block text-mist/60">{n.type}</span>
                    <span className="mt-1 block truncate text-sm text-ivory">{n.label}</span>
                  </span>
                  <span className={n.time.startsWith("TODO") ? "todo num shrink-0 text-[0.7rem]" : "num shrink-0 text-[0.7rem] text-gold"}>
                    {n.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.68rem] text-mist">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> Live mandate</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-mist/60" /> Landmark</span>
            <a
              href={`https://www.google.com/maps/@${siteConfig.map.center.lat},${siteConfig.map.center.lng},11z`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto link-underline text-gold"
            >
              Open the real map
            </a>
          </div>
        </div>

        <div className="relative h-[62vh] min-h-[400px] overflow-hidden rounded-[1.5rem] border border-line bg-obsidian shadow-[0_60px_140px_-70px_rgba(0,0,0,1)] sm:h-[78vh]">
          {mapStage}
          <AnimatePresence>{drawer && <Drawer p={drawer} onClose={() => setDrawer(null)} />}</AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Drawer({ p, onClose }: { p: Property; onClose: () => void }) {
  const wa = buildWhatsAppLink({
    message: waMessages.property({
      title: p.title,
      location: `${p.society}, ${p.city}`,
      priceLabel: formatPKR(p.price, { monthly: !!p.monthly }),
      slug: p.slug,
    }),
  });

  return (
    <motion.aside
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-3 bottom-3 z-40 max-h-[86%] overflow-y-auto rounded-2xl border border-line bg-obsidian/94 p-5 backdrop-blur-xl sm:inset-x-auto sm:right-3 sm:top-3 sm:w-[22rem]"
      data-lenis-prevent
      role="dialog"
      aria-label={`${p.title} summary`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label flex items-center gap-1.5 text-gold">
            <IconPin className="h-3 w-3" /> {p.sector}, {p.society}
          </p>
          <h3 className="display mt-2 truncate text-3xl leading-none text-ivory">{p.title}</h3>
          <p className="mt-1.5 text-xs text-mist">{p.style}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ivory transition-colors hover:border-gold hover:text-gold"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl">
        <img src={p.poster} alt={p.title} loading="lazy" decoding="async" className="h-36 w-full object-cover" />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Price", formatPKR(p.price, { monthly: !!p.monthly, symbol: false })],
          ["Area", `${p.area.toLocaleString()} ft²`],
          ["Beds", p.beds ? `${p.beds} / ${p.baths}` : "—"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-line bg-emerald-deep/25 px-2 py-2">
            <dt className="label text-mist/70">{k}</dt>
            <dd className="num mt-1 text-sm text-ivory">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-mist">{p.description}</p>
      <p className="mt-3 text-[0.65rem] uppercase tracking-[0.16em] text-mist/50">{site.visualsNote}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={`/properties/${p.slug}`} className="pill pill-dark flex-1 !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian">
          Open full file <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          data-wa={`map_drawer_${p.id}`}
          onClick={() => trackWhatsAppClick({ placement: "map_drawer", propertyId: p.id, propertyTitle: p.title })}
          className="grid h-11 w-11 place-items-center rounded-full border border-wa/40 text-wa transition-colors hover:bg-wa hover:text-obsidian"
          aria-label={`Ask about ${p.title} on WhatsApp`}
        >
          <IconWhatsApp className="h-4 w-4" />
        </a>
      </div>
    </motion.aside>
  );
}
