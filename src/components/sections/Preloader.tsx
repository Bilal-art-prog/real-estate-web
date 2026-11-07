import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import { site } from "../../data/content";
import { Monogram } from "../ui/Icons";

export default function Preloader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const setBooted = useStore((s) => s.setBooted);
  const sceneReady = useStore((s) => s.sceneReady);
  const started = useRef(Date.now());

  useEffect(() => {
    let target = 6;
    let raf = 0;
    let value = 0;
    let finished = false;

    const bump = (v: number) => {
      target = Math.max(target, v);
    };

    if (typeof document !== "undefined" && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => bump(52)).catch(() => bump(52));
    } else bump(52);

    window.addEventListener(
      "load",
      () => bump(78),
      { once: true },
    );

    const finish = () => {
      if (finished) return;
      finished = true;
      bump(100);
      window.setTimeout(() => {
        setBooted(true);
        window.setTimeout(() => setGone(true), 1250);
      }, 420);
    };

    const tick = () => {
      const elapsed = Date.now() - started.current;
      // real signals: hero canvas mounted → nearly done
      if (sceneReady.canvas) bump(92);
      // guarantee the curtain always lifts, even offline / no WebGL
      if (elapsed > 1500) bump(Math.min(88, 40 + (elapsed - 1500) / 22));
      if (elapsed > 5200) finish();

      value += (target - value) * 0.09;
      setPct(Math.min(100, Math.round(value)));
      if (value > 99.2 && target >= 100) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sceneReady.canvas, setBooted]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden bg-ink"
          initial={{ y: 0 }}
          exit={{ y: "-101%" }}
          transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 40%, rgba(232,145,58,0.16), transparent 70%), radial-gradient(50% 40% at 15% 90%, rgba(200,161,91,0.12), transparent 70%)",
            }}
          />
          <div className="relative flex h-full flex-col items-center justify-center gap-10 px-6">
            <svg viewBox="0 0 64 64" className="h-24 w-24 text-gold sm:h-32 sm:w-32" fill="none">
              <path
                d="M10 54V10h18c9 0 14 5 14 12 0 5-3 8-7 10 5 1 9 5 9 11 0 7-6 11-16 11H10Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 260,
                  strokeDashoffset: 260,
                  animation: "draw 2.1s cubic-bezier(0.16,1,0.3,1) forwards",
                }}
              />
              <path
                d="M19 31h9M19 44h11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 40,
                  strokeDashoffset: 40,
                  animation: "draw 1.4s cubic-bezier(0.16,1,0.3,1) 0.9s forwards",
                }}
              />
              <circle
                cx="49"
                cy="15"
                r="3.2"
                stroke="currentColor"
                strokeWidth="1.4"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: 24,
                  animation: "draw 1s cubic-bezier(0.16,1,0.3,1) 1.4s forwards",
                }}
              />
            </svg>

            <div className="text-center">
              <p className="display text-[clamp(1.8rem,6vw,3rem)] leading-none text-cream">{site.name}</p>
              <p className="label mt-3 text-cream/40">{site.tagline}</p>
            </div>

            <div className="w-[min(78vw,22rem)]">
              <div className="flex items-end justify-between">
                <span className="label text-cream/35">Preparing the walkthrough</span>
                <span className="num text-2xl text-gold">{String(pct).padStart(3, "0")}</span>
              </div>
              <div className="mt-3 h-px w-full bg-cream/12">
                <div
                  className="h-px bg-gold transition-[width] duration-200 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          <Monogram className="pointer-events-none absolute -bottom-16 left-1/2 h-64 w-64 -translate-x-1/2 text-cream/3" />
          <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
