import { Link } from "react-router-dom";
import { Button, Eyebrow } from "../components/ui/Reveal";
import { IconArrowRight, IconWhatsApp } from "../components/ui/Icons";
import { buildWhatsAppLink, trackWhatsAppClick, waMessages } from "../lib/whatsapp";

/** 404 — an empty room, dark-luxe. */
export default function NotFound() {
  const wa = buildWhatsAppLink({ message: waMessages.general() });
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-obsidian px-[var(--gut)] py-28 text-ivory">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(55% 50% at 50% 38%, rgba(23,98,79,0.45), transparent 66%)" }}
        aria-hidden="true"
      />

      {/* empty room: an arch, a floor line and one pool of light */}
      <svg
        viewBox="0 0 420 300"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(94vw,48rem)] -translate-x-1/2 -translate-y-1/2 opacity-40"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="floorfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M210 26 380 118v130L210 340 40 248V118Z" fill="none" stroke="#17624F" strokeWidth="1.2" />
        <path d="M40 118 210 210l170-92" fill="none" stroke="#17624F" strokeWidth="1.2" />
        <path d="M210 210v130" stroke="#17624F" strokeWidth="1.2" />
        <path d="M150 196v-58a60 60 0 0 1 120 0v58" fill="none" stroke="#C9A96E" strokeWidth="1.4" />
        <ellipse cx="210" cy="252" rx="62" ry="18" fill="url(#floorfade)" />
      </svg>

      <div className="relative max-w-xl text-center">
        <Eyebrow className="justify-center">Error 404 — the room is empty</Eyebrow>
        <h1 className="display mt-6 text-[clamp(3.4rem,14vw,9rem)] leading-[0.82]">
          No one <span className="serif-it text-gold">home</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-mist">
          This page has been sold, let, or never existed. The floor is bare and the keys are back at the desk — let us
          show you something that is actually available.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to="/properties" variant="gold" size="lg" icon={<IconArrowRight className="h-4 w-4" />}>
            Browse live listings
          </Button>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            data-wa="notfound"
            onClick={() => trackWhatsAppClick({ placement: "notfound" })}
            className="pill !min-h-14 !px-7 !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
          >
            <IconWhatsApp className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </div>
        <p className="label mt-10 text-mist/60">
          Or start again —{" "}
          <Link to="/" className="link-underline text-gold">
            back to the entrance
          </Link>
        </p>
      </div>
    </main>
  );
}
