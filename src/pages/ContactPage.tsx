import { useState } from "react";
import { motion } from "framer-motion";
import ContactSection from "../components/sections/ContactSection";
import { Eyebrow, SplitLines } from "../components/ui/Reveal";
import { agents, site } from "../data/content";
import { IconMail, IconPhone, IconWhatsApp } from "../components/ui/Icons";
import { waLink } from "../lib/utils";

const faqs = [
  {
    q: "How much commission do you charge?",
    a: "One percent from the buyer on sales, and one month's rent on lettings — stated in writing before you view anything. Sellers pay a separate, disclosed fee. We never take an undisclosed cut from both sides.",
  },
  {
    q: "Can you handle a purchase while I am abroad?",
    a: "Yes. Roughly a third of our closings are overseas. You will need a registered power of attorney (we guide you through the embassy and registrar steps) and remittance through a banking channel so the money can be repatriated later.",
  },
  {
    q: "Do you verify the file before I pay a token?",
    a: "Always. Allotment letter, transfer letter, society ownership record, encumbrance check and a physical boundary walk. If any of those fail, we tell you to walk away.",
  },
  {
    q: "What areas do you cover?",
    a: "Islamabad and Rawalpindi: DHA Phases 1–6, Bahria Town and Bahria Enclave, Gulberg Greens, F-6/F-7/E-11, Blue Area, Naval Anchorage, Park Road and Chak Shahzad.",
  },
  {
    q: "Do you manage property after the purchase?",
    a: "We do — bills, maintenance, tenants and a monthly statement with photographs. Popular with owners who live in the Gulf or the UK.",
  },
  {
    q: "How fast can I view a house?",
    a: "Usually within 24 hours. Send the reference number on WhatsApp and we will confirm a slot the same day.",
  },
];

export default function ContactPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="relative bg-ink text-cream">
      <section className="relative overflow-hidden pt-28 sm:pt-36">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 55% at 20% 0%, rgba(232,145,58,0.18), transparent 65%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
          <Eyebrow>Contact</Eyebrow>
          <SplitLines
            as="h1"
            className="display mt-6 text-[clamp(2.8rem,10vw,8.5rem)] leading-[0.84]"
            lines={[
              <span key="1">Come in, sit down,</span>,
              <span key="2" className="serif-it text-gold">tell us what you need</span>,
            ]}
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-[1.3rem] p-6 transition-colors hover:border-[#25D366]/50"
            >
              <IconWhatsApp className="h-7 w-7 text-[#25D366]" />
              <p className="label mt-5 text-cream/45">WhatsApp — fastest</p>
              <p className="num mt-2 text-xl">{site.phoneDisplay}</p>
              <p className="mt-2 text-xs text-cream/40">Typical reply under 20 minutes, 7 days a week.</p>
            </a>
            <a href={`tel:${site.phoneIntl.replace(/\s/g, "")}`} className="group glass rounded-[1.3rem] p-6 transition-colors hover:border-gold/50">
              <IconPhone className="h-7 w-7 text-gold" />
              <p className="label mt-5 text-cream/45">Call the office</p>
              <p className="num mt-2 text-xl">{site.phoneIntl}</p>
              <p className="mt-2 text-xs text-cream/40">{site.hours[0].day}: {site.hours[0].time}</p>
            </a>
            <a href={`mailto:${site.email}`} className="group glass rounded-[1.3rem] p-6 transition-colors hover:border-gold/50">
              <IconMail className="h-7 w-7 text-gold" />
              <p className="label mt-5 text-cream/45">Email</p>
              <p className="mt-2 break-all text-sm">{site.email}</p>
              <p className="mt-2 text-xs text-cream/40">For documents, floor plans and long questions.</p>
            </a>
          </div>

          {/* direct lines */}
          <div className="mt-6 flex flex-wrap gap-2">
            {agents.filter((a) => !a.placeholder).map((a) => (
              <a
                key={a.id}
                href={waLink(`Assalam-o-Alaikum ${a.name}, I would like to speak about a property.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="pill hover:!border-gold hover:!text-gold"
              >
                {a.name} <span className="text-cream/35">· {a.speciality}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />

      {/* FAQ */}
      <section className="relative bg-graphite py-20 text-ivory sm:py-24" data-nav="dark">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-[var(--gut)] lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow tone="ink">Questions we get</Eyebrow>
            <h2 className="display mt-5 text-[clamp(2rem,5vw,3.6rem)] leading-[0.9]">
              Before you <span className="serif-it text-gold">ask us</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">
              Still unsure? Message the office on WhatsApp — we would rather answer a small question now than a big one
              after you have paid a token.
            </p>
          </div>
          <div className="border-t border-line">
            {faqs.map((f, i) => (
              <div key={f.q} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className="display text-[clamp(1.1rem,2.4vw,1.6rem)] leading-tight">{f.q}</span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 ${open === i ? "rotate-45 border-walnut text-gold" : ""}`}>
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-sm leading-relaxed text-mist">{f.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
