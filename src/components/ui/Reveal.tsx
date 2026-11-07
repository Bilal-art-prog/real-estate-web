import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useDevice";
import { useMagnetic } from "../../hooks/useMagnetic";
import { cn } from "../../lib/utils";

/* ── Reveal wrapper: adds `is-in` when scrolled into view ─────────────── */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  variant = "fade-up",
  threshold = 0.16,
}: {
  children: ReactNode;
  className?: string;
  as?: any;
  delay?: number;
  variant?: "fade-up" | "clip-reveal" | "none";
  threshold?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });
  return (
    <Tag
      ref={ref}
      className={cn(variant !== "none" && variant, inView && "is-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ── Masked line-by-line headline reveal ──────────────────────────────── */
export function SplitLines({
  lines,
  className,
  lineClassName,
  as: Tag = "h2",
  stagger = 95,
  start = 0,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  as?: any;
  stagger?: number;
  start?: number;
}) {
  const { ref, inView } = useInView<HTMLHeadingElement>({ threshold: 0.2 });
  return (
    <Tag ref={ref} className={cn(inView && "is-in", className)}>
      {lines.map((l, i) => (
        <span key={i} className={cn("mask-line", lineClassName)}>
          <span style={{ transitionDelay: `${start + i * stagger}ms` }}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/* ── Animated counter ─────────────────────────────────────────────────── */
export function Counter({
  to,
  duration = 1800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [val, setVal] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(to * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {prefix}
      {val.toLocaleString("en-PK", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ── Magnetic button / link ───────────────────────────────────────────── */
type ButtonProps = {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost" | "gold" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
};

/** Primary = champagne-gold sheen with obsidian text; secondary = 1px gold outline. */
const variants: Record<string, string> = {
  solid:
    "bg-gradient-to-r from-gold via-gold-soft to-gold bg-[length:220%_100%] text-obsidian border-transparent hover:bg-[position:100%_0] hover:text-obsidian",
  gold:
    "bg-gradient-to-r from-gold via-gold-soft to-gold bg-[length:220%_100%] text-obsidian border-transparent hover:bg-[position:100%_0]",
  outline: "bg-transparent text-ivory border-line hover:border-gold hover:text-gold",
  dark: "bg-obsidian text-ivory border-line hover:bg-emerald-deep hover:border-emerald",
  ghost: "bg-transparent text-ivory border-transparent hover:text-gold px-0",
  whatsapp: "bg-wa text-obsidian border-transparent hover:opacity-90",
};

const sizes: Record<string, string> = {
  sm: "text-[0.62rem] px-4 py-2.5",
  md: "text-[0.68rem] px-6 py-3.5",
  lg: "text-[0.72rem] px-8 py-4.5",
};

export function Button({
  children,
  to,
  href,
  onClick,
  variant = "outline",
  size = "md",
  className,
  icon,
  ariaLabel,
  type = "button",
  disabled,
  external,
}: ButtonProps) {
  const mag = useMagnetic<HTMLSpanElement>(0.22, disabled);
  const cls = cn(
    "group/btn relative inline-flex items-center justify-center gap-2.5 rounded-full border",
    "label transition-[background,color,border-color,transform] duration-500 will-change-transform",
    "disabled:opacity-40 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );

  const inner = (
    <span ref={mag} className="inline-flex items-center gap-2.5">
      <span className="relative z-10">{children}</span>
      {icon && (
        <span className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1">
          {icon}
        </span>
      )}
    </span>
  );

  if (to) return <Link to={to} className={cls} aria-label={ariaLabel} onClick={onClick}>{inner}</Link>;
  if (href)
    return (
      <a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {inner}
      </a>
    );
  return (
    <button type={type} className={cls} onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
      {inner}
    </button>
  );
}

/* ── Marquee ──────────────────────────────────────────────────────────── */
export function Marquee({
  items,
  duration = 44,
  className,
  separator = "◆",
}: {
  items: ReactNode[];
  duration?: number;
  className?: string;
  separator?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="marquee-track" style={{ ["--dur" as any]: `${duration}s` }}>
        {doubled.map((it, i) => (
          <span key={i} className="flex shrink-0 items-center gap-6 pr-6">
            {it}
            <span className="text-gold/50 text-[0.6rem]">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Image with clip-path reveal + graceful failure ───────────────────── */
export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  ken = true,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  ken?: boolean;
  priority?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 });
  const [failed, setFailed] = useState(false);
  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-ink-soft", inView && "is-in", className)}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg,#2a2320 0%,#4a3a2e 45%,#1a1614 100%)",
        }}
        aria-hidden="true"
      />
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn(
            "clip-reveal relative h-full w-full object-cover",
            ken && "ken",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}

/* ── Small caps eyebrow with a growing rule ───────────────────────────── */
export function Eyebrow({ children, className, tone = "gold" }: { children: ReactNode; className?: string; tone?: "gold" | "cream" | "ink" }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.5 });
  return (
    <div ref={ref} className={cn("flex items-center gap-3", inView && "is-in", className)}>
      <span
        className={cn(
          "line-grow block h-px w-10 origin-left",
          tone === "gold" && "bg-gold",
          tone === "cream" && "bg-ivory/60",
          // dark-only theme: the old "ink" tone now renders as muted ivory/gold
          tone === "ink" && "bg-gold/70",
        )}
      />
      <span className={cn("label", tone === "ink" ? "text-mist" : tone === "gold" ? "text-gold" : "text-ivory/70")}>
        {children}
      </span>
    </div>
  );
}
