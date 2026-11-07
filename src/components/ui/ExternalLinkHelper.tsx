import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../../lib/siteConfig";
import { buildWhatsAppLink, isEmbeddedFrame, waMessages } from "../../lib/whatsapp";
import { IconClose, IconWhatsApp } from "../ui/Icons";

/**
 * Only ever renders inside a framed preview shell (never on the real site).
 *
 * WhatsApp / Instagram / TikTok all send X-Frame-Options: DENY, so a preview
 * pane that loads them in-frame shows ERR_BLOCKED_BY_RESPONSE no matter how
 * correct the href is. This gives the visitor a path that always works: the
 * exact URL, visible and copyable, plus a normal new-tab anchor.
 */
export default function ExternalLinkHelper() {
  const [framed, setFramed] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!isEmbeddedFrame()) return;
    setFramed(true);
    try {
      setOpen(sessionStorage.getItem("be.helper") !== "off");
    } catch {
      setOpen(true);
    }
  }, []);

  if (!framed || !open) return null;

  const rows = [
    { label: "WhatsApp", url: buildWhatsAppLink({ message: waMessages.general() }), icon: true },
    { label: "Instagram", url: siteConfig.social.instagram.url, icon: false },
    { label: "TikTok", url: siteConfig.social.tiktok.url, icon: false },
  ];

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(url);
      } catch {
        setCopied("select");
      }
      document.body.removeChild(ta);
    }
    window.setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className="fixed left-4 z-[85] w-[min(92vw,23rem)] rounded-2xl border border-line bg-obsidian/95 p-4 backdrop-blur-xl sm:left-7"
      style={{ bottom: "calc(1.25rem + var(--safe-b))" }}
      role="note"
      aria-label="External links are blocked inside this preview frame"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-alert" />
        <div className="min-w-0">
          <p className="label text-gold">Preview frame detected</p>
          <p className="mt-2 text-xs leading-relaxed text-mist">
            This page is running inside another site's frame. WhatsApp, Instagram and TikTok refuse to be framed, so the
            browser shows <span className="text-ivory">ERR_BLOCKED_BY_RESPONSE</span>. The links below are correct —
            copy one, or open the site in a normal browser tab.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            try {
              sessionStorage.setItem("be.helper", "off");
            } catch {
              /* ignore */
            }
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-mist transition-colors hover:border-gold hover:text-gold"
          aria-label="Dismiss"
        >
          <IconClose className="h-3.5 w-3.5" />
        </button>
      </div>

      <ul className="mt-3 grid gap-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2 rounded-lg border border-line bg-graphite/70 px-3 py-2">
            {r.icon && <IconWhatsApp className="h-4 w-4 shrink-0 text-wa" />}
            <span className="label w-20 shrink-0 text-mist/80">{r.label}</span>
            <code className="min-w-0 flex-1 truncate text-[0.66rem] text-ivory/85">{r.url}</code>
            <button type="button" onClick={() => copy(r.url)} className="pill !min-h-8 !px-2.5 !py-1 !text-[0.5rem]">
              {copied === r.url ? "Copied" : "Copy"}
            </button>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="pill !min-h-8 !px-2.5 !py-1 !text-[0.5rem]">
              Open
            </a>
          </li>
        ))}
      </ul>

      <Link to="/diagnostics" className="label mt-3 inline-block text-gold link-underline">
        Full link diagnostics →
      </Link>
    </div>
  );
}
