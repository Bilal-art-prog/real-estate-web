import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { properties, type Property } from "../../data/properties";
import { useStore } from "../../store/useStore";
import { Button, Eyebrow, SplitLines } from "../ui/Reveal";
import PropertyCard from "../ui/PropertyCard";
import { IconArrowRight, IconChevron } from "../ui/Icons";
import { cn, formatPKR } from "../../lib/utils";

export default function Featured() {
  const track = useRef<HTMLDivElement | null>(null);
  const openBooking = useStore((s) => s.openBooking);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const featured = properties.filter((p) => p.featured || p.premium).slice(0, 8);

  /* rotate each card toward the viewer based on distance from centre */
  const applyRotation = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const centre = el.getBoundingClientRect().left + el.scrollLeft + el.clientWidth / 2 - el.scrollLeft;
    const absCentre = el.getBoundingClientRect().left + el.clientWidth / 2;
    Array.from(el.children).forEach((child) => {
      const c = child as HTMLElement;
      const r = c.getBoundingClientRect();
      const d = (r.left + r.width / 2 - absCentre) / Math.max(1, el.clientWidth / 2);
      c.style.setProperty("--rot", `${(-d * 11).toFixed(2)}deg`);
      c.style.setProperty("--tz", `${(1 - Math.min(1, Math.abs(d))) * 40 - 26}px`);
      c.style.setProperty("--op", `${(0.55 + (1 - Math.min(1, Math.abs(d))) * 0.45).toFixed(3)}`);
    });
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft > el.scrollWidth - el.clientWidth - 8);
    void centre;
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyRotation);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    applyRotation();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [applyRotation, featured.length]);

  const nudge = (dir: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: "smooth" });
  };

  /* pointer-drag to scrub the rail */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      down = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const onUp = () => {
      down = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section id="featured" className="relative overflow-hidden bg-ink py-20 text-cream sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 0%, rgba(232,145,58,0.16), transparent 65%), radial-gradient(50% 45% at 0% 90%, rgba(200,161,91,0.13), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Chapter 03 — The portfolio</Eyebrow>
            <SplitLines
              className="display mt-5 text-[clamp(2.4rem,7vw,6rem)] leading-[0.86]"
              lines={[
                <span key="1">Houses that hold</span>,
                <span key="2" className="serif-it text-gold">their silence</span>,
              ]}
            />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/55">
              Eight of the {properties.length} listings we currently hold a mandate on. Every one is file-verified,
              photographed by our own studio and modelled in 3D so you can walk it from anywhere in the world.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={atStart}
              className="grid h-12 w-12 place-items-center rounded-full border border-cream/20 transition-all duration-500 hover:border-gold hover:text-gold disabled:opacity-25"
              aria-label="Previous properties"
            >
              <IconChevron className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={atEnd}
              className="grid h-12 w-12 place-items-center rounded-full border border-cream/20 transition-all duration-500 hover:border-gold hover:text-gold disabled:opacity-25"
              aria-label="Next properties"
            >
              <IconChevron className="h-4 w-4" />
            </button>
            <Button to="/properties" variant="outline" icon={<IconArrowRight className="h-4 w-4" />}>
              All {properties.length} listings
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={track}
        data-lenis-prevent
        className="no-scrollbar relative mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--gut)] pb-10 pt-6"
        style={{ perspective: "1600px", perspectiveOrigin: "50% 45%" }}
        role="list"
        aria-label="Featured properties carousel"
      >
        {featured.map((p, i) => (
          <div
            key={p.id}
            role="listitem"
            className="shrink-0 transition-[transform,opacity] duration-500 ease-out will-change-transform"
            style={{
              transform: "rotateY(var(--rot,0deg)) translateZ(var(--tz,0px))",
              opacity: "var(--op,1)",
              transformStyle: "preserve-3d",
            }}
          >
            <PropertyCard p={p} carousel index={i} />
          </div>
        ))}
        <div
          className="flex w-[min(80vw,22rem)] shrink-0 snap-center flex-col justify-center rounded-[1.4rem] border border-dashed border-cream/20 p-8 text-center"
          role="listitem"
        >
          <p className="label text-gold">Not on this list?</p>
          <h3 className="display mt-4 text-3xl leading-tight">We hold off-market stock</h3>
          <p className="mt-3 text-sm text-cream/55">
            Roughly a third of what we sell never reaches a website. Tell us the society and the budget.
          </p>
          <Button className="mt-6 self-center" variant="gold" onClick={() => openBooking(null)}>
            Request the private list
          </Button>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-[var(--gut)]">
        <p className="label text-cream/35">Drag · swipe · scroll sideways</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {featured.slice(0, 3).map((p) => (
            <Link key={p.id} to={`/properties/${p.slug}`} className="group flex items-baseline gap-2 text-sm text-cream/50 hover:text-gold">
              <span className="display text-xl text-cream transition-colors group-hover:text-gold">{p.title}</span>
              <span className="num text-gold/80">{formatPKR(p.price, { monthly: !!p.monthly })}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent")} />
    </section>
  );
}

export type { Property };
