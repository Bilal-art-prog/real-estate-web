import { Link } from "react-router-dom";
import { site } from "../../data/content";
import { properties } from "../../data/properties";
import { siteConfig } from "../../lib/siteConfig";
import { buildWhatsAppLink, waMessages } from "../../lib/whatsapp";
import { Eyebrow, Marquee } from "../ui/Reveal";
import { IconArrowUpRight, IconInstagram, IconMail, IconPin, IconTikTok, IconWhatsApp, Monogram } from "../ui/Icons";
import { scrollToTop } from "../../lib/scroll";
import { cn } from "../../lib/utils";

const socialIcon: Record<string, any> = {
  whatsapp: IconWhatsApp,
  instagram: IconInstagram,
  tiktok: IconTikTok,
  mail: IconMail,
};

export default function Footer() {
  const year = new Date().getFullYear();
  const waHref = buildWhatsAppLink({ message: waMessages.general() });

  return (
    <footer className="relative overflow-hidden border-t border-line bg-obsidian pt-16 text-ivory">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 120%, rgba(23,98,79,0.4), transparent 70%), radial-gradient(50% 40% at 90% 0%, rgba(201,169,110,0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <Marquee
          className="mb-14 border-y border-line py-4 text-mist/70"
          duration={52}
          items={[
            <span key="1" className="label">{siteConfig.brand.city} · {siteConfig.brand.alsoServes}</span>,
            <span key="2" className="label">Files verified before they are advertised</span>,
            <span key="3" className="label">{properties.length} live mandates</span>,
            <span key="4" className="label">Overseas buyers welcome</span>,
            <span key="5" className="display text-xl text-gold">{site.tagline}</span>,
          ]}
        />

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Monogram className="h-10 w-10 text-gold" />
              <div>
                <p className="display text-2xl leading-none">{site.name}</p>
                <p className="label mt-2 text-mist/70">
                  {siteConfig.brand.city} · {siteConfig.brand.country}
                </p>
              </div>
            </div>
            <p className="urdu mt-4 text-base text-gold-soft" lang="ur" dir="rtl">
              {site.taglineUr}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">
              {site.tagline} Residential, commercial and land mandates across {siteConfig.brand.city} and{" "}
              {siteConfig.brand.alsoServes}, handled personally by {site.founder}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {site.socials.map((s) => {
                const Icon = socialIcon[s.icon] ?? IconArrowUpRight;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-social={s.icon}
                    data-wa={s.icon === "whatsapp" ? "footer_socials" : undefined}
                    className="pill group"
                    aria-label={`${site.name} on ${s.label}`}
                  >
                    <Icon className="h-3.5 w-3.5 transition-transform duration-500 group-hover:scale-110" />
                    {s.label}
                  </a>
                );
              })}
            </div>
          </div>

          <nav aria-label="Explore">
            <Eyebrow>Explore</Eyebrow>
            <ul className="mt-6 space-y-3 text-sm text-mist">
              {[
                { to: "/", label: "Home" },
                { to: "/properties", label: "All properties" },
                { to: "/properties?purpose=rent", label: "Rentals" },
                { to: "/properties?purpose=commercial", label: "Commercial" },
                { to: "/properties?purpose=plot", label: "Plots" },
                { to: "/about", label: `About ${site.founder}` },
                { to: "/blog", label: "Insights" },
                { to: "/contact", label: "Contact" },
                { to: "/admin", label: "Leads & analytics" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="link-underline transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Featured listings">
            <Eyebrow>Featured</Eyebrow>
            <ul className="mt-6 space-y-3 text-sm text-mist">
              {properties
                .filter((p) => p.featured)
                .slice(0, 6)
                .map((p) => (
                  <li key={p.slug}>
                    <Link to={`/properties/${p.slug}`} className="link-underline transition-colors hover:text-gold">
                      {p.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div>
            <Eyebrow>Reach us</Eyebrow>
            <ul className="mt-6 space-y-4 text-sm text-mist">
              <li>
                <a href={waHref} target="_blank" rel="noopener noreferrer" data-wa="footer" className="group flex items-start gap-3 hover:text-gold">
                  <IconWhatsApp className="mt-0.5 h-4 w-4 shrink-0 text-wa" />
                  <span>
                    <span className="block text-ivory">{site.phoneDisplay}</span>
                    <span className="text-mist/70">WhatsApp — tap to chat instantly</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`tel:${site.phoneTel}`} className="group flex items-start gap-3 hover:text-gold">
                  <IconMail className="mt-0.5 hidden h-4 w-4 shrink-0 text-gold" />
                  <span>
                    <span className="block text-ivory">{site.phoneIntl}</span>
                    <span className="text-mist/70">Call</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="group flex items-start gap-3 hover:text-gold">
                  <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span className="break-all">{site.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className={cn(siteConfig.todo.officeAddress.startsWith("TODO") ? "todo" : "text-ivory")}>
                  {siteConfig.todo.officeAddress}
                  <br />
                  <span className="text-mist">
                    {siteConfig.brand.city}, {siteConfig.brand.country}
                  </span>
                </span>
              </li>
              <li className={cn("text-xs", siteConfig.todo.openingHours.startsWith("TODO") ? "todo" : "text-mist")}>
                {siteConfig.todo.openingHours}
              </li>
            </ul>
            <button type="button" onClick={() => scrollToTop()} className="pill mt-6">
              Back to top <IconArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="relative mt-16 select-none overflow-hidden" aria-hidden="true">
          <p
            className="display text-ivory/8"
            style={{ fontSize: "clamp(3.5rem,17vw,17rem)", lineHeight: 0.78, letterSpacing: "-0.02em" }}
          >
            BILAL ESTATE
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-6 text-[0.7rem] text-mist/70 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. {site.visualsNote}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <span className={cn(siteConfig.todo.licenseNumber.startsWith("TODO") ? "todo" : "")}>
              {siteConfig.todo.licenseNumber}
            </span>
            <Link to="/about" className="link-underline hover:text-gold">
              How we work
            </Link>
            <Link to="/contact" className="link-underline hover:text-gold">
              Contact
            </Link>
            <span className="label text-gold">Made for {siteConfig.brand.city}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
