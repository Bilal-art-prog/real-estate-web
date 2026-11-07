import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Property } from "../../data/properties";
import { siteConfig } from "../../lib/siteConfig";
import { useStore } from "../../store/useStore";
import {
  buildWhatsAppLink,
  cn,
  formatPKR,
  sqftToMarla,
  trackWhatsAppClick,
  waMessages,
} from "../../lib/utils";
import { IconArea, IconBath, IconBed, IconCheck, IconHeart, IconPin, IconWhatsApp } from "./Icons";
import { Counter } from "./Reveal";

/**
 * Listing card. `tilt` gives a pointer-tracked 3D lift on the inner shell
 * (framer-motion owns the outer transform, so the two never conflict).
 */
export default function PropertyCard({
  p,
  tilt = true,
  carousel = false,
  index = 0,
  compact = false,
}: {
  p: Property;
  tilt?: boolean;
  carousel?: boolean;
  index?: number;
  compact?: boolean;
}) {
  const card = useRef<HTMLDivElement | null>(null);
  const saved = useStore((s) => s.saved);
  const toggleSave = useStore((s) => s.toggleSave);
  const pushToast = useStore((s) => s.pushToast);
  const [hover, setHover] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const isSaved = saved.includes(p.slug);

  useEffect(() => {
    const el = card.current;
    if (!el || !tilt || window.matchMedia("(hover: none)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-ny * 6).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(nx * 8).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(nx * 100 + 50).toFixed(1)}%`);
      el.style.setProperty("--my", `${(ny * 100 + 50).toFixed(1)}%`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [tilt]);

  const waHref = buildWhatsAppLink({
    message: waMessages.property({
      title: p.title,
      location: `${p.society}, ${p.city}`,
      priceLabel: formatPKR(p.price, { monthly: !!p.monthly }),
      slug: p.slug,
    }),
  });

  const unit = p.monthly ? 100_000 : 10_000_000;
  const v = p.price / unit;
  const decimals = Number.isInteger(v) ? 0 : Number.isInteger(v * 10) ? 1 : 2;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, delay: carousel ? 0 : Math.min(index * 0.07, 0.4), ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className={cn("group relative shrink-0", compact ? "w-full" : "w-[min(86vw,26rem)]", carousel && "snap-center")}
    >
      <div
        ref={card}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-line bg-graphite text-ivory transition-[border-color,box-shadow] duration-700 hover:border-gold/55 hover:shadow-[0_44px_100px_-46px_rgba(201,169,110,0.5)]"
        style={{
          transform: tilt ? "perspective(1200px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" : undefined,
          transformStyle: "preserve-3d",
          transition: "transform .5s cubic-bezier(.16,1,.3,1), border-color .7s, box-shadow .7s",
        }}
      >
        {/* photograph */}
        <div className={cn("relative overflow-hidden", compact ? "aspect-[16/11]" : "aspect-[4/5]")}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(140deg,#0E3B30,#121917 45%,#0A0D0C)" }} aria-hidden="true" />
          {!imgFailed && (
            <img
              src={p.poster}
              alt={`${p.title}, ${p.society}, ${p.city}`}
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
              className="relative h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{ background: "radial-gradient(45% 45% at var(--mx,50%) var(--my,50%), rgba(227,207,161,0.26), transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-graphite via-graphite/45 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="pill !min-h-7 !bg-obsidian/75 !px-3 !py-1 !text-[0.52rem] backdrop-blur-md">
              {p.purpose === "rent" ? "For rent" : p.purpose === "plot" ? "Plot" : p.purpose === "commercial" ? "Commercial" : "For sale"}
            </span>
            {p.visualStatus === "verified" ? (
              <span className="pill !min-h-7 !border-emerald/60 !bg-emerald/25 !px-3 !py-1 !text-[0.52rem] !text-gold backdrop-blur-md">
                <IconCheck className="h-3 w-3" /> {siteConfig.legal.verifiedBadgeLabel}
              </span>
            ) : (
              <span className="pill !min-h-7 !px-3 !py-1 !text-[0.52rem] !text-mist backdrop-blur-md">Concept</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              toggleSave(p.slug);
              pushToast(isSaved ? `Removed ${p.title} from saved` : `Saved ${p.title}`);
            }}
            aria-label={isSaved ? `Remove ${p.title} from saved` : `Save ${p.title}`}
            aria-pressed={isSaved}
            className={cn(
              "absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border backdrop-blur-md transition-all duration-500",
              isSaved ? "border-gold bg-gold/25 text-gold" : "border-line bg-obsidian/45 text-ivory hover:border-gold hover:text-gold",
            )}
          >
            <IconHeart filled={isSaved} className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="label flex items-center gap-1.5 text-mist">
                <IconPin className="h-3 w-3 text-gold" /> {p.society}
              </p>
              <h3 className="display mt-1.5 truncate text-[clamp(1.5rem,3vw,2.1rem)] leading-none">{p.title}</h3>
            </div>
            <p className="num shrink-0 text-right text-lg text-gold sm:text-xl">
              <Counter to={v} decimals={decimals} duration={hover ? 900 : 1800} />
              <span className="ml-1 text-[0.58rem] uppercase tracking-[0.14em] text-mist">
                {p.monthly ? "Lakh/mo" : "Crore"}
              </span>
            </p>
          </div>
        </div>

        {/* body */}
        <div className="relative flex flex-1 flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] text-mist">
            {p.beds > 0 && (
              <span className="flex items-center gap-1.5">
                <IconBed className="h-4 w-4 text-gold/85" /> {p.beds} bed
              </span>
            )}
            {p.baths > 0 && (
              <span className="flex items-center gap-1.5">
                <IconBath className="h-4 w-4 text-gold/85" /> {p.baths} bath
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <IconArea className="h-4 w-4 text-gold/85" /> {p.area.toLocaleString()} sq ft
            </span>
            <span className="ml-auto rounded-full border border-line px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.12em]">
              {p.marla} marla
            </span>
          </div>

          {!compact && (
            <p className="line-clamp-2 text-[0.82rem] leading-relaxed text-mist/85">
              <span className="text-gold">{p.signature}.</span> {p.description}
            </p>
          )}
          {compact && <p className="line-clamp-1 text-[0.78rem] text-gold/90">{p.signature}</p>}

          <div className="mt-auto flex items-center gap-2 pt-1">
            <Link
              to={`/properties/${p.slug}`}
              className="pill flex-1 !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !border-transparent !text-obsidian hover:!opacity-90"
            >
              View details
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-wa={`card_${p.id}`}
              onClick={() => trackWhatsAppClick({ placement: "property_card", propertyId: p.id, propertyTitle: p.title })}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-wa/45 text-wa transition-colors hover:bg-wa hover:text-obsidian"
              aria-label={`Ask about ${p.title} on WhatsApp`}
            >
              <IconWhatsApp className="h-4 w-4" />
            </a>
          </div>

          <p className="label text-mist/60">
            {p.status} · {sqftToMarla(p.area)} marla covered · {p.parking ? `${p.parking} parking` : "—"}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
