import { useState } from "react";
import { siteConfig } from "../../lib/siteConfig";
import { cn } from "../../lib/utils";

/**
 * The owner's real portrait, arch-masked (echoing the arched doorways in the
 * interior photography) with a 1px champagne-gold border.
 *
 * If public/images/owner/bilal.jpg has not been supplied yet, a neutral
 * silhouette is shown instead and the placeholder is flagged — no generated
 * face is ever substituted for the real one.
 */
export default function OwnerPortrait({
  className,
  size = "md",
  caption = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  caption?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  const dims = size === "sm" ? "h-16 w-16" : size === "lg" ? "aspect-[4/5] w-full" : "h-28 w-[5.6rem]";

  return (
    <figure className={cn("relative m-0 shrink-0", className)}>
      <div
        className={cn(
          "arch-mask relative overflow-hidden border border-gold/60 bg-graphite",
          "shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]",
          dims,
        )}
      >
        {!missing ? (
          <img
            src={siteConfig.owner.photo}
            alt={siteConfig.owner.photoAlt}
            width={400}
            height={500}
            loading="lazy"
            decoding="async"
            onError={() => setMissing(true)}
            className="h-full w-full object-cover object-[50%_28%] saturate-[0.92] contrast-[1.04]"
          />
        ) : (
          <Silhouette />
        )}
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-ivory/10" />
      </div>
      {caption && missing && (
        <figcaption className="todo mt-2 max-w-[12rem] text-[0.58rem] leading-snug tracking-wide">
          {siteConfig.owner.photoFallbackNote}
        </figcaption>
      )}
    </figure>
  );
}

function Silhouette() {
  return (
    <div
      className="grid h-full w-full place-items-center"
      style={{ background: "linear-gradient(160deg,#0E3B30 0%,#121917 55%,#0A0D0C 100%)" }}
      role="img"
      aria-label="Owner portrait not supplied yet — placeholder silhouette"
    >
      <svg viewBox="0 0 80 100" className="h-[86%] w-auto text-gold/35" fill="none" aria-hidden="true">
        <circle cx="40" cy="32" r="15" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 96c2-18 13-28 28-28s26 10 28 28" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
