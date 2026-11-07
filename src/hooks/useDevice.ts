import { useEffect, useMemo, useState } from "react";
import { useStore, type Tier } from "../store/useStore";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const mobile = coarse && small;

  if (mobile && (cores <= 4 || mem <= 4)) return "low";
  if (mobile || cores <= 4 || mem <= 4) return "mid";
  return "high";
}

/** Detects tier + WebGL once and pushes it into the store. */
export function useDeviceBootstrap() {
  const setTier = useStore((s) => s.setTier);
  const setWebgl = useStore((s) => s.setWebgl);
  const tier = useStore((s) => s.tier);
  const webgl = useStore((s) => s.webgl);

  useEffect(() => {
    setTier(detectTier());
    setWebgl(detectWebGL());
    const onResize = () => setTier(detectTier());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [setTier, setWebgl]);

  return useMemo(() => ({ tier, webgl }), [tier, webgl]);
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function useInView<T extends HTMLElement>(opts?: { threshold?: number; once?: boolean; rootMargin?: string }) {
  const [ref, setRef] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            if (opts?.once !== false) io.unobserve(e.target);
          } else if (opts?.once === false) {
            setInView(false);
          }
        });
      },
      { threshold: opts?.threshold ?? 0.18, rootMargin: opts?.rootMargin ?? "0px 0px -8% 0px" },
    );
    io.observe(ref);
    return () => io.disconnect();
  }, [ref, opts?.threshold, opts?.once, opts?.rootMargin]);
  return { ref: setRef, inView };
}
