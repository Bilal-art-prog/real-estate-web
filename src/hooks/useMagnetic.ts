import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { usePrefersReducedMotion } from "./useDevice";

/** Magnetic hover: the element follows the pointer a little, then springs back. */
export function useMagnetic<T extends HTMLElement>(strength = 0.28, disabled = false) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled || reduced) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, [strength, disabled, reduced]);

  return ref;
}

/** Registers a cursor mode while the pointer is inside the element. */
export function useCursorMode(mode: "hover" | "label", label = "", disabled = false) {
  const setCursor = useStore((s) => s.setCursor);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    const enter = () => setCursor(mode, label);
    const leave = () => setCursor("default");
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [mode, label, disabled, setCursor]);

  return ref;
}
