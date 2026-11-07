import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Scroll-progress registry.
 * Components inside a WebGL `useFrame` read these numbers directly instead of
 * subscribing to React state — that keeps scroll-driven camera moves at 60fps
 * with zero re-renders (the main cause of "jumpy" camera bugs).
 */
export const progress: Record<string, number> = {
  hero: 0,
  walk: 0,
  featured: 0,
  iso: 0,
  finale: 0,
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;
let tickerAdded = false;

export function getLenis() {
  return lenis;
}

export function initSmoothScroll() {
  if (typeof window === "undefined") return;
  if (lenis || prefersReducedMotion()) return;

  lenis = new Lenis({
    duration: 1.15,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.5,
    smoothWheel: true,
    syncTouch: false,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);

  if (!tickerAdded) {
    gsap.ticker.add((time) => lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    tickerAdded = true;
  }
}

export function destroySmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate });
  else window.scrollTo(0, 0);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export function scrollToTarget(target: string | number, offset = -70) {
  if (typeof target === "string" && !document.querySelector(target)) return;
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.5 });
  else if (typeof target === "string") {
    const el = document.querySelector(target);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
  } else window.scrollTo({ top: target, behavior: "smooth" });
}

export function lockScroll(locked: boolean) {
  if (!lenis) {
    document.body.style.overflow = locked ? "hidden" : "";
    return;
  }
  if (locked) lenis.stop();
  else lenis.start();
  document.body.style.overflow = locked ? "hidden" : "";
}

/** Bind a ScrollTrigger that writes 0→1 into `progress[key]`. */
export function bindProgress(
  key: string,
  trigger: Element | null,
  opts: { start?: string; end?: string; once?: boolean } = {},
) {
  if (!trigger || prefersReducedMotion()) return null;
  return ScrollTrigger.create({
    trigger,
    start: opts.start ?? "top top",
    end: opts.end ?? "bottom bottom",
    onUpdate: (self) => {
      progress[key] = self.progress;
    },
    onRefresh: (self) => {
      progress[key] = self.progress;
    },
    invalidateOnRefresh: true,
  });
}

/** Discrete "stop index" subscription — updates React state only when it changes. */
export function onProgressChange(key: string, cb: (p: number) => void) {
  const handler = () => cb(progress[key]);
  gsap.ticker.add(handler);
  return () => gsap.ticker.remove(handler);
}

export { gsap, ScrollTrigger };
