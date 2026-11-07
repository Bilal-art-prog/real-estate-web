import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const IconKey = (p: P) => (
  <svg {...base(p)}>
    <circle cx="7.5" cy="15.5" r="3.6" />
    <path d="M10.1 12.9 20 3" />
    <path d="m16.6 6.4 2 2" />
    <path d="m14.2 8.8 1.7 1.7" />
  </svg>
);

export const IconHouse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.4 10.6 12 3.6l8.6 7" />
    <path d="M5.4 12.3v7.1a1 1 0 0 0 1 1h11.2a1 1 0 0 0 1-1v-7.1" />
    <path d="M9.9 20.4v-5.2h4.2v5.2" />
  </svg>
);

export const IconHandshake = (p: P) => (
  <svg {...base(p)}>
    <path d="m2.6 12.4 3.2-3.2 3 1 2.4-1.3a2 2 0 0 1 2 0l2.3 1.3" />
    <path d="m21.4 12.4-3.2 3.2-1.6-1-1.6 1.6a1.5 1.5 0 0 1-2.1 0l-.6-.6a1.5 1.5 0 0 1-2.1 0l-.5-.5a1.5 1.5 0 0 1-2.1 0L6 14" />
    <path d="M13.4 8.9 11 11.3a1.4 1.4 0 0 0 2 2l1.6-1.6" />
  </svg>
);

export const IconChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.4 20.2h17.2" />
    <path d="M6.6 20.2V13" />
    <path d="M11 20.2V7.6" />
    <path d="M15.4 20.2v-4.6" />
    <path d="M19.8 20.2V4.4" />
    <path d="m4.6 9.4 5.2-4.2 4 2.6 5.4-5" />
  </svg>
);

export const IconCompass = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.4 8.6-1.9 4.9-4.9 1.9 1.9-4.9z" />
  </svg>
);

export const IconScales = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.6v16.8" />
    <path d="M7 20.4h10" />
    <path d="M4.4 7.6h15.2" />
    <path d="M4.4 7.6 1.8 13.4a3 3 0 0 0 5.2 0z" />
    <path d="M19.6 7.6 17 13.4a3 3 0 0 0 5.2 0z" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.4 20.6 4.7 16A8.2 8.2 0 1 1 8 19.3z" />
    <path d="M9 8.6c.3-.1.6 0 .8.3l.7 1.2c.1.3.1.6-.1.8l-.4.5c-.1.2-.2.4-.1.6a5.6 5.6 0 0 0 2.4 2.4c.2.1.4 0 .6-.1l.5-.4c.2-.2.5-.2.8-.1l1.2.7c.3.2.4.5.3.8-.3.9-1.3 1.5-2.2 1.3A9.3 9.3 0 0 1 7.7 10.8c-.2-.9.4-1.9 1.3-2.2" />
  </svg>
);

export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconTikTok = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.4 3.4v10.9a3.5 3.5 0 1 1-3.5-3.5c.3 0 .6 0 .9.1" />
    <path d="M14.4 3.4c.4 2.3 2 3.9 4.3 4.2" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="5" width="18.4" height="14" rx="2" />
    <path d="m3.4 6.6 8.6 6.2 8.6-6.2" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.2 3.6h3l1.5 3.8-2 1.4a11.4 11.4 0 0 0 5.5 5.5l1.4-2 3.8 1.5v3a1.8 1.8 0 0 1-2 1.8A16.6 16.6 0 0 1 4.4 5.6a1.8 1.8 0 0 1 1.8-2" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16" />
    <path d="m14.4 6.4 5.6 5.6-5.6 5.6" />
  </svg>
);

export const IconArrowUpRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7" />
    <path d="M8.6 7H17v8.4" />
  </svg>
);

export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.4-4.4-7.4-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.4 2.4C19.4 15.6 12 20 12 20" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.6 5.6 18.4 18.4M18.4 5.6 5.6 18.4" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.6 7.6h16.8M3.6 12h16.8M3.6 16.4h11" />
  </svg>
);

export const IconBed = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.2 19v-9.4" />
    <path d="M3.2 14h17.6v5" />
    <path d="M20.8 14v-2.2a2 2 0 0 0-2-2h-7.4V14" />
    <circle cx="6.8" cy="11.6" r="1.6" />
  </svg>
);

export const IconBath = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.4 12.6h17.2v2.2a4 4 0 0 1-4 4H7.4a4 4 0 0 1-4-4z" />
    <path d="M6.4 12.6V6.2a2.2 2.2 0 0 1 4.4 0" />
    <path d="M6.6 18.8 5.8 21M17.4 18.8l.8 2.2" />
  </svg>
);

export const IconArea = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.6" />
    <path d="M8 3.6v3.2M3.6 8h3.2M16 20.4v-3.2M20.4 16h-3.2" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s6.6-6 6.6-10.6a6.6 6.6 0 1 0-13.2 0C5.4 15 12 21 12 21" />
    <circle cx="12" cy="10.2" r="2.5" />
  </svg>
);

export const IconGrid = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.6" y="3.6" width="7" height="7" rx="1" />
    <rect x="13.4" y="3.6" width="7" height="7" rx="1" />
    <rect x="3.6" y="13.4" width="7" height="7" rx="1" />
    <rect x="13.4" y="13.4" width="7" height="7" rx="1" />
  </svg>
);

export const IconMap = (p: P) => (
  <svg {...base(p)}>
    <path d="m3.4 6.6 5.8-2.4 5.6 2.4 5.8-2.4v13.2l-5.8 2.4-5.6-2.4-5.8 2.4z" />
    <path d="M9.2 4.2v13.2M14.8 6.6v13.2" />
  </svg>
);

export const IconSliders = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7.4h10M18 7.4h2M4 16.6h4M12 16.6h8" />
    <circle cx="16" cy="7.4" r="2" />
    <circle cx="10" cy="16.6" r="2" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="m12 3.6 2.5 5.3 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" />
  </svg>
);

export const IconQuote = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M9.6 5.6C6.4 7 4.6 9.6 4.6 13v5.4h6.2V12H7.6c0-2 .8-3.4 2.8-4.4zm9 0c-3.2 1.4-5 4-5 7.4v5.4h6.2V12h-3.2c0-2 .8-3.4 2.8-4.4z" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="m10.2 8.6 5.4 3.4-5.4 3.4z" fill="currentColor" />
  </svg>
);

export const IconSound = ({ muted, ...p }: P & { muted?: boolean }) => (
  <svg {...base(p)}>
    <path d="M4.4 9.4h2.8L11 6.2v11.6L7.2 14.6H4.4z" />
    {muted ? <path d="m15.4 9.6 4.2 4.8M19.6 9.6l-4.2 4.8" /> : <path d="M14.8 9a4.2 4.2 0 0 1 0 6M17.4 6.8a7.6 7.6 0 0 1 0 10.4" />}
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.8 12.6 4.6 4.6L19.4 7" />
  </svg>
);

export const IconSun = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.6 8.6 0 1 0 10.2 10.2" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m8.4 5.6 6.4 6.4-6.4 6.4" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.6" y="5.4" width="16.8" height="15" rx="2" />
    <path d="M3.6 10h16.8M8.4 3.4v4M15.6 3.4v4" />
  </svg>
);

export const Monogram = ({ className = "", animate = false }: { className?: string; animate?: boolean }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <path
      className={animate ? "mono-arch" : undefined}
      d="M10 54V10h18c9 0 14 5 14 12 0 5-3 8-7 10 5 1 9 5 9 11 0 7-6 11-16 11H10Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M19 31h9M19 44h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="49" cy="15" r="3.2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
