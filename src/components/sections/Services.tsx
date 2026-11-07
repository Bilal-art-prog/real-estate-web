import { motion } from "framer-motion";
import { services } from "../../data/content";
import { useStore } from "../../store/useStore";
import { Eyebrow, SplitLines } from "../ui/Reveal";
import {
  IconChart,
  IconCompass,
  IconHandshake,
  IconHouse,
  IconKey,
  IconScales,
} from "../ui/Icons";

const iconFor: Record<string, any> = {
  key: IconKey,
  house: IconHouse,
  handshake: IconHandshake,
  chart: IconChart,
  compass: IconCompass,
  scales: IconScales,
};

/** Varying spans so the grid reads editorial, not a row of identical cards. */
const spans = [
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-4",
  "lg:col-span-5",
];

export default function Services() {
  const openBooking = useStore((s) => s.openBooking);

  return (
    <section id="services" className="relative overflow-hidden bg-ink py-20 text-cream sm:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 10% 0%, rgba(90,46,34,0.4), transparent 65%), radial-gradient(45% 40% at 95% 100%, rgba(200,161,91,0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Chapter 05 — What we do</Eyebrow>
            <SplitLines
              className="display mt-5 text-[clamp(2.2rem,6vw,5rem)] leading-[0.88]"
              lines={[
                <span key="1">Six things, done</span>,
                <span key="2" className="serif-it text-gold">properly</span>,
              ]}
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/55">
            One team handles the search, the file, the negotiation, the transfer and the years after. No hand-offs to
            strangers, no commission surprises.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {services.map((s, i) => {
            const Icon = iconFor[s.icon] ?? IconKey;
            return (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.85, delay: (i % 3) * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className={`group glass relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-[1.4rem] p-6 sm:p-7 ${spans[i] ?? ""}`}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div className="relative flex items-start justify-between gap-4">
                  {/* looping 3D coin carrying the icon */}
                  <span className="preserve-3d relative grid h-16 w-16 shrink-0 place-items-center" aria-hidden="true">
                    <span
                      className="absolute inset-0 rounded-2xl border border-gold/35 bg-gold/8"
                      style={{
                        animation: `coin-spin ${7 + i}s cubic-bezier(0.45,0,0.55,1) infinite`,
                        transformStyle: "preserve-3d",
                      }}
                    />
                    <Icon className="relative h-7 w-7 text-gold transition-transform duration-700 group-hover:scale-110" />
                  </span>
                  <span className="num text-[0.7rem] text-cream/30">0{i + 1}</span>
                </div>

                <div className="relative mt-8">
                  <h3 className="display text-[clamp(1.7rem,3.4vw,2.4rem)] leading-none">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/60">{s.blurb}</p>
                  <ul className="mt-5 grid gap-1.5 overflow-hidden text-[0.78rem] text-cream/45 transition-all duration-700">
                    {s.bullets.map((b, bi) => (
                      <li
                        key={b}
                        className="flex items-center gap-2 opacity-70 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100"
                        style={{ transitionDelay: `${bi * 55}ms` }}
                      >
                        <span className="h-px w-4 bg-gold/70" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openBooking(null)}
                  className="label relative mt-6 self-start border-b border-transparent pb-1 text-cream/50 transition-colors duration-500 hover:border-gold hover:text-gold"
                >
                  Ask about {s.title.toLowerCase()}
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes coin-spin { 0%{transform:rotateY(0) rotateX(8deg)} 50%{transform:rotateY(180deg) rotateX(-8deg)} 100%{transform:rotateY(360deg) rotateX(8deg)} }`}</style>
    </section>
  );
}
