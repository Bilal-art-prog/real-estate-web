import { useEffect, useRef } from "react";
import { useStore } from "../../store/useStore";

/** Custom magnetic cursor. Hidden on touch devices via CSS media query. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const mode = useStore((s) => s.cursorMode);
  const label = useStore((s) => s.cursorLabel);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    document.documentElement.classList.add("hide-cursor");

    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let dx = rx;
    let dy = ry;
    let mx = rx;
    let my = ry;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("hide-cursor");
    };
  }, []);

  /* global hover state for interactive elements */
  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const setCursor = useStore.getState().setCursor;
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("a,button,[data-cursor='hover'],input,select,textarea,label[for]")) setCursor("hover");
      else setCursor("default");
    };
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => window.removeEventListener("pointerover", onOver);
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" data-mode={mode} aria-hidden="true">
        {mode === "label" && label && (
          <span className="label text-[0.5rem] text-ink mix-blend-normal">{label}</span>
        )}
      </div>
    </>
  );
}
