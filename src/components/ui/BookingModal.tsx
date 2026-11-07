import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { site } from "../../data/content";
import { useStore } from "../../store/useStore";
import { saveLead } from "../../lib/leads";
import { buildWhatsAppLink, trackWhatsAppClick, waMessages } from "../../lib/whatsapp";
import { formatPKR } from "../../lib/units";
import { lockScroll } from "../../lib/scroll";
import OwnerPortrait from "./OwnerPortrait";
import { IconCheck, IconClose, IconWhatsApp } from "./Icons";

const times = ["10:00", "11:30", "13:00", "15:00", "16:30", "18:00", "19:30"];

export default function BookingModal() {
  const booking = useStore((s) => s.booking);
  const closeBooking = useStore((s) => s.closeBooking);
  const pushToast = useStore((s) => s.pushToast);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "16:30",
    mode: "In person",
    budget: "",
    message: "",
    website: "", // honeypot
  });

  const open = !!booking;
  const property = booking?.property;

  useEffect(() => {
    lockScroll(open);
    if (open) {
      setSaved(false);
      setError(null);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBooking();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeBooking]);

  const waHref = useMemo(
    () =>
      buildWhatsAppLink({
        message: waMessages.booking({
          name: form.name,
          phone: form.phone,
          date: form.date,
          time: form.time,
          mode: form.mode,
          budget: form.budget,
          message: form.message,
          propertyTitle: property ? `${property.title}, ${property.society}` : undefined,
          agentName: booking?.agentName,
        }),
      }),
    [form, property, booking?.agentName],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveLead({
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      interest: form.mode,
      budget: form.budget || undefined,
      message: form.message || undefined,
      propertyId: property?.id,
      propertyTitle: property?.title,
      source: "booking_modal",
      website: form.website,
    });
    if (!res.ok) {
      setError(res.error ?? "Could not save the request.");
      return;
    }
    setError(null);
    setSaved(true);
    pushToast("Request saved — continue on WhatsApp to confirm your slot");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-obsidian/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Book a private viewing"
          onClick={closeBooking}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-graphite/92 p-6 text-ivory sm:rounded-3xl sm:p-10"
            data-lenis-prevent
          >
            <button
              type="button"
              onClick={closeBooking}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold"
              aria-label="Close"
            >
              <IconClose className="h-4 w-4" />
            </button>

            {/* owner in the header, as briefed */}
            <div className="flex items-center gap-4">
              <OwnerPortrait size="sm" caption={false} />
              <div>
                <p className="label text-gold">Private viewing with {site.founder}</p>
                <h2 className="display mt-2 text-[clamp(1.7rem,4.4vw,2.6rem)] leading-none">
                  {property ? property.title : "Walk through with us"}
                </h2>
              </div>
            </div>

            <p className="mt-4 max-w-lg text-sm text-mist">
              {property
                ? `${property.sector}, ${property.society}, ${property.city} · ${formatPKR(property.price, { monthly: !!property.monthly })} · ${property.status}`
                : "Tell us the date and time that suits you. Your request is saved, then you continue the conversation in WhatsApp."}
            </p>

            <form onSubmit={submit} className="mt-8 grid gap-6 sm:grid-cols-2">
              {/* honeypot — hidden from people, irresistible to bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="absolute h-0 w-0 opacity-0"
                aria-hidden="true"
              />

              <label className="block">
                <span className="label text-mist/70">Full name *</span>
                <input
                  required
                  className="field mt-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ahmed Khan"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="label text-mist/70">Phone / WhatsApp *</span>
                <input
                  required
                  type="tel"
                  className="field mt-2"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03xx xxxxxxx"
                  autoComplete="tel"
                />
              </label>
              <label className="block">
                <span className="label text-mist/70">Email</span>
                <input
                  type="email"
                  className="field mt-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="label text-mist/70">Budget</span>
                <select className="field mt-2" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
                  <option value="">Select a range</option>
                  <option>Under PKR 1 Crore</option>
                  <option>PKR 1 – 3 Crore</option>
                  <option>PKR 3 – 6 Crore</option>
                  <option>PKR 6 – 15 Crore</option>
                  <option>PKR 15 Crore +</option>
                </select>
              </label>
              <label className="block">
                <span className="label text-mist/70">Preferred date *</span>
                <input
                  required
                  type="date"
                  className="field mt-2"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <div className="block">
                <span className="label text-mist/70">Time</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {times.map((tm) => (
                    <button
                      key={tm}
                      type="button"
                      onClick={() => setForm({ ...form, time: tm })}
                      className="pill !min-h-9 !px-3 !py-1.5 !text-[0.62rem] !tracking-normal"
                      data-active={form.time === tm}
                    >
                      {tm}
                    </button>
                  ))}
                </div>
              </div>
              <div className="block sm:col-span-2">
                <span className="label text-mist/70">How would you like to view it?</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["In person", "Live video tour", "Photo pack first"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, mode: m })}
                      className="pill !min-h-9 !text-[0.62rem] !tracking-normal"
                      data-active={form.mode === m}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block sm:col-span-2">
                <span className="label text-mist/70">Anything we should know?</span>
                <textarea
                  rows={3}
                  className="field mt-2 resize-none"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Landing from Dubai on the 14th, would like two more options nearby…"
                />
              </label>

              {error && (
                <p className="text-sm text-alert sm:col-span-2" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                {!saved ? (
                  <button
                    type="submit"
                    className="pill !min-h-12 !px-8 !bg-gradient-to-r !from-gold !via-gold-soft !to-gold !text-obsidian !border-transparent"
                  >
                    Save my viewing request
                  </button>
                ) : (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-wa="booking_modal_continue"
                    onClick={() => trackWhatsAppClick({ placement: "booking_modal", propertyId: property?.id, propertyTitle: property?.title })}
                    className="pill !min-h-12 !px-8 !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
                  >
                    <IconWhatsApp className="h-4 w-4" /> Continue on WhatsApp
                  </a>
                )}
                <a href={`mailto:${site.email}?subject=${encodeURIComponent(`Viewing request — ${property?.title ?? "General"}`)}`} className="pill justify-center">
                  Or email {site.email}
                </a>
              </div>

              <AnimatePresence>
                {saved && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 text-sm text-gold sm:col-span-2"
                  >
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    Saved locally. Press <strong className="mx-1">Continue on WhatsApp</strong> — the message is already
                    typed with your details, you only press send.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
