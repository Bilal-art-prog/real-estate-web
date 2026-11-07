import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "../../data/content";
import { useStore } from "../../store/useStore";
import { buildWhatsAppLink, isEmbeddedFrame, trackWhatsAppClick, waMessages } from "../../lib/whatsapp";
import { IconWhatsApp } from "./Icons";

/**
 * Floating WhatsApp control.
 * A real anchor → top-level navigation in a new tab (mobile: WhatsApp app,
 * desktop: WhatsApp Web). Never an iframe, never window.open().
 */
export default function WhatsAppFab() {
  const pushToast = useStore((s) => s.pushToast);
  const [framed, setFramed] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => setFramed(isEmbeddedFrame()), []);

  const href = buildWhatsAppLink({ message: waMessages.general() });

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-wa="floating_fab"
        onClick={() => {
          trackWhatsAppClick({ placement: "floating_fab" });
          pushToast("Opening WhatsApp in a new tab…");
        }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="group fixed right-4 z-[80] flex items-center gap-3 wa-fab sm:right-7"
        style={{ bottom: "calc(1.25rem + var(--safe-b))" }}
        aria-label="Chat with Bilal Estate on WhatsApp"
      >
        <span
          className={`pointer-events-none hidden items-center rounded-full border border-line bg-obsidian/90 px-4 py-2 text-ivory backdrop-blur transition-all duration-500 md:flex ${
            hover ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
          }`}
        >
          <span className="label">Chat with Bilal Estate</span>
        </span>
        <span className="pulse-ring relative grid h-14 w-14 place-items-center rounded-full bg-wa text-obsidian shadow-[0_16px_44px_-12px_rgba(37,211,102,0.75)] transition-transform duration-500 group-hover:scale-105 sm:h-16 sm:w-16">
          <IconWhatsApp className="h-7 w-7" strokeWidth={1.5} />
        </span>
      </a>

      {/* Preview-shell notice: wa.me refuses to be framed, so explain the block
          instead of letting the visitor think the button is broken. */}
      <AnimatePresence>
        {framed && hover && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-[calc(6.5rem+var(--safe-b))] right-4 z-[80] hidden w-64 rounded-xl border border-line bg-obsidian/92 p-3 text-[0.68rem] leading-relaxed text-mist backdrop-blur md:block sm:right-7"
          >
            You are viewing this site inside a preview frame. WhatsApp blocks being loaded in a frame —
            the link opens in a new browser tab instead.
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}

export function Toasts() {
  const toast = useStore((s) => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 z-[130] w-[min(92vw,26rem)] -translate-x-1/2 rounded-full border border-line bg-obsidian/92 px-6 py-3 text-center text-sm text-ivory backdrop-blur-xl sm:left-7 sm:translate-x-0"
          style={{ bottom: "calc(6rem + var(--safe-b))" }}
          role="status"
          aria-live="polite"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const waNumberLabel = site.phoneDisplay;
