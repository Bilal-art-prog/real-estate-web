import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { owner, site } from "../../data/content";
import { properties } from "../../data/properties";
import { images } from "../../lib/images";
import { siteConfig } from "../../lib/siteConfig";
import { saveLead } from "../../lib/leads";
import { useStore } from "../../store/useStore";
import { bindProgress, progress } from "../../lib/scroll";
import { Button, Eyebrow, SplitLines } from "../ui/Reveal";
import OwnerPortrait from "../ui/OwnerPortrait";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconInstagram,
  IconMail,
  IconPhone,
  IconPin,
  IconTikTok,
  IconWhatsApp,
} from "../ui/Icons";
import { buildWhatsAppLink, cn, trackWhatsAppClick, waMessages } from "../../lib/utils";

const budgets = [
  "Under PKR 1 Crore",
  "PKR 1 – 3 Crore",
  "PKR 3 – 6 Crore",
  "PKR 6 – 15 Crore",
  "PKR 15 Crore +",
  "Rental budget under PKR 2 Lakh",
];

const interests = ["Buy a home", "Invest / yield", "Rent", "Sell my property", "Commercial", "Plot / land", "Overseas purchase"];

export default function ContactSection() {
  const section = useRef<HTMLElement | null>(null);
  const pushToast = useStore((s) => s.pushToast);
  const openBooking = useStore((s) => s.openBooking);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    budget: budgets[1],
    interest: interests[0],
    message: "",
    website: "",
  });
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const st = bindProgress("finale", section.current, { start: "top bottom", end: "bottom bottom" });
    return () => {
      st?.kill();
      progress.finale = 0;
    };
  }, []);

  const waHref = buildWhatsAppLink({
    message: waMessages.lead({
      name: form.name,
      phone: form.phone,
      budget: form.budget,
      interest: form.interest,
      message: form.message,
    }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveLead({
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      interest: form.interest,
      budget: form.budget,
      message: form.message || undefined,
      source: "contact_section",
      website: form.website,
    });
    if (!res.ok) {
      setState("error");
      setError(res.error ?? "Could not save your enquiry.");
      return;
    }
    setState("saved");
    setError(null);
    pushToast("Enquiry saved — continue on WhatsApp to send it instantly");
  };

  return (
    <section
      ref={section}
      id="contact"
      className="relative overflow-hidden bg-obsidian py-20 text-ivory sm:py-28"
      aria-label={`Contact ${site.name}`}
    >
      <div className="absolute inset-0" aria-hidden="true">
        <img src={images.heroNight} alt="" className="h-full w-full object-cover opacity-40 ken" loading="lazy" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,13,12,0.94), rgba(10,13,12,0.68) 42%, rgba(10,13,12,0.97)), radial-gradient(50% 40% at 75% 28%, rgba(201,169,110,0.22), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Eyebrow>Talk to us</Eyebrow>
            <SplitLines
              className="display mt-5 text-[clamp(2.4rem,7vw,5.6rem)] leading-[0.86]"
              lines={[
                <span key="1">Find the space</span>,
                <span key="2" className="serif-it text-gold">where your life begins</span>,
              ]}
            />
            <p className="urdu mt-4 text-lg text-gold-soft" lang="ur" dir="rtl">
              {site.taglineUr}
            </p>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-mist">
              Tell us what you are looking for. Your enquiry is saved first, then one tap continues the conversation in
              WhatsApp with everything already typed.
            </p>

            <form onSubmit={submit} className="mt-10 grid gap-6 sm:grid-cols-2">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="absolute h-0 w-0 opacity-0"
              />
              <label className="block">
                <span className="label text-mist/70">Full name *</span>
                <input required className="field mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" autoComplete="name" />
              </label>
              <label className="block">
                <span className="label text-mist/70">Phone / WhatsApp *</span>
                <input required type="tel" className="field mt-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03xx xxxxxxx" autoComplete="tel" />
              </label>
              <label className="block sm:col-span-2">
                <span className="label text-mist/70">Email</span>
                <input type="email" className="field mt-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
              </label>
              <label className="block">
                <span className="label text-mist/70">Budget</span>
                <select className="field mt-2" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
                  {budgets.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label text-mist/70">I am interested in</span>
                <select className="field mt-2" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}>
                  {interests.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="label text-mist/70">Message</span>
                <textarea rows={4} className="field mt-2 resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Looking for a 1 kanal house in DHA Phase 2 or 5, ready possession, west facing…" />
              </label>

              {error && (
                <p className="text-sm text-alert sm:col-span-2" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                {state === "saved" ? (
                  <motion.a
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-wa="contact_form_continue"
                    onClick={() => trackWhatsAppClick({ placement: "contact_form" })}
                    className="pill !min-h-14 !px-8 !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
                  >
                    <IconWhatsApp className="h-5 w-5" /> Continue on WhatsApp
                  </motion.a>
                ) : (
                  <button type="submit" className="pill !min-h-14 !px-8 !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian !border-transparent">
                    Save my enquiry <IconArrowRight className="h-4 w-4" />
                  </button>
                )}
                <Button type="button" variant="outline" size="lg" onClick={() => openBooking(null)}>
                  Book a viewing instead
                </Button>
                {state === "saved" && <p className="text-sm text-gold">Saved locally — press the green button to send it in WhatsApp.</p>}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-[1.4rem] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <OwnerPortrait size="md" caption={false} />
                <div className="min-w-0">
                  <Eyebrow>{site.name}</Eyebrow>
                  <p className="display mt-3 text-2xl leading-none">{owner.name}</p>
                  <p className="label mt-2 text-gold">{owner.role}</p>
                  <p className="mt-2 text-xs text-mist">{owner.languages.join(" · ")}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <a
                  href={buildWhatsAppLink({ message: waMessages.general() })}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa="contact_card"
                  onClick={() => trackWhatsAppClick({ placement: "contact_card" })}
                  className="group flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-wa"
                >
                  <IconWhatsApp className="h-5 w-5 text-wa" />
                  <span className="min-w-0">
                    <span className="label block text-mist/70">WhatsApp</span>
                    <span className="num block truncate text-sm text-ivory">{site.phoneDisplay}</span>
                  </span>
                </a>
                <a
                  href={`tel:${site.phoneTel}`}
                  onClick={() => useStore.getState().pushToast(`Calling ${site.phoneIntl}`)}
                  className="group flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-gold"
                >
                  <IconPhone className="h-5 w-5 text-gold" />
                  <span className="min-w-0">
                    <span className="label block text-mist/70">Call</span>
                    <span className="num block truncate text-sm text-ivory">{site.phoneIntl}</span>
                  </span>
                </a>
                <a href={`mailto:${site.email}`} className="group flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-gold sm:col-span-2">
                  <IconMail className="h-5 w-5 shrink-0 text-gold" />
                  <span className="min-w-0">
                    <span className="label block text-mist/70">Email</span>
                    <span className="block truncate text-sm text-ivory">{site.email}</span>
                  </span>
                </a>
              </div>
            </div>

            <div className="glass rounded-[1.4rem] p-6 sm:p-7">
              <Eyebrow>Office & hours</Eyebrow>
              <address className="mt-5 not-italic">
                <p className={cn("text-sm", siteConfig.todo.officeAddress.startsWith("TODO") ? "todo" : "text-ivory")}>
                  {siteConfig.todo.officeAddress}
                </p>
                <p className="mt-1 text-sm text-mist">
                  {siteConfig.brand.city}, {siteConfig.brand.country}
                </p>
              </address>
              <p className={cn("mt-3 text-xs", siteConfig.todo.openingHours.startsWith("TODO") ? "todo" : "text-mist")}>
                {siteConfig.todo.openingHours}
              </p>

              <div className="relative mt-5 h-40 overflow-hidden rounded-xl border border-line">
                <img src={images.aerial} alt={`Aerial view of ${siteConfig.brand.city}`} className="h-full w-full object-cover opacity-45" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,13,12,0.7), rgba(10,13,12,0.92))" }} />
                <span className="absolute left-1/2 top-1/2 flex items-center gap-2 -translate-x-1/2 -translate-y-1/2 text-gold">
                  <IconPin className="h-4 w-4" />
                  <span className="label">{siteConfig.brand.city}</span>
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.brand.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill absolute bottom-3 right-3 !min-h-9 !py-1.5 !text-[0.55rem] bg-obsidian/80 backdrop-blur-md"
                >
                  Open in Maps <IconArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a href={siteConfig.social.instagram.url} target="_blank" rel="noopener noreferrer" data-social="instagram" aria-label={`${site.name} on Instagram`} className="pill group">
                  <IconInstagram className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-[10deg]" /> {site.instagram}
                </a>
                <a href={siteConfig.social.tiktok.url} target="_blank" rel="noopener noreferrer" data-social="tiktok" aria-label={`${site.name} on TikTok`} className="pill group">
                  <IconTikTok className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-[10deg]" /> {site.tiktok}
                </a>
              </div>
            </div>

            <div className="glass rounded-[1.4rem] p-6">
              <Eyebrow>On the register now</Eyebrow>
              <p className="mt-4 text-sm text-mist">
                {properties.length} live mandates · {properties.filter((p) => p.purpose === "rent").length} rentals ·{" "}
                {properties.filter((p) => p.purpose === "commercial").length} commercial ·{" "}
                {properties.filter((p) => p.purpose === "plot").length} plots
              </p>
              <Link to="/properties" className="pill mt-5 !w-full !justify-center">
                Browse everything <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="label text-mist/60">
            {site.name} · {siteConfig.brand.city} · {new Date().getFullYear()}
          </p>
          <p className="text-[0.68rem] text-mist/50">{site.visualsNote}</p>
        </div>
      </div>
    </section>
  );
}
