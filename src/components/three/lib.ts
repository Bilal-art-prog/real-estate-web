import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/* ───────────────────────── procedural textures ───────────────────────── */

export function useCanvasTexture(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w = 256,
  h = 256,
  repeat: [number, number] = [1, 1],
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return new THREE.Texture();
    draw(ctx, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, []);
}

const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export function drawMarble(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#F7F3EC");
  g.addColorStop(0.5, "#EDE6DA");
  g.addColorStop(1, "#E2D8C8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const r = rand(7);
  for (let i = 0; i < 26; i++) {
    ctx.beginPath();
    const x0 = r() * w;
    const y0 = r() * h;
    ctx.moveTo(x0, y0);
    let x = x0;
    let y = y0;
    for (let s = 0; s < 9; s++) {
      x += (r() - 0.5) * w * 0.32;
      y += (r() - 0.35) * h * 0.2;
      ctx.quadraticCurveTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 60, x, y);
    }
    ctx.strokeStyle = r() > 0.72 ? "rgba(200,161,91,0.24)" : "rgba(90,72,58,0.16)";
    ctx.lineWidth = 0.4 + r() * 2.1;
    ctx.stroke();
  }
  // speckle
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(120,105,90,${r() * 0.05})`;
    ctx.fillRect(r() * w, r() * h, 1.2, 1.2);
  }
}

export function drawTerrazzo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#EFE7DA";
  ctx.fillRect(0, 0, w, h);
  const r = rand(21);
  const chips = ["#C8A15B", "#8A7A66", "#D8C7AE", "#5A2E22", "#B9AE9C", "#CFE8DC"];
  for (let i = 0; i < 420; i++) {
    ctx.save();
    ctx.translate(r() * w, r() * h);
    ctx.rotate(r() * Math.PI);
    ctx.fillStyle = chips[Math.floor(r() * chips.length)];
    ctx.globalAlpha = 0.35 + r() * 0.45;
    const s = 2 + r() * 7;
    ctx.beginPath();
    ctx.moveTo(-s, -s * 0.4);
    ctx.lineTo(s * 0.6, -s);
    ctx.lineTo(s, s * 0.5);
    ctx.lineTo(-s * 0.3, s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export function drawPlaster(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#F3EBDF";
  ctx.fillRect(0, 0, w, h);
  const r = rand(3);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(${180 + r() * 50},${168 + r() * 44},${150 + r() * 40},${r() * 0.09})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2.4, 1 + r() * 2.4);
  }
}

export function drawWood(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "#6A3A27");
  g.addColorStop(0.5, "#5A2E22");
  g.addColorStop(1, "#4A241A");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = rand(11);
  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    const y = r() * h;
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 18) ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * 3.2 + (r() - 0.5) * 3);
    ctx.strokeStyle = `rgba(30,16,10,${0.05 + r() * 0.13})`;
    ctx.lineWidth = 0.6 + r() * 1.6;
    ctx.stroke();
  }
}

export function drawSunSprite(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(255,240,214,1)");
  g.addColorStop(0.18, "rgba(255,203,132,0.85)");
  g.addColorStop(0.45, "rgba(232,145,58,0.32)");
  g.addColorStop(1, "rgba(232,145,58,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function drawHatch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(20,17,15,0.55)";
  ctx.lineWidth = 2;
  for (let i = -h; i < w; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }
}

/* ───────────────────────── environment lighting ───────────────────────── */

/**
 * Builds a PMREM environment map from a procedural gradient canvas.
 * No HDRI download — this is the fix for scenes that previously hung on a
 * network fetch that never resolved inside an offline/single-file build.
 */
export function useEnvMap(
  top: string,
  mid: string,
  bottom: string,
  sun: string,
  sunX = 0.7,
  sunY = 0.24,
  enabled = true,
) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    if (!enabled) return;
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, 0, 64); // vertical sky ramp
    g.addColorStop(0, top);
    g.addColorStop(0.5, mid);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 64);

    const rg = ctx.createRadialGradient(sunX * 128, sunY * 64, 0, sunX * 128, sunY * 64, 30);
    rg.addColorStop(0, sun);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, 128, 64);

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    let pmrem: THREE.PMREMGenerator | null = null;
    let rt: THREE.WebGLRenderTarget | null = null;
    try {
      pmrem = new THREE.PMREMGenerator(gl);
      // optional in some three releases — never let a missing method kill the scene
      (pmrem as any).compileEquirectangularShader?.();
      rt = pmrem.fromEquirectangular(tex);
      scene.environment = rt.texture;
    } catch {
      /* keep the scene without an env map rather than crash */
    }

    return () => {
      scene.environment = null;
      tex.dispose();
      rt?.dispose();
      pmrem?.dispose();
    };
  }, [gl, scene, top, mid, bottom, sun, sunX, sunY, enabled]);
}

/* ───────────────────────── geometry helpers ───────────────────────── */

/** A wall panel with a rounded (arched) opening cut through it. */
export function useArchWall(width: number, height: number, opening: number, depth = 0.18) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const w = width / 2;
    shape.moveTo(-w, 0);
    shape.lineTo(-w, height);
    shape.lineTo(w, height);
    shape.lineTo(w, 0);
    shape.lineTo(-w, 0);

    const hole = new THREE.Path();
    const o = opening / 2;
    // clamp so the arch crown never breaks out of the wall outline (a hole that
    // crosses the outer boundary produces degenerate triangulation)
    const spring = Math.min(height * 0.46, height - o - 0.05);
    hole.moveTo(-o, 0);
    hole.lineTo(-o, spring);
    hole.absarc(0, spring, o, Math.PI, 0, true);
    hole.lineTo(o, 0);
    hole.lineTo(-o, 0);
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 2,
      curveSegments: 22,
    });
    geo.computeVertexNormals();
    return geo;
  }, [width, height, opening, depth]);
}

export const toneColors: Record<string, { wall: string; trim: string }> = {
  cream: { wall: "#F2EADC", trim: "#D8C7AE" },
  sand: { wall: "#E9DFD0", trim: "#C9B69A" },
  walnut: { wall: "#5A2E22", trim: "#3E1F17" },
  glass: { wall: "#BFD4D6", trim: "#8FA9AC" },
  stone: { wall: "#CFC4B4", trim: "#A99C89" },
};

export function lerpColor(a: string, b: string, t: number) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return ca.lerp(cb, THREE.MathUtils.clamp(t, 0, 1));
}

/** Simple deterministic 3D-ish scatter used by the isometric diorama. */
export function scatter(seed: number, count: number, area: number, avoid: [number, number, number][]) {
  const r = rand(seed);
  const out: { x: number; z: number; s: number; rot: number }[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 30) {
    guard++;
    const x = (r() - 0.5) * area;
    const z = (r() - 0.5) * area;
    const blocked = avoid.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br);
    if (blocked) continue;
    out.push({ x, z, s: 0.55 + r() * 0.75, rot: r() * Math.PI * 2 });
  }
  return out;
}
