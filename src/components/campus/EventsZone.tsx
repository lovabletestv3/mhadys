import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, GEO, InstancedGeo, M, Person, Trees } from "./primitives";
import type { P2 } from "./paths";

const stageMat = new THREE.MeshStandardMaterial({ color: "#2a1446", emissive: "#8b5cf6", emissiveIntensity: 1.4 });
const archMat = new THREE.MeshStandardMaterial({ color: "#f3eee8", roughness: 0.6 });
const flowerMat = new THREE.MeshStandardMaterial({ color: "#f472b6", emissive: "#5b1336", emissiveIntensity: 0.4 });

export function EventsZone() {
  const cx = -15;
  const tables = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) out.push([cx - 3 + i * 2, 0.45, -2.6 + j * 1.7, 0.9, 0.06, 0.9]);
    return out;
  }, []);
  const tableLegs = useMemo(() => tables.map((t) => [t[0]!, 0.25, t[2]!, 0.12, 0.45, 0.12]), [tables]);
  const fairy = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i <= 18; i++) {
      const x = cx - 5 + i * (10 / 18);
      out.push([x, 2.1 - Math.sin((i / 18) * Math.PI * 3) ** 2 * 0.35, 4.2, 0.08, 0.08, 0.08]);
      out.push([x, 1.9 - Math.sin((i / 18) * Math.PI * 3) ** 2 * 0.3, 8.2, 0.08, 0.08, 0.08]);
    }
    return out;
  }, []);
  const flowers = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i < 26; i++) out.push([cx - 5 + Math.random() * 10, 0.2, 4.6 + Math.random() * 3.6, 0.35, 0.3, 0.35]);
    return out;
  }, []);

  const guestPath: P2[] = [[cx - 4, 6], [cx + 3, 6], [cx + 3, 3.4], [cx + 0.3, 3.4], [cx + 0.3, 6.8], [cx - 4, 6.8]];
  const staffPath: P2[] = [[cx - 3.5, -0.4], [cx + 3.5, -0.4], [cx + 3.5, 0.4], [cx - 3.5, 0.4]];
  const confPath: P2[] = [[cx - 8, -1], [cx - 5.6, -1]];

  const fountainJet = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (fountainJet.current) fountainJet.current.scale.y = 1 + Math.sin(clock.elapsedTime * 4) * 0.15;
  });

  return (
    <group>
      {/* pavilion floor + glass */}
      <Box p={[cx, 0.08, -1]} s={[9, 0.16, 7]} m={M.floorWarm} />
      <Box p={[cx, 1.7, -4.45]} s={[9, 3.2, 0.1]} m={M.wallWhite} />
      <Box p={[cx - 4.45, 1.7, -1]} s={[0.1, 3.2, 7]} m={M.glass} cast={false} />
      <Box p={[cx + 4.45, 1.7, -1]} s={[0.1, 3.2, 7]} m={M.glass} cast={false} />
      <Box p={[cx, 1.7, 2.45]} s={[9, 3.2, 0.1]} m={M.glass} cast={false} />
      {/* roof frame (cutaway) */}
      {[-4.45, 4.45].map((dx) => [-4.45, 2.45].map((dz) => <Box key={`${dx}${dz}`} p={[cx + dx, 1.7, -1 + dz + 1]} s={[0.18, 3.4, 0.18]} m={archMat} />))}
      <Box p={[cx, 3.35, -4.45]} s={[9.2, 0.15, 0.2]} m={archMat} />
      <Box p={[cx, 3.35, 2.45]} s={[9.2, 0.15, 0.2]} m={archMat} />
      <Box p={[cx - 4.45, 3.35, -1]} s={[0.2, 0.15, 7]} m={archMat} />
      <Box p={[cx + 4.45, 3.35, -1]} s={[0.2, 0.15, 7]} m={archMat} />
      {/* stage */}
      <Box p={[cx, 0.35, -3.7]} s={[4.5, 0.4, 1.2]} m={stageMat} />
      <Box p={[cx, 1.8, -4.35]} s={[4, 2.4, 0.05]} m={stageMat} />
      <pointLight position={[cx, 2.6, -1]} intensity={10} distance={9} color="#c4a2ff" />
      <pointLight position={[cx, 2.4, 5.8]} intensity={10} distance={9} color="#ffcf8a" />
      <InstancedGeo items={tables} geometry={GEO.cyl} material={M.linen} />
      <InstancedGeo items={tableLegs} geometry={GEO.cyl} material={M.linen} cast={false} />
      {/* red carpet + stairs */}
      <Box p={[cx + 0.3, 0.03, 4.5]} s={[1, 0.05, 4]} m={M.redCarpet} cast={false} />
      {/* garden */}
      <Box p={[cx, 0.02, 6.4]} s={[10.5, 0.04, 4.6]} m={M.plaza} cast={false} />
      <InstancedGeo items={flowers} geometry={GEO.sph} material={flowerMat} />
      <InstancedGeo items={fairy} geometry={GEO.sph} material={M.warmLight} cast={false} />
      {/* arches */}
      {[cx - 3.5, cx + 3.2].map((x) => (
        <group key={x} position={[x, 0, 6.6]}>
          <Box p={[-0.6, 0.9, 0]} s={[0.1, 1.8, 0.1]} m={archMat} />
          <Box p={[0.6, 0.9, 0]} s={[0.1, 1.8, 0.1]} m={archMat} />
          <mesh position={[0, 1.8, 0]} geometry={new THREE.TorusGeometry(0.6, 0.06, 6, 16, Math.PI)} material={flowerMat} />
        </group>
      ))}
      {/* fountain */}
      <mesh position={[cx - 1.4, 0.15, 7.5]} geometry={GEO.cyl} material={M.concrete} scale={[1.8, 0.3, 1.8]} receiveShadow />
      <mesh position={[cx - 1.4, 0.32, 7.5]} geometry={GEO.cyl} material={M.water} scale={[1.55, 0.05, 1.55]} />
      <mesh ref={fountainJet} position={[cx - 1.4, 0.7, 7.5]} geometry={GEO.cyl} material={M.water} scale={[0.08, 0.8, 0.08]} />
      {/* conference hall with rooftop garden */}
      <Box p={[cx - 7.5, 1.5, -1.5]} s={[4.5, 3, 5]} m={M.wallDark} />
      <Box p={[cx - 5.22, 1.5, -1.5]} s={[0.06, 2.6, 4.4]} m={M.coolLight} cast={false} />
      <Box p={[cx - 7.5, 3.05, -1.5]} s={[4.3, 0.1, 4.8]} m={M.grass} />
      <InstancedGeo items={[[cx - 8.8, 3.4, -3, 0.4, 0.5, 0.4], [cx - 6.2, 3.4, -3, 0.4, 0.5, 0.4], [cx - 8.8, 3.4, 0, 0.4, 0.5, 0.4], [cx - 6.2, 3.4, 0, 0.4, 0.5, 0.4]]} geometry={GEO.sph} material={M.leaf} />
      <InstancedGeo items={[[cx - 7.5, 3.25, -1.5, 1.2, 0.3, 0.6], [cx - 7.5, 3.25, -0.3, 1.2, 0.3, 0.6]]} geometry={GEO.box} material={M.linen} />
      <InstancedGeo items={[[cx - 7.5, 3.35, -2.4, 0.08, 0.08, 0.08], [cx - 8.4, 3.35, -1.5, 0.08, 0.08, 0.08], [cx - 6.6, 3.35, -1.5, 0.08, 0.08, 0.08]]} geometry={GEO.sph} material={M.warmLight} cast={false} />
      <Trees spots={[[cx - 5.2, 4.8, 0.8], [cx + 5.3, 4.5, 0.9], [cx + 5.4, 8.4, 0.8], [cx - 5.4, 8.6, 1], [cx - 10, 3, 1.1], [cx - 10.5, -5, 1.2], [cx + 5.6, -4.8, 0.9]]} />

      {/* people */}
      {[0, 0.17, 0.33, 0.5, 0.67, 0.83].map((o, i) => (
        <Person key={i} path={guestPath} speed={0.5} offset={o} color={["#f8fafc", "#f472b6", "#1e293b", "#e9d5ff", "#0f172a", "#fca5a5"][i] ?? "#fff"} />
      ))}
      <Person path={staffPath} speed={0.8} offset={0} color="#111827" />
      <Person path={staffPath} speed={0.8} offset={0.5} color="#111827" />
      <Person path={confPath} speed={0.5} pingPong color="#334155" />
      {([[-2.6, -1.8], [-0.6, -1.8], [1.4, 0.8], [-2.6, 0.8], [0.4, -3.0]] as [number, number][]).map(([x, z], i) => (
        <Person key={`s${i}`} pos={[cx + x, 0.16, z]} idle offset={i * 0.2} color={i % 2 ? "#e2e8f0" : "#6d28d9"} />
      ))}
    </group>
  );
}
