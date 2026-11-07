import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { owner, site } from "../data/content";
import { bySlug, listingJsonLd, properties, similar } from "../data/properties";
import { images } from "../lib/images";
import { siteConfig } from "../lib/siteConfig";
import { useStore } from "../store/useStore";
import { saveLead } from "../lib/leads";
import PropertyCard from "../components/ui/PropertyCard";
import OwnerPortrait from "../components/ui/OwnerPortrait";
import Canvas3D from "../components/three/Canvas3D";
import { Button, Counter, Eyebrow, SplitLines } from "../components/ui/Reveal";
import {
  IconArea,
  IconArrowRight,
  IconBath,
  IconBed,
  IconCalendar,
  IconCheck,
  IconClose,
  IconHeart,
  IconPhone,
  IconPin,
  IconWhatsApp,
} from "../components/ui/Icons";
import {
  areaBreakdown,
  buildWhatsAppLink,
  cn,
  formatNumber,
  formatPKR,
  sqftToMarla,
  trackWhatsAppClick,
  waMessages,
} from "../lib/utils";
import { usePrefersReducedMotion } from "../hooks/useDevice";
import NotFound from "./NotFound";

const Emblem = lazy(() => import("../components/three/Emblem"));

export default function PropertyDetail() {
  const { slug } = useParams();
  const property = bySlug(slug);
  const openBooking = useStore((s) => s.openBooking);
  const saved = useStore((s) => s.saved);
  const toggleSave = useStore((s) => s.toggleSave);
  const pushToast = useStore((s) => s.pushToast);
  const webgl = useStore((s) => s.webgl);
  const reduced = usePrefersReducedMotion();

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [bar, setBar] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  const waHref = property
    ? buildWhatsAppLink({
        message: waMessages.property({
          title: property.title,
          location: `${property.society}, ${property.city}`,
          priceLabel: formatPKR(property.price, { monthly: !!property.monthly }),
          slug: property.slug,
        }),
      })
    : "#";

  useEffect(() => {
    if (!property) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.text = JSON.stringify(listingJsonLd(property));
    document.head.appendChild(el);
    document.title = `${property.title} — ${property.society}, ${property.city} | ${site.name}`;
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, [property]);

  useEffect(() => {
    const onScroll = () => setBar(window.scrollY > 380);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null || !property) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => ((i ?? 0) + 1) % property.images.length);
      if (e.key === "ArrowLeft") setLightbox((i) => ((i ?? 0) - 1 + property.images.length) % property.images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, property]);

  /* pointer parallax on the hero photograph */
  useEffect(() => {
    const el = heroRef.current;
    if (!el || reduced) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--tx", `${(-nx * 16).toFixed(2)}px`);
      el.style.setProperty("--ty", `${(-ny * 10).toFixed(2)}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, property]);

  if (!property) return <NotFound />;

  const isSaved = saved.includes(property.slug);
  const related = similar(property, 3);
  const pricePerSqft = property.price / Math.max(1, property.area);

  return (
    <main className="relative bg-obsidian pb-28 pt-20 text-ivory sm:pt-24">
      {/* ── photoreal hero ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-[62svh] min-h-[380px] w-full overflow-hidden sm:h-[78svh]"
        style={{ ["--tx" as any]: "0px", ["--ty" as any]: "0px" }}
      >
        <img
          src={property.poster}
          alt={`${property.title}, ${property.society}, ${property.city}`}
          className="absolute inset-0 h-full w-full object-cover ken"
          style={{ transform: "translate3d(var(--tx), var(--ty), 0) scale(1.06)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,13,12,0.96) 4%, rgba(10,13,12,0.25) 46%, rgba(10,13,12,0.62) 100%)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 px-[var(--gut)] pb-8">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <Eyebrow>
                {property.sector}, {property.society} · {property.city}
              </Eyebrow>
              <SplitLines
                as="h1"
                className="display mt-4 text-[clamp(2.4rem,7.5vw,6rem)] leading-[0.86]"
                lines={[<span key="1">{property.title}</span>]}
              />
              <p className="serif-it mt-3 text-[clamp(1rem,2.2vw,1.5rem)] text-gold-soft">{property.style}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="pill !min-h-8 !px-3 !py-1 !text-[0.55rem]">{property.status}</span>
                <span className="pill !min-h-8 !px-3 !py-1 !text-[0.55rem]">{property.type}</span>
                <span className="pill !min-h-8 !px-3 !py-1 !text-[0.55rem]">Ref {property.id.toUpperCase()}</span>
                {property.visualStatus === "verified" ? (
                  <span className="pill !min-h-8 !border-emerald !bg-emerald/20 !px-3 !py-1 !text-[0.55rem] !text-gold">
                    <IconCheck className="h-3 w-3" /> {siteConfig.legal.verifiedBadgeLabel}
                  </span>
                ) : (
                  <span className="pill !min-h-8 !px-3 !py-1 !text-[0.55rem] !text-mist">Concept rendering</span>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="label text-mist/70">{property.monthly ? "Monthly rent" : "Asking price"}</p>
              <p className="display gold-sheen mt-2 text-[clamp(1.9rem,4.6vw,3.4rem)] leading-none">
                {formatPKR(property.price, { monthly: !!property.monthly })}
              </p>
              <p className="num mt-2 text-xs text-mist/70">
                PKR {formatNumber(property.price)} · {formatNumber(pricePerSqft)}/sq ft
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── facts + owner ─────────────────────────────────────────── */}
      <section className="relative mx-auto mt-10 max-w-[1600px] px-[var(--gut)]">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="glass rounded-[1.4rem] p-6 sm:p-8">
            <Eyebrow>The numbers</Eyebrow>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { k: "Covered", v: `${formatNumber(property.area)} sq ft`, icon: <IconArea className="h-4 w-4" /> },
                { k: "Plot", v: `${property.marla} marla`, icon: <IconPin className="h-4 w-4" /> },
                { k: "Bedrooms", v: property.beds ? String(property.beds) : "—", icon: <IconBed className="h-4 w-4" /> },
                { k: "Bathrooms", v: property.baths ? String(property.baths) : "—", icon: <IconBath className="h-4 w-4" /> },
                { k: "Parking", v: property.parking ? String(property.parking) : "—", icon: <IconCheck className="h-4 w-4" /> },
                { k: "Built", v: String(property.year), icon: <IconCalendar className="h-4 w-4" /> },
              ].map((row) => (
                <div key={row.k} className="rounded-xl border border-line bg-obsidian/40 p-4">
                  <dt className="label flex items-center gap-1.5 text-mist/70">
                    <span className="text-gold">{row.icon}</span>
                    {row.k}
                  </dt>
                  <dd className="num mt-2 text-lg text-ivory">{row.v}</dd>
                </div>
              ))}
            </dl>

            <h2 className="label mt-8 text-gold">Unit converter</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {areaBreakdown(property.area).map((u) => (
                <div key={u.unit} className="rounded-lg border border-line px-3 py-2 text-center">
                  <p className="num text-base text-ivory">
                    {u.value >= 100 ? Math.round(u.value).toLocaleString("en-PK") : Math.round(u.value * 100) / 100}
                  </p>
                  <p className="label mt-1 text-mist/60">{u.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[0.68rem] text-mist/50">
              Plot: {formatNumber(property.plotArea)} sq ft · 1 marla = 272.25 sq ft · 1 kanal = 20 marla
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass flex items-center gap-4 rounded-[1.4rem] p-5">
              <OwnerPortrait size="md" caption />
              <div className="min-w-0">
                <p className="label text-gold">{owner.role}</p>
                <h3 className="display mt-1 truncate text-2xl leading-none">{owner.name}</h3>
                <p className="mt-1 text-xs text-mist">{owner.languages.join(" · ")}</p>
              </div>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-wa={`detail_${property.id}`}
              onClick={() =>
                trackWhatsAppClick({ placement: "detail_primary", propertyId: property.id, propertyTitle: property.title })
              }
              className="pill !min-h-14 !w-full !justify-center !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
            >
              <IconWhatsApp className="h-5 w-5" /> Ask on WhatsApp
            </a>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" size="lg" onClick={() => openBooking(property, owner.name)}>
                Request viewing
              </Button>
              <a
                href={`tel:${site.phoneTel}`}
                onClick={() => useStore.getState().pushToast("Calling " + site.phoneDisplay)}
                className="pill !min-h-12 !justify-center"
              >
                <IconPhone className="h-4 w-4" /> Call now
              </a>
              <Button
                variant="outline"
                onClick={() => {
                  toggleSave(property.slug);
                  pushToast(isSaved ? "Removed from saved" : "Saved to your shortlist");
                }}
                icon={<IconHeart filled={isSaved} className="h-4 w-4" />}
              >
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" href={`mailto:${site.email}?subject=${encodeURIComponent(property.title)}`}>
                Email
              </Button>
            </div>

            <p className="text-[0.68rem] leading-relaxed text-mist/60">{site.visualsNote}</p>
          </div>
        </div>
      </section>

      {/* ── sticky info bar ───────────────────────────────────────── */}
      <AnimatePresence>
        {bar && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[75] border-t border-line bg-obsidian/94 backdrop-blur-xl"
            style={{ paddingBottom: "var(--safe-b)" }}
          >
            <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-[var(--gut)] py-3">
              <div className="hidden min-w-0 sm:block">
                <p className="display truncate text-lg leading-none">{property.title}</p>
                <p className="label mt-1 truncate text-mist/70">
                  {property.society} · {property.beds || "—"} bed · {formatNumber(property.area)} sq ft · {sqftToMarla(property.area)} marla
                </p>
              </div>
              <p className="num ml-auto shrink-0 text-lg text-gold">
                {formatPKR(property.price, { monthly: !!property.monthly })}
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-wa="detail_sticky"
                onClick={() => trackWhatsAppClick({ placement: "detail_sticky", propertyId: property.id, propertyTitle: property.title })}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wa text-obsidian"
                aria-label="Ask about this property on WhatsApp"
              >
                <IconWhatsApp className="h-5 w-5" />
              </a>
              <a href={`tel:${site.phoneTel}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line" aria-label="Call now">
                <IconPhone className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => openBooking(property, owner.name)}
                className="pill !min-h-11 shrink-0 !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian !border-transparent"
              >
                Book viewing
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── body ──────────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 grid max-w-[1600px] gap-12 px-[var(--gut)] lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Eyebrow>The house</Eyebrow>
          <p className="serif-it mt-6 text-[clamp(1.2rem,2.6vw,1.85rem)] leading-snug text-ivory/90">
            {property.description}
          </p>
          <p className="mt-4 text-sm text-mist">
            <span className="label text-gold">Signature feature — </span>
            {property.signature}
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {property.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 rounded-xl border border-line bg-graphite/60 p-4 text-sm text-mist">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {h}
              </li>
            ))}
          </ul>

          <h2 className="display mt-14 text-4xl">Materials & amenities</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {property.materials.filter((m) => m !== "—").map((m) => (
              <span key={m} className="rounded-full border border-gold/45 bg-gold/10 px-4 py-2 text-[0.72rem] text-gold">
                {m}
              </span>
            ))}
            {property.amenities.map((a) => (
              <span key={a} className="rounded-full border border-line px-4 py-2 text-[0.72rem] text-mist">
                {a}
              </span>
            ))}
          </div>

          <h2 className="display mt-14 text-4xl">Floor plan</h2>
          <div className="mt-5 overflow-hidden rounded-[1.3rem] border border-line bg-graphite">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
              <span className="label text-mist/70">
                {property.floorplan.length} levels · {formatNumber(property.area)} sq ft covered
              </span>
              <label className="flex items-center gap-3">
                <span className="label text-mist/70">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={2.4}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-28"
                  aria-label="Floor plan zoom"
                />
                <span className="num text-xs text-gold">{zoom.toFixed(2)}×</span>
              </label>
            </div>
            <div className="overflow-auto p-5 no-scrollbar" data-lenis-prevent>
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform .3s" }}>
                <FloorPlan levels={property.floorplan} />
              </div>
            </div>
          </div>

          <h2 className="display mt-14 text-4xl">Gallery</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {property.images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setLightbox(i)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-line transition-colors hover:border-gold/60",
                  i === 0 && "sm:col-span-2 sm:row-span-2",
                )}
                aria-label={`Enlarge image ${i + 1} of ${property.images.length}`}
              >
                <img
                  src={src}
                  alt={`${property.title} — view ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={cn("w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105", i === 0 ? "aspect-[16/11]" : "aspect-[4/3]")}
                />
                <span className="absolute inset-0 bg-obsidian/0 transition-colors duration-500 group-hover:bg-obsidian/15" />
              </button>
            ))}
          </div>

          <h2 className="display mt-14 text-4xl">Location</h2>
          <LocationPlate lat={property.coordinates.lat} lng={property.coordinates.lng} />

          <Calculator price={property.price} monthly={!!property.monthly} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-[1.4rem] p-6">
            <Eyebrow>Why this one</Eyebrow>
            <ul className="mt-5 space-y-3 text-sm text-mist">
              {[
                `File and title documents checked before listing`,
                property.possession === "Immediate" || property.possession === "Ready"
                  ? "Ready possession"
                  : `Possession ${property.possession}`,
                property.furnished ? "Sold furnished — move straight in" : "Unfurnished, ready to fit out",
                `${sqftToMarla(property.area)} marla covered on ${formatNumber(property.plotArea)} sq ft plot`,
                "Overseas buyers: power-of-attorney guidance included",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass relative overflow-hidden rounded-[1.4rem]">
            <div className="relative h-40">
              {webgl && !reduced ? (
                <Canvas3D poster="radial-gradient(circle at 50% 45%, rgba(201,169,110,0.2), transparent 65%)" posterLabel="Emblem" camera={{ position: [0, 0, 5.2], fov: 34 }} exposure={1.1} shadows={false}>
                  <Suspense fallback={null}>
                    <Emblem />
                  </Suspense>
                </Canvas3D>
              ) : (
                <img src={images.marbleWall} alt="" className="h-full w-full object-cover opacity-60" loading="lazy" />
              )}
            </div>
            <div className="p-6 pt-4">
              <Eyebrow>Walk it first</Eyebrow>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                Ask for the full photograph set, the measured floor plan and a live video walkthrough — sent the same
                day, wherever you are.
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-wa="detail_sidebar"
                onClick={() => trackWhatsAppClick({ placement: "detail_sidebar", propertyId: property.id, propertyTitle: property.title })}
                className="pill mt-5 !w-full !justify-center !bg-wa !border-transparent !text-obsidian"
              >
                <IconWhatsApp className="h-4 w-4" /> Request the walkthrough
              </a>
            </div>
          </div>

          <EnquiryCard propertyId={property.id} propertyTitle={property.title} waHref={waHref} />
        </aside>
      </section>

      <section className="mx-auto mt-20 max-w-[1600px] px-[var(--gut)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Similar stock</Eyebrow>
            <h2 className="display mt-4 text-[clamp(1.9rem,4.4vw,3.2rem)] leading-none">You may also want to see</h2>
          </div>
          <Link to="/properties" className="pill">
            All {properties.length} listings <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((p, i) => (
            <PropertyCard key={p.id} p={p} index={i} compact />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex flex-col bg-obsidian/97 p-4 backdrop-blur-lg sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery"
          >
            <div className="flex items-center justify-between">
              <p className="label text-mist/70">
                {String(lightbox + 1).padStart(2, "0")} / {String(property.images.length).padStart(2, "0")} — {property.title}
              </p>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-gold hover:text-gold"
                aria-label="Close gallery"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden">
              <motion.img
                key={lightbox}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={property.images[lightbox]}
                alt={`${property.title} image ${lightbox + 1}`}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
              <button
                type="button"
                onClick={() => setLightbox((i) => ((i ?? 0) + 1) % property.images.length)}
                className="absolute right-2 grid h-12 w-12 place-items-center rounded-full border border-line bg-obsidian/70 hover:border-gold"
                aria-label="Next image"
              >
                <IconArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightbox((i) => ((i ?? 0) - 1 + property.images.length) % property.images.length)}
                className="absolute left-2 grid h-12 w-12 place-items-center rounded-full border border-line bg-obsidian/70 hover:border-gold"
                aria-label="Previous image"
              >
                <IconArrowRight className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/** Inline enquiry → saved locally, then a real anchor continues on WhatsApp. */
function EnquiryCard({ propertyId, propertyTitle, waHref }: { propertyId: string; propertyTitle: string; waHref: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const href =
    state === "saved"
      ? buildWhatsAppLink({
          message: waMessages.lead({ name, phone, message: msg, propertyTitle }),
        })
      : waHref;

  return (
    <form
      className="glass rounded-[1.4rem] p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const res = saveLead({
          name,
          phone,
          message: msg || undefined,
          propertyId,
          propertyTitle,
          source: "property_detail",
          interest: "Buy / enquire",
        });
        if (!res.ok) {
          setState("error");
          setError(res.error ?? "Could not save.");
          return;
        }
        setState("saved");
        setError(null);
      }}
    >
      <Eyebrow>Quick enquiry</Eyebrow>
      <label className="mt-4 block">
        <span className="label text-mist/70">Name</span>
        <input required className="field mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </label>
      <label className="mt-3 block">
        <span className="label text-mist/70">Phone / WhatsApp</span>
        <input required type="tel" className="field mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx xxxxxxx" />
      </label>
      <label className="mt-3 block">
        <span className="label text-mist/70">Message</span>
        <textarea rows={3} className="field mt-1.5 resize-none" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="When can I view it?" />
      </label>
      {error && (
        <p className="mt-3 text-xs text-alert" role="alert">
          {error}
        </p>
      )}
      {state === "saved" ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-wa={`enquiry_${propertyId}`}
          onClick={() => trackWhatsAppClick({ placement: "detail_enquiry", propertyId, propertyTitle })}
          className="pill mt-4 !w-full !justify-center !bg-wa !border-transparent !text-obsidian"
        >
          <IconWhatsApp className="h-4 w-4" /> Continue on WhatsApp
        </a>
      ) : (
        <button type="submit" className="pill mt-4 !w-full !justify-center !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian !border-transparent">
          Save & continue
        </button>
      )}
    </form>
  );
}

function FloorPlan({ levels }: { levels: { level: string; rooms: string; area: number }[] }) {
  const total = levels.reduce((s, l) => s + l.area, 0) || 1;
  return (
    <div className="flex min-w-[46rem] flex-col gap-4">
      {levels.map((l) => {
        const rooms = l.rooms.split("·").map((r) => r.trim()).filter(Boolean);
        return (
          <div key={l.level}>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="label text-mist/70">{l.level}</p>
              <p className="num text-xs text-gold">
                {formatNumber(l.area)} sq ft · {Math.round((l.area / total) * 100)}%
              </p>
            </div>
            <div className="flex h-24 gap-1 overflow-hidden rounded-lg border-2 border-gold/50 bg-obsidian">
              {rooms.map((r, i) => (
                <div
                  key={r + i}
                  className="relative flex items-center justify-center border-r border-dashed border-line px-2 text-center last:border-0"
                  style={{ flex: `${Math.max(1, r.length * 0.9 + 2)} 1 0%`, background: i % 2 ? "rgba(23,98,79,0.22)" : "transparent" }}
                >
                  <span className="text-[0.62rem] leading-tight text-mist">{r}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LocationPlate({ lat, lng }: { lat: number; lng: number }) {
  const b = siteConfig.map.bounds;
  const here = { x: ((lng - b.west) / (b.east - b.west)) * 100, y: ((b.north - lat) / (b.north - b.south)) * 100 };
  return (
    <div className="mt-5 overflow-hidden rounded-[1.3rem] border border-line">
      <div className="relative h-64 bg-graphite">
        <img src={images.aerial} alt="" className="h-full w-full object-cover opacity-45" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,13,12,0.75), rgba(10,13,12,0.9))" }} />
        <span className="pulse-ring absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold text-gold" style={{ left: `${Math.max(4, Math.min(96, here.x))}%`, top: `${Math.max(6, Math.min(94, here.y))}%` }} />
        {properties
          .filter((p) => Math.abs(p.coordinates.lat - lat) > 0.0001 || Math.abs(p.coordinates.lng - lng) > 0.0001)
          .map((p) => (
            <Link
              key={p.id}
              to={`/properties/${p.slug}`}
              title={p.title}
              aria-label={p.title}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory/35 transition-colors hover:bg-gold"
              style={{
                left: `${Math.max(2, Math.min(98, ((p.coordinates.lng - b.west) / (b.east - b.west)) * 100))}%`,
                top: `${Math.max(4, Math.min(96, ((b.north - p.coordinates.lat) / (b.north - b.south)) * 100))}%`,
              }}
            />
          ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-graphite p-5">
        <div>
          <p className="label text-mist/70">Coordinates</p>
          <p className="num mt-1 text-sm text-ivory">
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pill"
        >
          Open in Google Maps <IconArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function Calculator({ price, monthly }: { price: number; monthly: boolean }) {
  const [down, setDown] = useState(35);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(15.5);

  const loan = price * (1 - down / 100);
  const r = rate / 100 / 12;
  const n = years * 12;
  const payment = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  const total = payment * n;

  return (
    <div className="mt-14">
      <h2 className="display text-4xl">{monthly ? "Rental summary" : "Mortgage & instalments"}</h2>
      <div className="mt-5 grid gap-6 rounded-[1.4rem] border border-line bg-graphite p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <Slider label="Down payment" value={down} min={10} max={80} step={5} set={setDown} display={`${down}%`} note={formatPKR((price * down) / 100)} />
          <Slider label="Tenure" value={years} min={3} max={25} step={1} set={setYears} display={`${years} years`} note={`${years * 12} instalments`} />
          <Slider label="Indicative rate" value={rate} min={6} max={24} step={0.5} set={setRate} display={`${rate.toFixed(1)}%`} note="edit — do not publish as a fact" />
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-line bg-obsidian p-6 text-center">
          <p className="label text-mist/70">Estimated monthly</p>
          <p className="display gold-sheen mt-3 text-[clamp(2rem,5vw,3.2rem)] leading-none">PKR {formatNumber(payment)}</p>
          <dl className="mt-6 space-y-2 text-left text-sm">
            <Row k="Loan amount" v={formatPKR(loan)} />
            <Row k="Total payable" v={formatPKR(total)} />
            <Row k="Interest component" v={formatPKR(Math.max(0, total - loan))} alert />
          </dl>
          <p className="mt-5 text-[0.68rem] leading-relaxed text-mist/60">
            Illustrative only. Pakistani banks generally finance up to 65–70% of assessed value, and rates move with
            KIBOR. Confirm current terms with your bank before relying on this figure.
            {monthly ? " For rentals we typically ask for two months' security plus one month advance." : ""}
          </p>
          <a
            href={buildWhatsAppLink({
              message: `Assalam o Alaikum, please help me with a mortgage / instalment plan for a ${formatPKR(price)} property.`,
            })}
            target="_blank"
            rel="noopener noreferrer"
            data-wa="calculator"
            onClick={() => trackWhatsAppClick({ placement: "calculator" })}
            className="pill mt-5 !justify-center"
          >
            <IconWhatsApp className="h-3.5 w-3.5" /> Ask about financing
          </a>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  set,
  display,
  note,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  set: (v: number) => void;
  display: string;
  note: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="label text-mist/70">{label}</span>
        <span className="num text-gold">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-3" aria-label={label} />
      <span className="mt-1 block text-[0.68rem] text-mist/60">{note}</span>
    </label>
  );
}

function Row({ k, v, alert }: { k: string; v: string; alert?: boolean }) {
  return (
    <div className="flex justify-between border-b border-line pb-2 last:border-0">
      <dt className="text-mist/70">{k}</dt>
      <dd className={cn("num", alert ? "text-alert" : "text-ivory")}>{v}</dd>
    </div>
  );
}

export const detailCounter = Counter;
