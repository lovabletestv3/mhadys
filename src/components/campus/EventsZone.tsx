import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, GEO, InstancedBoxes, InstancedGeo, M, Person, Trees } from "./primitives";
import type { P2 } from "./paths";

const stageMat = new THREE.MeshStandardMaterial({ color: "#2a1446", emissive: "#8b5cf6", emissiveIntensity: 1.4 });
const slabMat = new THREE.MeshStandardMaterial({ color: "#eef0f4", roughness: 0.45, metalness: 0.1 });
const frameMat = new THREE.MeshStandardMaterial({ color: "#1c2233", roughness: 0.35, metalness: 0.8 });
const stoneMat = new THREE.MeshStandardMaterial({ color: "#cbbfae", roughness: 0.75 });
const chairMat = new THREE.MeshStandardMaterial({ color: "#d4b483", roughness: 0.5, metalness: 0.4 });
const flowerMat = new THREE.MeshStandardMaterial({ color: "#f472b6", emissive: "#5b1336", emissiveIntensity: 0.4 });
const hedgeMat = new THREE.MeshStandardMaterial({ color: "#1d4a2e", roughness: 0.9 });
const violetStrip = new THREE.MeshBasicMaterial({ color: "#c4b5fd" });

/** Round banquet tables, each with 6 evenly spaced chairs and a floral centerpiece. */
function Banquet({ spots, y }: { spots: [number, number][]; y: number }) {
  const { tops, legs, chairs, backs, pieces } = useMemo(() => {
    const tops: number[][] = [], legs: number[][] = [], chairs: number[][] = [], backs: number[][] = [], pieces: number[][] = [];
    for (const [x, z] of spots) {
      tops.push([x, y + 0.42, z, 0.95, 0.05, 0.95]);
      legs.push([x, y + 0.2, z, 0.12, 0.4, 0.12]);
      pieces.push([x, y + 0.52, z, 0.18, 0.16, 0.18]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const cx = x + Math.cos(a) * 0.72, cz = z + Math.sin(a) * 0.72;
        chairs.push([cx, y + 0.24, cz, 0.24, 0.04, 0.24, -a]);
        backs.push([x + Math.cos(a) * 0.84, y + 0.4, z + Math.sin(a) * 0.84, 0.04, 0.32, 0.24, -a]);
      }
    }
    return { tops, legs, chairs, backs, pieces };
  }, [spots, y]);
  return (
    <>
      <InstancedGeo items={tops} geometry={GEO.cyl} material={M.linen} />
      <InstancedGeo items={legs} geometry={GEO.cyl} material={M.linen} cast={false} />
      <InstancedGeo items={pieces} geometry={GEO.sph} material={flowerMat} cast={false} />
      <InstancedBoxes items={chairs} material={chairMat} cast={false} />
      <InstancedBoxes items={backs} material={chairMat} cast={false} />
    </>
  );
}

export function EventsZone() {
  const cx = -15;
  const fy = 0.3; // raised hall floor
  // hall footprint: x cx-4.5..cx+4.5, z -4.5..2.5
  const tables = useMemo<[number, number][]>(() => {
    const out: [number, number][] = [];
    for (const dx of [-3, -1, 1.6, 3.4]) for (const z of [-1.9, 0.4]) out.push([cx + dx, z]);
    return out;
  }, []);
  const gardenTables = useMemo<[number, number][]>(() => [[cx + 2.4, 5.4], [cx + 4.1, 5.4], [cx + 2.4, 7.4], [cx + 4.1, 7.4]], []);

  const mullions = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i <= 12; i++) out.push([cx - 4.5 + i * 0.75, fy + 1.55, 2.5, 0.05, 3.1, 0.06]);
    for (let i = 0; i <= 9; i++) {
      const z = -4.5 + i * 0.78;
      out.push([cx - 4.5, fy + 1.55, z, 0.06, 3.1, 0.05], [cx + 4.5, fy + 1.55, z, 0.06, 3.1, 0.05]);
    }
    out.push([cx, fy + 2.2, 2.5, 9, 0.05, 0.07], [cx - 4.5, fy + 2.2, -1, 0.07, 0.05, 7], [cx + 4.5, fy + 2.2, -1, 0.07, 0.05, 7]);
    return out;
  }, []);
  const pendants = useMemo(() => tables.map(([x, z]) => [x, fy + 2.45, z, 0.22, 0.12, 0.22]), [tables]);
  const cords = useMemo(() => tables.map(([x, z]) => [x, fy + 2.8, z, 0.015, 0.6, 0.015]), [tables]);
  const fairy = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i <= 16; i++) {
      const x = cx + 1.4 + i * (3.8 / 16);
      out.push([x, 2.1 - Math.sin((i / 16) * Math.PI) * 0.3, 4.6, 0.07, 0.07, 0.07]);
      out.push([x, 2.1 - Math.sin((i / 16) * Math.PI) * 0.3, 8.2, 0.07, 0.07, 0.07]);
    }
    return out;
  }, []);
  const beds = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i < 9; i++) out.push([cx - 4.6 + i * 0.45, 0.22, 3.25, 0.32, 0.26, 0.32], [cx - 4.6 + i * 0.45, 0.22, 8.5, 0.32, 0.26, 0.32]);
    return out;
  }, []);

  const guestPath: P2[] = [[cx - 1.6, 9], [cx - 1.6, 4.2], [cx - 0.4, 3.2], [cx - 0.4, 4.2], [cx - 0.4, 9]];
  const staffPath: P2[] = [[cx - 3.9, -0.75], [cx + 3.9, -0.75]];
  const confPath: P2[] = [[cx - 8, 1.6], [cx - 5.8, 1.6]];

  const fountainJet = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (fountainJet.current) fountainJet.current.scale.y = 1 + Math.sin(clock.elapsedTime * 4) * 0.15;
  });

  return (
    <group>
      {/* raised stone plinth + entrance steps */}
      <Box p={[cx, fy / 2, -1]} s={[9.6, fy, 7.6]} m={stoneMat} />
      <Box p={[cx - 1, 0.1, 3.05]} s={[2.6, 0.2, 0.5]} m={stoneMat} />
      <Box p={[cx, fy + 0.02, -1]} s={[9, 0.04, 7]} m={M.floorWarm} cast={false} />
      {/* solid back wall + side wing */}
      <Box p={[cx, fy + 1.6, -4.45]} s={[9, 3.2, 0.12]} m={slabMat} />
      <Box p={[cx - 4.5, fy + 1.6, -3.7]} s={[0.4, 3.2, 1.6]} m={slabMat} />
      {/* glazing with coherent mullion grid */}
      <Box p={[cx, fy + 1.55, 2.5]} s={[9, 3.1, 0.04]} m={M.glass} cast={false} />
      <Box p={[cx - 4.5, fy + 1.55, -1]} s={[0.04, 3.1, 7]} m={M.glass} cast={false} />
      <Box p={[cx + 4.5, fy + 1.55, -1]} s={[0.04, 3.1, 7]} m={M.glass} cast={false} />
      <InstancedBoxes items={mullions} material={frameMat} cast={false} />
      {/* columns */}
      {[-4.5, -1.5, 1.5, 4.5].map((dx) => (
        <Box key={dx} p={[cx + dx, fy + 1.6, 2.6]} s={[0.22, 3.2, 0.22]} m={slabMat} />
      ))}
      {/* layered cantilevered roof slabs (rear half solid, front open as cutaway frame) */}
      <Box p={[cx, fy + 3.25, -3.2]} s={[9.8, 0.22, 3]} m={slabMat} />
      <Box p={[cx + 0.6, fy + 3.55, -3.6]} s={[7.2, 0.18, 2.2]} m={slabMat} />
      <Box p={[cx, fy + 3.13, -1.68]} s={[9.8, 0.04, 0.05]} m={violetStrip} cast={false} />
      <Box p={[cx, fy + 3.25, 2.6]} s={[9.8, 0.2, 0.4]} m={slabMat} />
      <Box p={[cx - 4.6, fy + 3.25, 0.5]} s={[0.4, 0.2, 4.2]} m={slabMat} />
      <Box p={[cx + 4.6, fy + 3.25, 0.5]} s={[0.4, 0.2, 4.2]} m={slabMat} />
      <Box p={[cx, fy + 3.13, 2.82]} s={[9.8, 0.04, 0.04]} m={violetStrip} cast={false} />
      {/* projecting entrance canopy */}
      <Box p={[cx - 1, fy + 2.5, 3.6]} s={[3.2, 0.14, 2]} m={slabMat} />
      <Box p={[cx - 1, fy + 2.42, 3.6]} s={[3, 0.02, 1.8]} m={M.warmLight} cast={false} />
      {[-2.4, 0.4].map((dx) => <Box key={dx} p={[cx + dx, fy + 1.2, 4.45]} s={[0.12, 2.5, 0.12]} m={frameMat} />)}

      {/* stage */}
      <Box p={[cx, fy + 0.2, -3.7]} s={[4.5, 0.4, 1.2]} m={stageMat} />
      <Box p={[cx, fy + 1.8, -4.36]} s={[4, 2.2, 0.04]} m={stageMat} />
      <pointLight position={[cx, 2.6, -1]} intensity={10} distance={9} color="#ffd9a8" />
      <pointLight position={[cx + 3, 2.4, 6.4]} intensity={8} distance={8} color="#ffcf8a" />
      <Banquet spots={tables} y={fy} />
      <InstancedGeo items={pendants} geometry={GEO.sph} material={M.warmLight} cast={false} />
      <InstancedBoxes items={cords} material={frameMat} cast={false} />

      {/* entrance plaza + red carpet */}
      <Box p={[cx, 0.02, 6.3]} s={[10, 0.04, 5]} m={M.plaza} cast={false} />
      <Box p={[cx - 1, 0.05, 6]} s={[1.1, 0.04, 5.8]} m={M.redCarpet} cast={false} />
      {/* clipped hedges + flower beds framing the plaza */}
      <Box p={[cx - 4.6 + 1.8, 0.2, 3.25]} s={[4.2, 0.35, 0.5]} m={hedgeMat} />
      <Box p={[cx - 4.6 + 1.8, 0.2, 8.5]} s={[4.2, 0.35, 0.5]} m={hedgeMat} />
      <InstancedGeo items={beds} geometry={GEO.sph} material={flowerMat} cast={false} />
      {/* garden dining pergola */}
      <Box p={[cx + 3.25, 0.03, 6.4]} s={[3.6, 0.03, 4]} m={M.floorWarm} cast={false} />
      {[1.4, 5.1].map((dx) => [4.6, 8.2].map((z) => <Box key={`${dx}${z}`} p={[cx + dx, 1.1, z]} s={[0.1, 2.2, 0.1]} m={frameMat} />))}
      <InstancedGeo items={fairy} geometry={GEO.sph} material={M.warmLight} cast={false} />
      <Banquet spots={gardenTables} y={0} />
      {/* fountain on the plaza axis */}
      <mesh position={[cx - 3.2, 0.15, 6]} geometry={GEO.cyl} material={M.concrete} scale={[1.6, 0.3, 1.6]} receiveShadow />
      <mesh position={[cx - 3.2, 0.32, 6]} geometry={GEO.cyl} material={M.water} scale={[1.35, 0.05, 1.35]} />
      <mesh ref={fountainJet} position={[cx - 3.2, 0.7, 6]} geometry={GEO.cyl} material={M.water} scale={[0.08, 0.8, 0.08]} />

      {/* conference hall with rooftop garden */}
      <Box p={[cx - 7.5, 1.5, -1.5]} s={[4.5, 3, 5]} m={M.wallDark} />
      <Box p={[cx - 5.22, 1.5, -1.5]} s={[0.06, 2.6, 4.4]} m={M.coolLight} cast={false} />
      <Box p={[cx - 7.5, 3.05, -1.5]} s={[4.3, 0.1, 4.8]} m={M.grass} />
      <Box p={[cx - 7.5, 3.15, -1.5]} s={[4.6, 0.1, 5.2]} m={slabMat} />
      <InstancedGeo items={[[cx - 8.8, 3.5, -3, 0.4, 0.5, 0.4], [cx - 6.2, 3.5, -3, 0.4, 0.5, 0.4], [cx - 8.8, 3.5, 0, 0.4, 0.5, 0.4], [cx - 6.2, 3.5, 0, 0.4, 0.5, 0.4]]} geometry={GEO.sph} material={M.leaf} />
      <Trees spots={[[cx - 5.6, 5, 0.8], [cx - 5.6, 7.8, 0.8], [cx + 5.6, 4.2, 0.9], [cx + 5.6, 8.6, 0.8], [cx - 10, 3, 1.1], [cx - 10.5, -5, 1.2], [cx + 5.6, -4.8, 0.9]]} />

      {/* people: guests arriving, staff serving, small groups seated/standing */}
      {[0, 0.2, 0.4, 0.6, 0.8].map((o, i) => (
        <Person key={i} path={guestPath} speed={0.45} offset={o} color={["#f8fafc", "#f472b6", "#1e293b", "#e9d5ff", "#0f172a"][i] ?? "#fff"} />
      ))}
      <Person path={staffPath} speed={0.7} pingPong color="#111827" />
      <Person path={confPath} speed={0.5} pingPong color="#334155" />
      {([[-3, -1.1], [1.6, -1.1], [-1, 1.2], [3.4, 1.2], [-0.6, -3.1], [0.6, -3.1]] as [number, number][]).map(([x, z], i) => (
        <Person key={`s${i}`} pos={[cx + x, fy, z]} idle offset={i * 0.2} color={i % 2 ? "#e2e8f0" : "#6d28d9"} />
      ))}
      {([[3.25, 6.4], [3.5, 6.7]] as [number, number][]).map(([x, z], i) => (
        <Person key={`g${i}`} pos={[cx + x, 0, z]} idle offset={i} color={i ? "#fca5a5" : "#0f172a"} />
      ))}
    </group>
  );
}
