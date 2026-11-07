import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { properties, propertyTypes, societies } from "../data/properties";
import { purposeLabels } from "../data/content";
import { defaultFilters, useStore, type Purpose, type SortKey } from "../store/useStore";
import PropertyCard from "../components/ui/PropertyCard";
import MapSection from "../components/sections/MapSection";
import { Button, Eyebrow, SplitLines } from "../components/ui/Reveal";
import { IconGrid, IconMap, IconSliders } from "../components/ui/Icons";
import { cn, formatPKR } from "../lib/utils";

const sorts: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured first" },
  { key: "price-desc", label: "Price · high to low" },
  { key: "price-asc", label: "Price · low to high" },
  { key: "area-desc", label: "Largest area" },
  { key: "newest", label: "Newest build" },
];

const purposes: Purpose[] = ["all", "buy", "rent", "commercial", "plot"];
const STEP = 5_000_000;

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const resetFilters = useStore((s) => s.resetFilters);
  const saved = useStore((s) => s.saved);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  const savedOnly = params.get("saved") === "1";
  const hydrated = useRef(false);

  /* URL → state on first paint / deep link */
  useEffect(() => {
    const next = { ...defaultFilters };
    const p = params.get("purpose");
    if (p && purposes.includes(p as Purpose)) next.purpose = p as Purpose;
    const t = params.get("type");
    if (t) next.type = t;
    const soc = params.get("society");
    if (soc) next.society = soc;
    const q = params.get("q");
    if (q) next.q = q;
    const sort = params.get("sort") as SortKey | null;
    if (sort) next.sort = sort;
    const min = Number(params.get("min"));
    const max = Number(params.get("max"));
    if (!Number.isNaN(min) && min > 0) next.min = min;
    if (!Number.isNaN(max) && max > 0) next.max = max;
    const beds = Number(params.get("beds"));
    if (!Number.isNaN(beds)) next.beds = beds;
    setFilter("purpose", next.purpose);
    setFilter("type", next.type);
    setFilter("society", next.society);
    setFilter("q", next.q);
    setFilter("sort", next.sort);
    setFilter("min", next.min);
    setFilter("max", next.max);
    setFilter("beds", next.beds);
    setFilter("baths", Number(params.get("baths")) || 0);
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* state → URL (skipped until the deep link has been read once) */
  useEffect(() => {
    if (!hydrated.current) return;
    const next = new URLSearchParams();
    if (filters.purpose !== "all") next.set("purpose", filters.purpose);
    if (filters.type !== "all") next.set("type", filters.type);
    if (filters.society !== "all") next.set("society", filters.society);
    if (filters.q) next.set("q", filters.q);
    if (filters.sort !== "featured") next.set("sort", filters.sort);
    if (filters.min > 0) next.set("min", String(filters.min));
    if (filters.max < defaultFilters.max) next.set("max", String(filters.max));
    if (filters.beds > 0) next.set("beds", String(filters.beds));
    if (filters.baths > 0) next.set("baths", String(filters.baths));
    if (savedOnly) next.set("saved", "1");
    setParams(next, { replace: true });
  }, [filters, savedOnly, setParams]);

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = properties.filter((p) => {
      if (savedOnly && !saved.includes(p.slug)) return false;
      if (filters.purpose !== "all" && p.purpose !== filters.purpose) return false;
      if (filters.type !== "all" && p.type !== filters.type) return false;
      if (filters.society !== "all" && p.society !== filters.society) return false;
      if (p.beds < filters.beds) return false;
      if (p.baths < filters.baths) return false;
      const normalised = p.monthly ? p.price * 240 : p.price;
      if (normalised < filters.min || normalised > filters.max) return false;
      if (q) {
        const hay = `${p.title} ${p.society} ${p.sector} ${p.city} ${p.type} ${p.amenities.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    switch (filters.sort) {
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "area-desc":
        list = [...list].sort((a, b) => b.area - a.area);
        break;
      case "newest":
        list = [...list].sort((a, b) => b.year - a.year);
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.premium) - Number(a.premium));
    }
    return list;
  }, [filters, saved, savedOnly]);

  const activeCount =
    (filters.purpose !== "all" ? 1 : 0) +
    (filters.type !== "all" ? 1 : 0) +
    (filters.society !== "all" ? 1 : 0) +
    (filters.q ? 1 : 0) +
    (filters.beds ? 1 : 0) +
    (filters.baths ? 1 : 0) +
    (filters.min > 0 ? 1 : 0) +
    (filters.max < defaultFilters.max ? 1 : 0) +
    (savedOnly ? 1 : 0);

  return (
    <main className="relative bg-ink pt-28 text-cream sm:pt-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[40vh]"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(232,145,58,0.16), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>The register</Eyebrow>
            <SplitLines
              as="h1"
              className="display mt-5 text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.86]"
              lines={[
                <span key="1">Every property</span>,
                <span key="2" className="serif-it text-gold">we hold a mandate on</span>,
              ]}
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/55">
            {properties.length} listings across Islamabad and Rawalpindi. Filter by purpose, society, budget and size —
            the URL updates so you can share a search.
          </p>
        </div>

        {/* ── filter bar ── */}
        <div className="glass sticky top-[4.6rem] z-40 mt-10 rounded-[1.2rem] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <IconSliders className="mr-1 h-4 w-4 text-gold" />
            {purposes.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilter("purpose", p)}
                className="pill !py-2 !text-[0.6rem]"
                data-active={filters.purpose === p}
                aria-pressed={filters.purpose === p}
              >
                {purposeLabels[p]}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setParams(savedOnly ? new URLSearchParams() : new URLSearchParams({ saved: "1" }), { replace: true })}
                className={cn("pill !py-2 !text-[0.6rem]", savedOnly && "!border-gold !text-gold")}
                aria-pressed={savedOnly}
              >
                Saved ({saved.length})
              </button>
              <div className="hidden h-8 w-px bg-cream/15 sm:block" />
              <div className="hidden overflow-hidden rounded-full border border-cream/15 sm:flex">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={cn("grid h-9 w-10 place-items-center transition-colors", view === "grid" ? "bg-cream text-ink" : "text-cream/60 hover:text-gold")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                >
                  <IconGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("map")}
                  className={cn("grid h-9 w-10 place-items-center transition-colors", view === "map" ? "bg-cream text-ink" : "text-cream/60 hover:text-gold")}
                  aria-label="Map view"
                  aria-pressed={view === "map"}
                >
                  <IconMap className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 border-t border-cream/10 pt-4 md:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
            <label className="block">
              <span className="label text-cream/40">Search</span>
              <input
                className="field mt-1.5 !text-sm"
                placeholder="Society, sector, amenity…"
                value={filters.q}
                onChange={(e) => setFilter("q", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label text-cream/40">Type</span>
              <select className="field mt-1.5 !text-sm" value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "Any type" : t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label text-cream/40">Society</span>
              <select className="field mt-1.5 !text-sm" value={filters.society} onChange={(e) => setFilter("society", e.target.value)}>
                {societies.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "Any society" : s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label text-cream/40">Sort</span>
              <select
                className="field mt-1.5 !text-sm"
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value as SortKey)}
              >
                {sorts.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-5 border-t border-cream/10 pt-4 md:grid-cols-[1.6fr_1fr_1fr_auto]">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="label text-cream/40">Price range</span>
                <span className="num text-[0.72rem] text-gold">
                  {formatPKR(filters.min)} — {formatPKR(filters.max)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={defaultFilters.max}
                  step={STEP}
                  value={filters.min}
                  onChange={(e) => setFilter("min", Math.min(Number(e.target.value), filters.max - STEP))}
                  aria-label="Minimum price"
                />
                <input
                  type="range"
                  min={0}
                  max={defaultFilters.max}
                  step={STEP}
                  value={filters.max}
                  onChange={(e) => setFilter("max", Math.max(Number(e.target.value), filters.min + STEP))}
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div>
              <span className="label text-cream/40">Bedrooms</span>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFilter("beds", b)}
                    className="pill !px-3 !py-1.5 !text-[0.6rem]"
                    data-active={filters.beds === b}
                  >
                    {b === 0 ? "Any" : `${b}+`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label text-cream/40">Bathrooms</span>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFilter("baths", b)}
                    className="pill !px-3 !py-1.5 !text-[0.6rem]"
                    data-active={filters.baths === b}
                  >
                    {b === 0 ? "Any" : `${b}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setParams(new URLSearchParams(), { replace: true });
                }}
                className="pill !py-2.5 !text-[0.6rem] hover:!border-signal hover:!text-signal"
                disabled={activeCount === 0}
              >
                Reset {activeCount > 0 && `(${activeCount})`}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
          <p className="label text-cream/45">
            <span className="num text-cream">{String(results.length).padStart(2, "0")}</span> {results.length === 1 ? "property" : "properties"}
            {savedOnly && " · saved only"}
          </p>
          <p className="text-xs text-cream/35">Prices in PKR · all files independently verified</p>
        </div>

        {view === "map" ? (
          <div className="mt-6 h-[72vh] min-h-[460px] overflow-hidden rounded-[1.4rem] border border-line bg-obsidian">
            <MapSection embedded />
          </div>
        ) : results.length > 0 ? (
          <div className="mt-6 grid gap-6 pb-8 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p, i) => (
              <PropertyCard key={p.id} p={p} index={i} compact />
            ))}
          </div>
        ) : (
          <div className="mt-10 mb-20 rounded-[1.4rem] border border-dashed border-cream/20 p-12 text-center">
            <p className="display text-3xl">Nothing matches that search</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-cream/55">
              We keep roughly a third of our stock off the website. Tell us what you are looking for and we will send the
              private list.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="gold" onClick={() => { resetFilters(); setParams(new URLSearchParams(), { replace: true }); }}>
                Clear filters
              </Button>
              <Button to="/contact" variant="outline">
                Ask us directly
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
