import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../../store/useStore";
import { usePrefersReducedMotion } from "../../hooks/useDevice";

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_e: Error, _info: ErrorInfo) {
    this.props.onError?.();
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

interface Canvas3DProps {
  children: ReactNode;
  /** CSS background for the poster layer (gradient or url) — shows before/without WebGL */
  poster?: string;
  posterLabel?: string;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number; near?: number; far?: number };
  shadows?: boolean;
  /** key used to pause rendering when the canvas scrolls off screen */
  pauseOffscreen?: boolean;
  exposure?: number;
  fogColor?: string;
  fog?: [number, number];
  onReady?: () => void;
  maxDpr?: number;
}

export default function Canvas3D({
  children,
  poster,
  posterLabel = "3D scene",
  className = "",
  camera = { position: [0, 1.6, 8], fov: 42 },
  shadows = true,
  pauseOffscreen = true,
  exposure = 1.05,
  fogColor,
  fog,
  onReady,
  maxDpr,
}: Canvas3DProps) {
  const host = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(!pauseOffscreen);
  const [dprCap, setDprCap] = useState(1.6);
  const tier = useStore((s) => s.tier);
  const webgl = useStore((s) => s.webgl);
  const markSceneReady = useStore((s) => s.markSceneReady);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    setDprCap(tier === "low" ? 1 : tier === "mid" ? 1.4 : maxDpr ?? 1.8);
  }, [tier, maxDpr]);

  useEffect(() => {
    const el = host.current;
    if (!el || !pauseOffscreen || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { rootMargin: "160px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pauseOffscreen]);

  const posterLayer = (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: poster ?? "transparent" }} />
      {webgl === false && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <p className="label text-cream/50">
            {posterLabel} — 3D preview unavailable on this device · static view shown
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div ref={host} className={`relative h-full w-full ${className}`}>
      {posterLayer}
      {webgl === false ? null : (
        <SceneBoundary
          fallback={
            <div className="absolute inset-0 grid place-items-center">
              <p className="label text-cream/45">{posterLabel} paused · performance mode</p>
            </div>
          }
          onError={() => useStore.getState().setWebgl(false)}
        >
          <div className="absolute inset-0 z-10">
            <Canvas
              frameloop={reduced ? "demand" : visible ? "always" : "never"}
              /* vertical page scroll must always win over canvas gestures */
              style={{ touchAction: "pan-y" }}
              dpr={[1, dprCap]}
              shadows={shadows && tier !== "low" ? "soft" : false}
              gl={{
                antialias: tier !== "low",
                alpha: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
              }}
              camera={{
                position: camera.position ?? [0, 1.6, 8],
                fov: camera.fov ?? 42,
                near: camera.near ?? 0.1,
                far: camera.far ?? 120,
              }}
              onCreated={({ gl, scene }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = exposure;
                gl.setClearAlpha(0);
                if (fogColor && fog) scene.fog = new THREE.Fog(fogColor, fog[0], fog[1]);
                markSceneReady("canvas");
                onReady?.();
              }}
            >
              <PerformanceMonitor
                onDecline={() => {
                  setDprCap(1);
                  useStore.getState().setTier("low");
                }}
              />
              {children}
            </Canvas>
          </div>
        </SceneBoundary>
      )}
    </div>
  );
}
