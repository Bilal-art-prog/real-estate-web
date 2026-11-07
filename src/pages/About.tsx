import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { owner, services, site, stats } from "../data/content";
import { properties } from "../data/properties";
import { siteConfig } from "../lib/siteConfig";
import { images } from "../lib/images";
import { useStore } from "../store/useStore";
import OwnerPortrait from "../components/ui/OwnerPortrait";
import { Counter, Eyebrow, SplitLines, Button } from "../components/ui/Reveal";
import { Team } from "../components/sections/WhyUs";
import { IconArrowRight, IconCheck, IconQuote, IconWhatsApp } from "../components/ui/Icons";
import { buildWhatsAppLink, cn, trackWhatsAppClick, waMessages } from "../lib/utils";

/** Method, not invented history: these are how we work, not claims about the past. */
const method = [
  {
    n: "01",
    title: "We read the file before we quote a price",
    body: "Allotment and transfer letters, a fresh ownership record from the society or authority, encumbrance and unpaid-charge checks, and a physical walk of the boundaries.",
  },
  {
    n: "02",
    title: "You see every document yourself",
    body: "Nothing is summarised away. You get the file, the society's own record and our written note on what we found — including what we did not like.",
  },
  {
    n: "03",
    title: "One commission, stated up front",
    body: "Agreed in writing before the first viewing. No side fee from a developer, no silent double commission.",
  },
  {
    n: "04",
    title: "Transfer day, and the years after",
    body: "We sit with you at the counter, then stay reachable for utilities, tenants, maintenance and the next move.",
  },
];

export default function About() {
  const openBooking = useStore((s) => s.openBooking);
  const wa = buildWhatsAppLink({ message: waMessages.general() });

  return (
    <main className="relative bg-obsidian text-ivory">
      <section className="relative overflow-hidden pt-24 sm:pt-32">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={images.heroNight} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,13,12,0.86), rgba(10,13,12,0.7) 45%, var(--obsidian))" }} />
        </div>
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-[var(--gut)] lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <Eyebrow>About {site.name}</Eyebrow>
            <SplitLines
              as="h1"
              className="display mt-6 text-[clamp(2.6rem,8.5vw,7.5rem)] leading-[0.84]"
              lines={[
                <span key="1">One consultant,</span>,
                <span key="2" className="serif-it text-gold">one file at a time</span>,
              ]}
            />
            <p className="urdu mt-6 text-lg text-gold-soft" lang="ur" dir="rtl">
              {site.taglineUr}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
              {site.name} is run by {owner.name} from {siteConfig.brand.city}, and also serves{" "}
              {siteConfig.brand.alsoServes}. Residential sales, rentals, commercial investment and land — with the file
              verified before anything is advertised, and the same person handling the deal from first viewing to
              transfer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/properties" variant="solid" size="lg" icon={<IconArrowRight className="h-4 w-4" />}>
                See the register
              </Button>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                data-wa="about_cta"
                onClick={() => trackWhatsAppClick({ placement: "about_cta" })}
                className="pill !min-h-12 !px-7 !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
              >
                <IconWhatsApp className="h-4 w-4" /> WhatsApp {site.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5 sm:flex-row lg:justify-end">
            <OwnerPortrait size="lg" className="w-[min(70vw,17rem)] lg:w-[17rem]" caption />
            <blockquote className="glass max-w-xs rounded-2xl p-5">
              <IconQuote className="h-6 w-6 text-gold/30" />
              <p className="serif-it mt-3 text-lg leading-snug text-ivory/90">
                “A house is the largest thing most families will ever sign for. It deserves more than a photograph and a
                price.”
              </p>
              <footer className="label mt-4 text-mist/70">{owner.name} — {owner.role}</footer>
            </blockquote>
          </div>
        </div>

        <dl className="relative mx-auto mt-16 grid max-w-[1600px] gap-8 px-[var(--gut)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.key} className="border-t border-line pt-5">
              <dd className="display text-[clamp(2.2rem,5vw,3.4rem)] leading-none">
                {typeof s.value === "number" ? (
                  <Counter to={s.value} suffix={s.suffix} />
                ) : (
                  <span className="todo text-[1.5rem]">to be added</span>
                )}
              </dd>
              <dt className="label mt-3 text-gold">{s.label}</dt>
              <p className={cn("mt-2 text-xs", s.note.startsWith("TODO") ? "todo" : "text-mist/70")}>{s.note}</p>
            </div>
          ))}
        </dl>
      </section>

      {/* method */}
      <section className="relative mx-auto mt-24 max-w-[1600px] px-[var(--gut)]">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>How we work</Eyebrow>
            <h2 className="display mt-5 text-[clamp(2rem,5vw,3.6rem)] leading-[0.92]">
              Four rules we <span className="serif-it text-gold">do not bend</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-mist">
              This is method rather than marketing: everything below is what actually happens on a mandate, and none of
              it depends on a claim we cannot evidence.
            </p>
            <button type="button" onClick={() => openBooking(null)} className="pill mt-7 !min-h-12">
              Book a consultation <IconArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <ol className="relative border-l border-line pl-8">
            {method.map((m, i) => (
              <motion.li
                key={m.n}
                initial={{ opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.75, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="relative pb-10 last:pb-0"
              >
                <span className="absolute -left-[2.35rem] top-1.5 grid h-4 w-4 place-items-center rounded-full border border-gold/60 bg-obsidian">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                </span>
                <p className="num text-sm text-gold">{m.n}</p>
                <h3 className="display mt-2 text-[clamp(1.4rem,3vw,2rem)] leading-tight">{m.title}</h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-mist">{m.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* services recap */}
      <section className="relative mt-24 bg-graphite py-20">
        <div className="mx-auto max-w-[1600px] px-[var(--gut)]">
          <Eyebrow>What we handle</Eyebrow>
          <h2 className="display mt-5 max-w-[18ch] text-[clamp(2rem,5.4vw,4.2rem)] leading-[0.92]">
            Six services, <span className="serif-it text-gold">one desk</span>
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.id} className="flex items-start gap-3 rounded-xl border border-line bg-obsidian/45 p-5">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <p className="display text-xl leading-none">{s.title}</p>
                  <p className="urdu mt-1 text-xs text-gold/80" lang="ur" dir="rtl">{s.titleUr}</p>
                  <p className="mt-2 text-xs leading-relaxed text-mist">{s.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Team />

      {/* office / facts we do not invent */}
      <section className="relative overflow-hidden bg-obsidian py-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 60% at 20% 100%, rgba(23,98,79,0.4), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-[1600px] flex-col gap-8 px-[var(--gut)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="display max-w-[22ch] text-[clamp(2rem,5vw,3.6rem)] leading-[0.92]">
              Office details, hours and licence — to be supplied by the owner
            </h2>
            <p className="mt-4 max-w-lg text-sm text-mist">
              These fields are deliberate placeholders. Nothing invented is published on this site: when you give us the
              address, opening hours and registration number they replace the placeholders everywhere at once.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-3">
              {[siteConfig.todo.officeAddress, siteConfig.todo.openingHours, siteConfig.todo.licenseNumber].map((v) => (
                <li key={v} className="todo rounded-lg border border-dashed border-line px-4 py-3 text-xs">
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="pill !min-h-12 !px-7 !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian !border-transparent">
              Contact page
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" data-wa="about_band" className="pill !min-h-12 !px-7">
              WhatsApp us
            </a>
          </div>
        </div>
        <p className="relative mx-auto mt-10 max-w-[1600px] px-[var(--gut)] text-xs text-mist/60">
          {properties.length} live mandates · {site.visualsNote}
        </p>
      </section>
    </main>
  );
}
