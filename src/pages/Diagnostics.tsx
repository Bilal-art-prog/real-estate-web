import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../lib/siteConfig";
import { buildWhatsAppLink, isEmbeddedFrame, waMessages } from "../lib/whatsapp";
import { properties } from "../data/properties";
import { Eyebrow } from "../components/ui/Reveal";
import { IconArrowRight, IconCheck } from "../components/ui/Icons";
import { cn } from "../lib/utils";

interface Row {
  where: string;
  href: string;
  target: string;
  rel: string;
  kind: string;
}

/**
 * #/diagnostics — a live audit of every external control on the page.
 * It reads the REAL rendered DOM (not the source), so it reports the exact URL
 * each button will open in the environment you are actually looking at.
 */
export default function Diagnostics() {
  const [rows, setRows] = useState<Row[]>([]);
  const [env, setEnv] = useState({ framed: false, href: "", referrer: "", ua: "" });
  const [copied, setCopied] = useState<string | null>(null);

  const scan = useCallback(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        'a[data-wa], a[data-social], a[href^="https://wa.me"], a[href^="tel:"], a[href^="mailto:"], a[href*="instagram.com"], a[href*="tiktok.com"]',
      ),
    );
    setRows(
      nodes.map((a) => ({
        where: a.dataset.wa ?? a.dataset.social ?? a.getAttribute("aria-label") ?? a.textContent?.trim().slice(0, 34) ?? "anchor",
        href: a.href,
        target: a.target || "(same frame)",
        rel: a.rel || "(none)",
        kind: a.href.startsWith("https://wa.me")
          ? "WhatsApp"
          : a.href.includes("instagram.com")
            ? "Instagram"
            : a.href.includes("tiktok.com")
              ? "TikTok"
              : a.href.startsWith("tel:")
                ? "Call"
                : a.href.startsWith("mailto:")
                  ? "Email"
                  : "External",
      })),
    );
    setEnv({
      framed: isEmbeddedFrame(),
      href: window.location.href,
      referrer: document.referrer || "(none)",
      ua: navigator.userAgent,
    });
  }, []);

  useEffect(() => {
    scan();
    const t = window.setTimeout(scan, 700);
    return () => window.clearTimeout(t);
  }, [scan]);

  const pine = properties[0];
  const configured = [
    { label: "WhatsApp — bare", url: buildWhatsAppLink({}) },
    { label: "WhatsApp — hero CTA (viewing)", url: buildWhatsAppLink({ message: waMessages.viewing() }) },
    {
      label: `WhatsApp — ${pine.title}`,
      url: buildWhatsAppLink({
        message: waMessages.property({
          title: pine.title,
          location: `${pine.society}, ${pine.city}`,
          priceLabel: "PKR 9.2 Crore",
          slug: pine.slug,
        }),
      }),
    },
    { label: "Instagram", url: siteConfig.social.instagram.url },
    { label: "TikTok", url: siteConfig.social.tiktok.url },
    { label: "Call", url: `tel:${siteConfig.phone.tel}` },
    { label: "Email", url: `mailto:${siteConfig.email}` },
  ];

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(url);
      } catch {
        setCopied(null);
      }
      document.body.removeChild(ta);
    }
    window.setTimeout(() => setCopied(null), 1800);
  };

  const waBad = rows.filter((r) => r.kind === "WhatsApp" && !r.href.startsWith("https://wa.me/923450655699"));
  const socialBad = rows.filter(
    (r) => (r.kind === "Instagram" || r.kind === "TikTok") && !/^https:\/\/(www\.)?(instagram|tiktok)\.com/.test(r.href),
  );
  const frameBad = rows.filter((r) => r.kind !== "Call" && r.kind !== "Email" && r.target !== "_blank");
  const relBad = rows.filter((r) => r.target === "_blank" && !r.rel.includes("noopener"));

  return (
    <main className="relative min-h-[100svh] bg-obsidian pt-28 pb-24 text-ivory">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36vh]" style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(23,98,79,0.4), transparent 70%)" }} aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-[var(--gut)]">
        <Eyebrow>Link diagnostics</Eyebrow>
        <h1 className="display mt-5 text-[clamp(2.2rem,6vw,4.4rem)] leading-[0.9]">
          What every button <span className="serif-it text-gold">actually opens</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">
          This page reads the live DOM in the environment you are viewing right now. Build stamp:{" "}
          <span className="num text-gold">{siteConfig.buildStamp}</span>. If the stamp differs from the one in
          <code className="mx-1 text-ivory">src/lib/siteConfig.ts</code>, you are looking at a stale cached artifact.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={scan} className="pill !min-h-11">
            Re-scan now
          </button>
          <Link to="/" className="pill !min-h-11">
            Back to the site <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* verdict */}
        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "WhatsApp destinations wrong", v: waBad.length },
            { k: "Social destinations wrong", v: socialBad.length },
            { k: "Opening in this frame", v: frameBad.length },
            { k: "Missing rel=noopener", v: relBad.length },
          ].map((c) => (
            <div key={c.k} className={cn("rounded-xl border p-4", c.v === 0 ? "border-emerald bg-emerald/15" : "border-alert bg-alert/15")}>
              <p className="label text-mist/80">{c.k}</p>
              <p className={cn("display num mt-2 text-3xl", c.v === 0 ? "text-gold" : "text-alert")}>{c.v}</p>
            </div>
          ))}
        </section>

        {/* environment */}
        <section className="mt-8 rounded-[1.2rem] border border-line bg-graphite p-6">
          <h2 className="label text-gold">Environment</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Item k="Running inside a frame / preview shell" v={env.framed ? "YES — external sites may refuse to load here" : "No — normal browser tab"} warn={env.framed} />
            <Item k="Page URL" v={env.href} />
            <Item k="Referrer" v={env.referrer} />
            <Item k="Anchors found on this route" v={String(rows.length)} />
          </dl>
          {env.framed && (
            <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-xs leading-relaxed text-mist">
              <strong className="text-ivory">This is the cause of ERR_BLOCKED_BY_RESPONSE.</strong> wa.me redirects to
              api.whatsapp.com, which sends <code className="text-gold">X-Frame-Options: DENY</code>; Instagram and TikTok
              send the same. Inside a preview frame the shell loads them in-frame, so the browser blocks the response.
              Copy a URL below and paste it into a normal browser tab (or open the deployed domain directly) — the
              buttons on the live site already request a new top-level tab.
            </p>
          )}
        </section>

        {/* configured destinations */}
        <section className="mt-8 rounded-[1.2rem] border border-line bg-graphite p-6">
          <h2 className="label text-gold">Configured destinations (authoritative)</h2>
          <ul className="mt-4 grid gap-2">
            {configured.map((c) => (
              <li key={c.label} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-obsidian/45 px-4 py-3">
                <span className="label w-52 shrink-0 text-mist/80">{c.label}</span>
                <code className="min-w-0 flex-1 break-all text-[0.72rem] text-ivory">{c.url}</code>
                <button type="button" onClick={() => copy(c.url)} className="pill !min-h-9 !px-3 !py-1.5 !text-[0.55rem]">
                  {copied === c.url ? <><IconCheck className="h-3 w-3" /> Copied</> : "Copy"}
                </button>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="pill !min-h-9 !px-3 !py-1.5 !text-[0.55rem]">
                  Open
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* live audit */}
        <section className="mt-8 overflow-hidden rounded-[1.2rem] border border-line">
          <h2 className="label bg-graphite px-6 py-4 text-gold">Live DOM audit — {rows.length} controls on this route</h2>
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full min-w-[46rem] border-collapse text-left text-xs">
              <thead className="bg-graphite text-mist">
                <tr>{["Placement", "Kind", "Resolved href", "target", "rel"].map((h) => <th key={h} className="label px-4 py-3 font-normal">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-line bg-obsidian/40 align-top">
                    <td className="px-4 py-3 text-ivory">{r.where}</td>
                    <td className="px-4 py-3 text-gold">{r.kind}</td>
                    <td className="max-w-[22rem] break-all px-4 py-3 text-mist">{r.href}</td>
                    <td className={cn("px-4 py-3", r.target === "_blank" ? "text-ivory" : "text-alert")}>{r.target}</td>
                    <td className={cn("px-4 py-3", r.rel.includes("noopener") ? "text-ivory" : "text-alert")}>{r.rel}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-mist">No anchors found — re-scan after the page settles.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="bg-graphite px-6 py-4 text-[0.7rem] leading-relaxed text-mist">
            Property cards, the map drawer and the detail-page buttons only exist on their own routes — open{" "}
            <Link to="/properties" className="text-gold link-underline">/properties</Link>, then return here and press
            <span className="mx-1 text-ivory">Re-scan</span> to include them.
          </p>
        </section>
      </div>
    </main>
  );
}

function Item({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-obsidian/45 px-4 py-3">
      <dt className="label text-mist/70">{k}</dt>
      <dd className={cn("mt-1.5 break-all text-[0.78rem]", warn ? "text-alert" : "text-ivory")}>{v}</dd>
    </div>
  );
}
