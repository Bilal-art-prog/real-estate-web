import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { posts, site } from "../../data/content";
import { useStore } from "../../store/useStore";
import { Eyebrow, RevealImage, SplitLines } from "../ui/Reveal";
import { IconArrowUpRight } from "../ui/Icons";
import { readTime } from "../../lib/utils";

export default function Journal() {
  const pushToast = useStore((s) => s.pushToast);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [hoverImg, setHoverImg] = useState<{ src: string; x: number; y: number } | null>(null);
  const latest = posts.slice(0, 3);

  return (
    <section id="journal" data-nav="dark" className="relative overflow-hidden bg-graphite py-20 text-ivory sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(55% 45% at 85% 8%, var(--obsidian), transparent 62%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow tone="ink">Chapter 08 — Insights</Eyebrow>
            <SplitLines
              className="display mt-5 text-[clamp(2.2rem,6vw,5rem)] leading-[0.88]"
              lines={[
                <span key="1">Notes from the</span>,
                <span key="2" className="serif-it text-gold">market desk</span>,
              ]}
            />
          </div>
          <Link to="/blog" className="pill pill-dark self-start border-line text-ivory md:self-auto">
            All {posts.length} articles <IconArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12 border-t border-line">
          {latest.map((p, i) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group relative block border-b border-line"
              onPointerMove={(e) => setHoverImg({ src: p.cover, x: e.clientX, y: e.clientY })}
              onPointerLeave={() => setHoverImg(null)}
            >
              <div className="grid items-center gap-4 py-7 transition-[padding] duration-700 group-hover:pl-4 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:gap-8">
                <span className="num text-xs text-mist/50">0{i + 1}</span>
                <div className="min-w-0">
                  <h3 className="display text-[clamp(1.5rem,3.6vw,2.6rem)] leading-tight transition-colors duration-500 group-hover:text-gold">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-1 max-w-2xl text-sm text-mist">{p.excerpt}</p>
                </div>
                <span className="label whitespace-nowrap rounded-full bg-ivory/8 px-3 py-1.5 text-mist">
                  {p.category}
                </span>
                <span className="label flex items-center gap-3 whitespace-nowrap text-mist/60">
                  {new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  <span className="text-ivory/25">·</span>
                  {readTime(p.body.join(" "))} min
                  <IconArrowUpRight className="h-4 w-4 text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* floating cover preview */}
        {hoverImg && (
          <div
            className="pointer-events-none fixed z-40 hidden h-52 w-72 overflow-hidden rounded-xl shadow-2xl lg:block"
            style={{ left: hoverImg.x + 24, top: hoverImg.y - 110 }}
            aria-hidden="true"
          >
            <img src={hoverImg.src} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {/* newsletter */}
        <div className="mt-16 grid gap-8 rounded-[1.6rem] border border-line bg-obsidian/45 p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Eyebrow tone="ink">The monthly file</Eyebrow>
            <h3 className="display mt-4 text-[clamp(1.8rem,4vw,3rem)] leading-none">
              One email a month. <span className="serif-it text-gold">Actual numbers.</span>
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">
              Society-by-society price movement, new mandates before they are listed, and the occasional warning about
              a file that is being marketed by three agencies at once.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              setDone(true);
              pushToast(`Subscribed — confirmation sent to ${email}`);
            }}
            className="flex flex-col gap-3"
          >
            <label className="block">
              <span className="label text-mist/70">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="field field mt-2 text-ivory"
                autoComplete="email"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="pill pill-dark !bg-ink !px-7 !py-3.5 !text-cream hover:!bg-walnut"
                disabled={done}
              >
                {done ? "You're on the list" : "Subscribe"}
              </button>
              <a href={`mailto:${site.email}?subject=Subscribe%20to%20the%20monthly%20file`} className="label text-mist/70 link-underline">
                or email us directly
              </a>
            </div>
            <p className="text-[0.68rem] text-mist/50">
              No spam, no sharing of your address. Unsubscribe in one click.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export function JournalCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {posts.map((p, i) => (
        <motion.div
          key={p.slug}
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to={`/blog/${p.slug}`} className="group block">
            <RevealImage src={p.cover} alt={p.title} className="aspect-[16/10] w-full rounded-xl" />
            <p className="label mt-4 text-gold/70">{p.category}</p>
            <h3 className="display mt-2 text-2xl leading-tight transition-colors group-hover:text-gold">{p.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-mist">{p.excerpt}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
