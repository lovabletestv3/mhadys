import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Forklift, GEO, InstancedBoxes, M, PathMover, Person, TruckModel } from "./primitives";
import type { P2 } from "./paths";

const beltMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.4, metalness: 0.5 });
const accentStrip = new THREE.MeshBasicMaterial({ color: "#3b82f6" });
const skylight = new THREE.MeshBasicMaterial({ color: "#cfe3ff" });

function Conveyor({ x0, x1, z, y }: { x0: number; x1: number; z: number; y: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 9;
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    for (let i = 0; i < N; i++) {
      const u = ((clock.elapsedTime * 0.12 + i / N) % 1);
      o.position.set(x0 + (x1 - x0) * u, y + 0.2, z);
      o.scale.set(0.35, 0.3, 0.35);
      o.rotation.y = i;
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <Box p={[(x0 + x1) / 2, y, z]} s={[Math.abs(x1 - x0), 0.1, 0.6]} m={beltMat} />
      <Box p={[(x0 + x1) / 2, y / 2, z]} s={[Math.abs(x1 - x0) - 0.4, y, 0.3]} m={M.wallDark} />
      <instancedMesh ref={ref} args={[GEO.box, M.cardboard, N]} castShadow />
    </>
  );
}

export function MerchZone() {
  const cx = 0;
  const racks = useMemo(() => {
    const out: number[][] = [];
    for (let r = 0; r < 4; r++) {
      const x = cx - 3.8 + r * 2.2;
      out.push([x, 1.2, -4, 0.06, 2.4, 0.06], [x + 1.4, 1.2, -4, 0.06, 2.4, 0.06]);
      for (let l = 0; l < 3; l++) out.push([x + 0.7, 0.4 + l * 0.8, -4, 1.5, 0.05, 0.8]);
    }
    return out;
  }, []);
  const rackBoxes = useMemo(() => {
    const out: number[][] = [];
    for (let r = 0; r < 4; r++) for (let l = 0; l < 3; l++) for (let b = 0; b < 3; b++) {
      if ((r + l + b) % 4 === 3) continue;
      out.push([cx - 3.8 + r * 2.2 + 0.25 + b * 0.45, 0.62 + l * 0.8, -4, 0.38, 0.38, 0.55]);
    }
    // pallets outside
    for (let i = 0; i < 10; i++) out.push([cx - 4 + (i % 5) * 0.55, 0.25 + Math.floor(i / 5) * 0.45, 4.6, 0.45, 0.42, 0.45]);
    for (let i = 0; i < 6; i++) out.push([cx + 3.4 + (i % 3) * 0.5, 0.22 + Math.floor(i / 3) * 0.4, 4.9, 0.42, 0.38, 0.42]);
    return out;
  }, []);
  const tables = useMemo(() => [[cx - 2.5, 0.45, 1.6, 1.4, 0.08, 0.7], [cx + 0.2, 0.45, 1.6, 1.4, 0.08, 0.7], [cx + 2.9, 0.45, 1.6, 1.4, 0.08, 0.7]], []);

  const forkPath: P2[] = [[cx - 3.8, -2.4], [cx + 3.5, -2.4]];
  const workerPath: P2[] = [[cx - 3, 0.9], [cx + 3.5, 0.9], [cx + 3.5, -2.9], [cx - 3, -2.9]];
  const truckPath: P2[] = [[-9, 9.5], [-1, 9.5], [1.6, 8], [1.6, 5.4]];
  const dollyPath: P2[] = [[cx - 3, 3.9], [cx + 4, 3.9]];

  return (
    <group>
      <Box p={[cx, 0.06, -0.5]} s={[11, 0.12, 9]} m={M.floorCool} />
      {/* back + side walls */}
      <Box p={[cx, 2.2, -4.9]} s={[11, 4.4, 0.2]} m={M.wallDark} />
      <Box p={[cx + 5.4, 2.2, -0.5]} s={[0.2, 4.4, 9]} m={M.wallDark} />
      <Box p={[cx + 5.52, 2.6, 1.5]} s={[0.04, 1.6, 3]} m={accentStrip} cast={false} />
      <Box p={[cx - 5.4, 2.2, -0.5]} s={[0.1, 4.4, 9]} m={M.glass} cast={false} />
      {/* partial roof (cutaway front) */}
      <Box p={[cx, 4.45, -3.3]} s={[11.2, 0.2, 3.4]} m={M.wallDark} />
      <Box p={[cx - 2, 4.57, -3.3]} s={[2, 0.05, 1.6]} m={skylight} cast={false} />
      <Box p={[cx + 2, 4.57, -3.3]} s={[2, 0.05, 1.6]} m={skylight} cast={false} />
      {[-5.4, -1.8, 1.8, 5.4].map((x) => <Box key={x} p={[cx + x, 4.45, 0.6]} s={[0.15, 0.15, 4.6]} m={M.rack} />)}
      <Box p={[cx, 4.45, 3.9]} s={[11, 0.18, 0.18]} m={M.rack} />
      <Box p={[cx, 0.5, 3.95]} s={[11, 0.08, 0.08]} m={accentStrip} cast={false} />
      {[-5.4, 5.4].map((x) => <Box key={x} p={[cx + x, 2.2, 3.9]} s={[0.2, 4.4, 0.2]} m={M.wallDark} />)}
      <pointLight position={[cx, 3.6, -0.5]} intensity={7} distance={10} color="#cfe0ff" />
      {/* loading dock */}
      <Box p={[cx + 1.6, 0.25, 4.2]} s={[2.6, 0.5, 0.8]} m={M.concrete} />
      {/* roof-edge parapet + brand band */}
      <Box p={[cx, 4.7, -4.9]} s={[11.4, 0.35, 0.3]} m={M.wallDark} />
      <Box p={[cx, 4.7, -4.73]} s={[6, 0.12, 0.04]} m={accentStrip} cast={false} />
      {/* side loading doors with dock bumpers + staged truck */}
      {[-2, 0.4, 2.8].map((z) => (
        <group key={z}>
          <Box p={[cx + 5.52, 1.3, z]} s={[0.05, 2.4, 1.8]} m={M.concrete} cast={false} />
          <Box p={[cx + 5.55, 2.55, z]} s={[0.06, 0.1, 1.9]} m={accentStrip} cast={false} />
          <Box p={[cx + 5.9, 0.35, z]} s={[0.8, 0.7, 2]} m={M.concrete} />
        </group>
      ))}
      <group position={[cx + 8.2, 0, -2]} rotation-y={-Math.PI / 2}><TruckModel /></group>
      <group position={[cx + 8.2, 0, 2.8]} rotation-y={-Math.PI / 2}><TruckModel color="#dbe6f7" /></group>
      <Person pos={[cx + 6.3, 0.7, 0.4]} idle color="#f59e0b" />
      <Person pos={[cx + 6.5, 0.7, -1.2]} idle offset={0.5} color="#1d4ed8" />
      <InstancedBoxes items={racks} material={M.rack} />
      <InstancedBoxes items={rackBoxes} material={M.cardboard} />
      <InstancedBoxes items={tables} material={M.wallWhite} />
      <Conveyor x0={cx - 4.5} x1={cx + 4.5} z={-0.6} y={0.55} />

      <PathMover path={forkPath} speed={1.1} pingPong><Forklift /></PathMover>
      <PathMover path={dollyPath} speed={0.9} pingPong offset={0.4}><group rotation-y={Math.PI / 2}><Forklift /></group></PathMover>
      <PathMover path={truckPath} speed={1.6} pingPong offset={0.2}><TruckModel /></PathMover>

      {[0, 0.25, 0.5, 0.75].map((o, i) => <Person key={i} path={workerPath} speed={0.7} offset={o} color="#1d4ed8" />)}
      {([[-2.5, 2.1], [0.2, 2.1], [2.9, 2.1], [-1, -0.05], [1.8, -0.05]] as [number, number][]).map(([x, z], i) => (
        <Person key={`p${i}`} pos={[cx + x, 0.12, z]} idle offset={i * 0.3} color="#2563eb" />
      ))}
    </group>
  );
}
