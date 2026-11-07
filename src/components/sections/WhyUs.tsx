import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { agents, owner, site, stats, testimonials } from "../../data/content";
import { siteConfig } from "../../lib/siteConfig";
import { useStore } from "../../store/useStore";
import Canvas3D from "../three/Canvas3D";
import OwnerPortrait from "../ui/OwnerPortrait";
import { Counter, Eyebrow, SplitLines } from "../ui/Reveal";
import { IconArrowUpRight, IconInstagram, IconQuote, IconTikTok, IconWhatsApp } from "../ui/Icons";
import { buildWhatsAppLink, cn, trackWhatsAppClick, waMessages } from "../../lib/utils";
import { usePrefersReducedMotion } from "../../hooks/useDevice";

const Emblem = lazy(() => import("../three/Emblem"));

export default function WhyUs() {
  const reduced = usePrefersReducedMotion();
  const webgl = useStore((s) => s.webgl);

  return (
    <section id="why-us" className="relative overflow-hidden bg-obsidian py-20 text-ivory sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(23,98,79,0.4), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1600px] items-center gap-12 px-[var(--gut)] lg:grid-cols-[1fr_minmax(0,24rem)]">
        <div>
          <Eyebrow>{site.name} — {siteConfig.brand.city}</Eyebrow>
          <SplitLines
            className="display mt-5 text-[clamp(2.2rem,6vw,5rem)] leading-[0.9]"
            lines={[
              <span key="1">What we can</span>,
              <span key="2" className="serif-it text-gold">actually show you</span>,
            ]}
          />
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-mist">
            Only figures we can evidence are published here. Anything the owner has not supplied yet is shown as a
            visible placeholder rather than an invented number.
          </p>

          <dl className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.key} className="relative border-t border-line pt-5">
                <dd className="display text-[clamp(2.4rem,5.6vw,4rem)] leading-none text-ivory">
                  {typeof s.value === "number" ? (
                    <Counter to={s.value} suffix={s.suffix} duration={1900} />
                  ) : (
                    <span className="todo text-[1.6rem] tracking-wide">to be added</span>
                  )}
                </dd>
                <dt className="label mt-3 text-gold">{s.label}</dt>
                <p className={cn("mt-2 text-xs", s.note.startsWith("TODO") ? "todo" : "text-mist/70")}>{s.note}</p>
              </div>
            ))}
          </dl>

          <Testimonials />
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle at 50% 45%, rgba(201,169,110,0.24), transparent 62%)" }}
            aria-hidden="true"
          />
          {webgl && !reduced ? (
            <Canvas3D
              poster="radial-gradient(circle at 50% 45%, rgba(201,169,110,0.22), transparent 65%)"
              posterLabel="Emblem"
              camera={{ position: [0, 0, 5.4], fov: 34 }}
              exposure={1.1}
              shadows={false}
              className="rounded-full"
            >
              <Suspense fallback={null}>
                <Emblem />
              </Suspense>
            </Canvas3D>
          ) : (
            <div className="grid h-full place-items-center">
              <p className="display gold-sheen text-[6rem]">BE</p>
            </div>
          )}
          <p className="label absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-mist/60">
            {siteConfig.brand.name} · {siteConfig.brand.currency}
          </p>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % testimonials.length), 6400);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="mt-14">
      <div className="flex items-center justify-between gap-4">
        <Eyebrow>Client words — sample copy</Eyebrow>
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Testimonial ${idx + 1}`}
              className={cn("h-1.5 rounded-full transition-all duration-500", idx === i ? "w-8 bg-gold" : "w-3 bg-ivory/20 hover:bg-ivory/40")}
            />
          ))}
        </div>
      </div>

      <div className="relative mt-6 min-h-[15rem] sm:min-h-[12rem]">
        {testimonials.map((t, idx) => (
          <motion.figure
            key={idx}
            initial={false}
            animate={{ opacity: idx === i ? 1 : 0, y: idx === i ? 0 : 18 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className={cn("absolute inset-0", idx === i ? "pointer-events-auto" : "pointer-events-none")}
            aria-hidden={idx !== i}
          >
            <blockquote className="glass relative max-w-3xl rounded-2xl p-6 sm:p-8">
              <IconQuote className="absolute right-6 top-6 h-7 w-7 text-gold/25" />
              <span className="pill !border-gold/40 !bg-gold/10 !px-3 !py-1 !text-[0.52rem] !text-gold">
                Placeholder — replace with a real, consented quote
              </span>
              <p className="serif-it mt-4 text-[clamp(1.05rem,2.2vw,1.55rem)] leading-snug text-ivory/90">“{t.quote}”</p>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="h-8 w-px bg-gold/60" />
                <span>
                  <span className="todo block text-sm">{t.name}</span>
                  <span className="todo label mt-1 block">{t.meta}</span>
                </span>
              </figcaption>
            </blockquote>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}

/** About Bilal / Team — the owner's real portrait, plus explicit empty slots. */
export function Team() {
  const wa = buildWhatsAppLink({ message: waMessages.general() });
  return (
    <section id="team" className="relative overflow-hidden bg-graphite py-20 text-ivory sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(55% 45% at 85% 10%, rgba(23,98,79,0.4), transparent 65%)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>About {owner.name}</Eyebrow>
            <SplitLines
              className="display mt-5 text-[clamp(2.2rem,6vw,5rem)] leading-[0.9]"
              lines={[
                <span key="1">One person answers</span>,
                <span key="2" className="serif-it text-gold">when you call</span>,
              ]}
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            {site.name} is run by {owner.name}. Every mandate, viewing and transfer is handled personally — no call
            centre, no juniors reading a script.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.25fr_1fr_1fr]">
          {/* owner */}
          <motion.article
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="glass relative overflow-hidden rounded-[1.4rem] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <OwnerPortrait size="lg" className="w-full max-w-[15rem] sm:w-[15rem]" caption />
              <div className="min-w-0">
                <p className="label text-gold">{owner.role}</p>
                <h3 className="display mt-3 text-[clamp(2rem,4.4vw,3rem)] leading-none">{owner.name}</h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">{owner.bio}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {owner.languages.map((l) => (
                    <span key={l} className="rounded-full border border-line px-3 py-1 text-[0.62rem] text-mist">
                      {l}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-wa="team_owner"
                    onClick={() => trackWhatsAppClick({ placement: "team_owner" })}
                    className="pill !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
                  >
                    <IconWhatsApp className="h-3.5 w-3.5" /> WhatsApp {site.phoneDisplay}
                  </a>
                  <a href={`tel:${site.phoneTel}`} className="pill">
                    Call now
                  </a>
                </div>
              </div>
            </div>
          </motion.article>

          {/* placeholder slots */}
          {agents
            .filter((a) => a.placeholder)
            .map((a, i) => (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col justify-between overflow-hidden rounded-[1.4rem] border border-dashed border-line bg-obsidian/40 p-6"
              >
                <div>
                  <div className="arch-mask grid h-28 w-[5.6rem] place-items-center border border-line bg-emerald-deep/25">
                    <svg viewBox="0 0 80 100" className="h-[80%] w-auto text-gold/30" fill="none" aria-hidden="true">
                      <circle cx="40" cy="32" r="15" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M12 96c2-18 13-28 28-28s26 10 28 28" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="todo label mt-5">Team slot {i + 2}</p>
                  <h3 className="todo display mt-2 text-2xl leading-none">{a.name}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-mist/70">{a.bio}</p>
                </div>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill mt-6 self-start"
                  aria-label="Message Bilal Estate on WhatsApp"
                >
                  <IconWhatsApp className="h-3.5 w-3.5" /> Message the office
                </a>
              </motion.article>
            ))}
        </div>

        {/* socials */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <p className="label mr-2 text-mist/60">Follow</p>
          <a
            href={siteConfig.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.name} on Instagram (${siteConfig.social.instagram.handle})`}
            data-social="instagram"
            className="pill group"
          >
            <IconInstagram className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[10deg]" />
            Instagram {siteConfig.social.instagram.handle}
          </a>
          <a
            href={siteConfig.social.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.name} on TikTok (${siteConfig.social.tiktok.handle})`}
            data-social="tiktok"
            className="pill group"
          >
            <IconTikTok className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-[10deg]" />
            TikTok {siteConfig.social.tiktok.handle}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="pill group ml-auto"
            aria-label={`Email ${site.name}`}
          >
            {siteConfig.email} <IconArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
