import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float } from "@react-three/drei";
import { useEnvMap } from "./lib";
import { useStore } from "../../store/useStore";

/** Rotating extruded arch + keyhole emblem (Why Us section). */
export default function Emblem() {
  const tier = useStore((s) => s.tier);
  const group = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const w = 1.15;
    const h = 1.5;
    s.moveTo(-w, -h);
    s.lineTo(-w, 0.25);
    // clockwise = true sweeps π → 0 over the TOP of the circle (the arch)
    s.absarc(0, 0.25, w, Math.PI, 0, true);
    s.lineTo(w, -h);
    s.lineTo(-w, -h);

    // keyhole: one continuous outline, stem corners sitting exactly on the circle
    const r = 0.3;
    const cy = -0.16;
    const half = 0.12;
    const dy = -Math.sqrt(r * r - half * half);
    const aLeft = Math.atan2(dy, -half); // ≈ -1.98 rad
    const aRight = Math.atan2(dy, half); // ≈ -1.16 rad
    const hole = new THREE.Path();
    hole.moveTo(-0.17, -1.0);
    hole.lineTo(-half, cy + dy);
    hole.absarc(0, cy, r, aLeft, aRight, true);
    hole.lineTo(0.17, -1.0);
    hole.lineTo(-0.17, -1.0);
    s.holes.push(hole);

    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
      curveSegments: 34,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  }, []);

  useEnvMap("#2a211b", "#5a3f2c", "#14110f", "#ffca86", 0.24, 0.3);

  useFrame((state, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.42;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.13;
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#ffd7a1" />
      <pointLight position={[-3, -1, 2]} intensity={8} distance={10} decay={2} color="#C8A15B" />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
        <group ref={group}>
          <mesh geometry={geo} castShadow={tier === "high"}>
            <meshStandardMaterial color="#C8A15B" metalness={1} roughness={0.22} envMapIntensity={2.4} />
          </mesh>
        </group>
      </Float>
    </>
  );
}
