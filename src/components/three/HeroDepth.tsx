import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../../store/useStore";
import { progress } from "../../lib/scroll";

const PLANE_W = 16;
const PLANE_H = 9;
const SEG_X = 110;
const SEG_Y = 62;

/**
 * Procedural depth map (no external Depth-Anything asset required):
 * sky = far, the villa mass + foreground water = near. Brighter ⇒ closer.
 */
function makeDepthTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 72;
  const ctx = c.getContext("2d")!;
  const sky = ctx.createLinearGradient(0, 0, 0, 72);
  sky.addColorStop(0, "#000000");
  sky.addColorStop(0.42, "#2a2a2a");
  sky.addColorStop(0.62, "#7a7a7a");
  sky.addColorStop(1, "#d8d8d8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 128, 72);
  // building mass (mid-near)
  const b = ctx.createRadialGradient(62, 44, 2, 62, 44, 40);
  b.addColorStop(0, "#f2f2f2");
  b.addColorStop(1, "rgba(242,242,242,0)");
  ctx.fillStyle = b;
  ctx.fillRect(0, 0, 128, 72);
  // foreground water / terrace (nearest)
  const f = ctx.createLinearGradient(0, 52, 0, 72);
  f.addColorStop(0, "rgba(255,255,255,0)");
  f.addColorStop(1, "rgba(255,255,255,0.95)");
  ctx.fillStyle = f;
  ctx.fillRect(0, 52, 128, 20);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/** Displace a photo plane with the depth map → real parallax, zero modelling. */
function DepthPhoto({ src, strength = 1.5 }: { src: string; strength?: number }) {
  const tex = useTexture(src);
  const depth = useMemo(makeDepthTexture, []);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(PLANE_W, PLANE_H, SEG_X, SEG_Y);
    const dc = document.createElement("canvas");
    dc.width = 128;
    dc.height = 72;
    const dctx = dc.getContext("2d")!;
    dctx.drawImage(depth.image as HTMLCanvasElement, 0, 0);
    const data = dctx.getImageData(0, 0, 128, 72).data;

    const pos = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = Math.min(127, Math.max(0, Math.round(uv.getX(i) * 127)));
      const v = Math.min(71, Math.max(0, Math.round((1 - uv.getY(i)) * 71)));
      const d = data[(v * 128 + u) * 4] / 255; // 0 = far, 1 = near
      pos.setZ(i, (d - 0.5) * strength);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }, [depth, strength]);

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
  }, [tex]);

  return (
    <mesh geometry={geo}>
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** Drifting champagne-gold light particles between the depth layers. */
function GoldDust({ count = 240 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = 0.6 + Math.random() * 4.2;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, seeds };
  }, [count]);

  useFrame(({ clock }) => {
    const p = ref.current;
    if (!p) return;
    const pos = p.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const y = positions[i * 3 + 1] + Math.sin(t * 0.25 + seeds[i]) * 0.5 + ((t * 0.09 + seeds[i]) % 2.4);
      pos.setY(i, y > 5.4 ? -5.4 : y);
      pos.setX(i, positions[i * 3] + Math.sin(t * 0.18 + seeds[i]) * 0.35);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#e3cfa1"
        transparent
        opacity={0.72}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

export default function HeroDepth({ src }: { src: string }) {
  const tier = useStore((s) => s.tier);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const look = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const p = progress.hero;
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = PLANE_H / 2 / Math.tan(vFov / 2);
    const distW = PLANE_W / 2 / Math.tan(vFov / 2) / Math.max(0.35, camera.aspect);
    const cover = Math.max(distH, distW);
    // slow cinematic push-in as the page scrolls
    camera.position.z = cover * THREE.MathUtils.lerp(1.1, 0.86, p);

    look.current.x += (state.pointer.x - look.current.x) * Math.min(1, dt * 2.2);
    look.current.y += (state.pointer.y - look.current.y) * Math.min(1, dt * 2.2);
    camera.position.x = look.current.x * 0.55;
    camera.position.y = -look.current.y * 0.32 + p * 0.35;
    camera.lookAt(look.current.x * 0.18, -look.current.y * 0.1 + p * 0.1, 0);
  });

  return (
    <>
      <DepthPhoto src={src} strength={tier === "low" ? 0.9 : 1.6} />
      {tier !== "low" && <GoldDust count={tier === "high" ? 260 : 130} />}
    </>
  );
}
