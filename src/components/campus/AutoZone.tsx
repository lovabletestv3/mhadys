import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, CarModel, GEO, M, PathMover, Person } from "./primitives";
import type { P2 } from "./paths";

const tealStrip = new THREE.MeshBasicMaterial({ color: "#2dd4bf" });
const brushMat = new THREE.MeshStandardMaterial({ color: "#3b82f6", emissive: "#1d4ed8", emissiveIntensity: 0.6, roughness: 0.9 });
const foamMat = new THREE.MeshStandardMaterial({ color: "#e0f2fe", transparent: true, opacity: 0.55, emissive: "#7dd3fc", emissiveIntensity: 0.3 });
const COLORS = ["#dc2626", "#f8fafc", "#0f172a", "#2563eb", "#9ca3af", "#b91c1c", "#14532d"] as const;

export function AutoZone() {
  const cx = 14;
  const brushes = useRef<THREE.Group>(null);
  const foam = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, d) => {
    brushes.current?.children.forEach((c, i) => (c.rotation.y += (i % 2 ? -1 : 1) * d * 6));
    if (foam.current) foam.current.position.y = 2.2 + Math.sin(clock.elapsedTime * 6) * 0.05;
  });

  const washPath: P2[] = [[20.8, 7], [20.8, -6], [24.5, -6], [24.5, 7]];
  const bayCars: [number, number, string][] = [[cx - 2.4, 3.6, COLORS[0]], [cx, 3.6, COLORS[2]], [cx + 2.4, 3.6, COLORS[1]]];
  const roofCars: [number, number, string][] = [[cx - 2.4, -3.3, COLORS[4]], [cx, -3.3, COLORS[0]], [cx + 2.4, -3.3, COLORS[1]], [cx - 2.4, 0.3, COLORS[3]], [cx + 2.4, 0.3, COLORS[2]]];

  return (
    <group>
      <Box p={[cx, 0.06, 0.5]} s={[9, 0.12, 9]} m={M.floorCool} />
      {/* main building: ground floor glass reception, rooftop parking */}
      <Box p={[cx, 1.5, -1.5]} s={[8, 3, 5]} m={M.wallDark} />
      <Box p={[cx, 1.4, 1.02]} s={[7.6, 2.4, 0.05]} m={M.coolLight} cast={false} />
      <Box p={[cx, 3.08, -1.5]} s={[8.2, 0.16, 5.2]} m={M.asphalt} />
      <Box p={[cx, 3.25, 1.1]} s={[8.2, 0.3, 0.06]} m={M.glass} cast={false} />
      <Box p={[cx, 2.7, 1.06]} s={[8, 0.12, 0.04]} m={tealStrip} cast={false} />
      {roofCars.map(([x, z, c], i) => (
        <group key={i} position={[x, 3.16, z]}><CarModel color={c} /></group>
      ))}
      {/* service bays */}
      {[-3.6, -1.2, 1.2, 3.6].map((x) => <Box key={x} p={[cx + x, 0.13, 3.6]} s={[0.06, 0.02, 2.6]} m={tealStrip} cast={false} />)}
      {/* layered canopy slab over the bays + columns */}
      <Box p={[cx, 3.45, 3.4]} s={[8.4, 0.14, 3.2]} m={M.wallWhite} />
      <Box p={[cx, 3.36, 4.98]} s={[8.4, 0.05, 0.05]} m={tealStrip} cast={false} />
      {[-4, 4].map((x) => <Box key={x} p={[cx + x, 1.72, 4.8]} s={[0.2, 3.4, 0.2]} m={M.wallWhite} />)}
      {/* tool cabinets + lift posts */}
      {[-3.4, 3.4].map((x) => <Box key={x} p={[cx + x, 0.55, 2.3]} s={[0.6, 0.9, 0.35]} m={M.rack} />)}
      {[-0.9, 0.9].map((x) => <Box key={x} p={[cx + x, 0.9, 3.6]} s={[0.12, 1.6, 0.12]} m={M.yellow} />)}
      {bayCars.map(([x, z, c], i) => (
        <group key={i} position={[x, 0.12, z]}><CarModel color={c} /></group>
      ))}
      {([[-3.1, 3], [-1.7, 4.2], [0.7, 2.9], [3, 4.1], [1.6, 3.4]] as [number, number][]).map(([x, z], i) => (
        <Person key={i} pos={[cx + x, 0.12, z]} idle offset={i * 0.37} color="#0d9488" />
      ))}
      <Person path={[[cx - 3.8, 2], [cx + 3.8, 2]]} pingPong speed={0.6} color="#0f766e" />
      <pointLight position={[cx, 2.6, 4]} intensity={12} distance={9} color="#c7f9ff" />

      {/* car wash tunnel along z at x=20.8 */}
      <group position={[20.8, 0, 1]}>
        {[-2.4, 2.4].map((z) => (
          <group key={z} position-z={z}>
            <Box p={[-1.1, 1.2, 0]} s={[0.2, 2.4, 0.3]} m={M.wallWhite} />
            <Box p={[1.1, 1.2, 0]} s={[0.2, 2.4, 0.3]} m={M.wallWhite} />
            <Box p={[0, 2.45, 0]} s={[2.4, 0.2, 0.3]} m={M.wallWhite} />
          </group>
        ))}
        <Box p={[0, 2.6, 0]} s={[2.6, 0.12, 5.2]} m={M.glass} cast={false} />
        <Box p={[-1.12, 2.3, 0]} s={[0.05, 0.08, 4.6]} m={tealStrip} cast={false} />
        <Box p={[1.12, 2.3, 0]} s={[0.05, 0.08, 4.6]} m={tealStrip} cast={false} />
        <group ref={brushes}>
          {([[-0.85, -1], [0.85, -1], [-0.85, 1], [0.85, 1]] as [number, number][]).map(([x, z], i) => (
            <mesh key={i} position={[x, 0.9, z]} geometry={GEO.cyl} material={brushMat} scale={[0.4, 1.6, 0.4]} />
          ))}
        </group>
        <mesh ref={foam} position={[0, 2.2, 0]} geometry={GEO.box} material={foamMat} scale={[1.8, 0.15, 4]} />
        <pointLight position={[0, 1.8, 0]} intensity={10} distance={6} color="#38bdf8" />
      </group>

      {/* cars cycling through the wash */}
      {[0, 0.33, 0.66].map((o, i) => (
        <PathMover key={i} path={washPath} speed={1.4} offset={o}>
          <CarModel color={COLORS[(i + 3) as 3]} />
        </PathMover>
      ))}

      {/* signage pylon */}
      <Box p={[cx + 5, 2.2, 4.8]} s={[0.6, 4.4, 1.2]} m={M.wallDark} />
      <Box p={[cx + 5.31, 2.6, 4.8]} s={[0.02, 2.8, 0.8]} m={tealStrip} cast={false} />
    </group>
  );
}
