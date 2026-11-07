import { Link } from "react-router-dom";
import { site } from "../data/content";
import { properties } from "../data/properties";
import { siteConfig } from "../lib/siteConfig";
import { Marquee } from "../components/ui/Reveal";
import Hero from "../components/sections/Hero";
import WalkThroughSection from "../components/sections/WalkThroughSection";
import Featured from "../components/sections/Featured";
import MapSection from "../components/sections/MapSection";
import Services from "../components/sections/Services";
import WhyUs, { Team } from "../components/sections/WhyUs";
import Journal from "../components/sections/Journal";
import ContactSection from "../components/sections/ContactSection";
import { IconWhatsApp } from "../components/ui/Icons";
import { buildWhatsAppLink, trackWhatsAppClick } from "../lib/whatsapp";

export default function Home() {
  const sectors = new Set(properties.map((p) => p.society)).size;
  const wa = buildWhatsAppLink({
    message:
      "Assalam o Alaikum Bilal Estate, I am an overseas Pakistani and would like to discuss a purchase in Islamabad.",
  });

  return (
    <>
      <Hero />

      <div className="relative border-y border-line bg-graphite py-5 text-mist">
        <Marquee
          duration={48}
          items={[
            <span key="a" className="label text-gold">Step inside →</span>,
            <span key="b" className="display text-xl text-ivory/85">{properties.length} live mandates</span>,
            <span key="c" className="label">Scroll-driven photoreal walkthrough</span>,
            <span key="d" className="display text-xl text-gold">{site.tagline}</span>,
            <span key="e" className="label">{sectors} societies · {siteConfig.brand.city} & {siteConfig.brand.alsoServes}</span>,
          ]}
        />
      </div>

      <WalkThroughSection />
      <Featured />
      <MapSection />
      <Services />
      <WhyUs />
      <Team />

      {/* overseas desk band */}
      <section className="relative overflow-hidden bg-emerald-deep py-16 text-ivory sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(60% 60% at 20% 20%, rgba(201,169,110,0.28), transparent 65%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-8 px-[var(--gut)] lg:flex-row lg:items-center">
          <div>
            <p className="label text-ivory/70">Overseas buyer desk</p>
            <h2 className="display mt-4 max-w-[24ch] text-[clamp(1.9rem,4.6vw,3.6rem)] leading-[0.94]">
              Buying from Dubai, London or Toronto? We can run it while you sleep.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-ivory/80">
              Video of every document and every signature, remittance through a proper banking channel, and a
              registered power of attorney set up before you travel. Ask for the current process sheet.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/properties/${properties[0].slug}`}
              className="pill !min-h-14 !px-7 !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !border-transparent !text-obsidian"
            >
              See the featured house
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-wa="overseas_band"
              onClick={() => trackWhatsAppClick({ placement: "overseas_band" })}
              className="pill !min-h-14 !px-7 !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
            >
              <IconWhatsApp className="h-4 w-4" /> Talk to the desk
            </a>
          </div>
        </div>
      </section>

      <Journal />
      <ContactSection />
    </>
  );
}
