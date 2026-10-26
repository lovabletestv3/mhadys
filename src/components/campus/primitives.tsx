import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sampleLoop, loopLength, type P2 } from "./paths";

export const M = {
  grass: new THREE.MeshStandardMaterial({ color: "#14301f", roughness: 1 }),
  asphalt: new THREE.MeshStandardMaterial({ color: "#1b2233", roughness: 0.6, metalness: 0.2 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: "#59647a", roughness: 0.9 }),
  plaza: new THREE.MeshStandardMaterial({ color: "#8a93a6", roughness: 0.7 }),
  concrete: new THREE.MeshStandardMaterial({ color: "#c9cfdb", roughness: 0.8 }),
  wallDark: new THREE.MeshStandardMaterial({ color: "#2a3550", roughness: 0.5, metalness: 0.4 }),
  wallWhite: new THREE.MeshStandardMaterial({ color: "#e6e9f0", roughness: 0.6 }),
  glass: new THREE.MeshPhysicalMaterial({ color: "#9fc4ff", transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.1, depthWrite: false }),
  floorWarm: new THREE.MeshStandardMaterial({ color: "#d9c7b0", roughness: 0.6 }),
  floorCool: new THREE.MeshStandardMaterial({ color: "#aab4c6", roughness: 0.5, metalness: 0.1 }),
  cardboard: new THREE.MeshStandardMaterial({ color: "#c29a62", roughness: 0.9 }),
  rack: new THREE.MeshStandardMaterial({ color: "#3b6fd8", roughness: 0.4, metalness: 0.6 }),
  linen: new THREE.MeshStandardMaterial({ color: "#f5efe6", roughness: 0.8, emissive: "#3a2a18", emissiveIntensity: 0.25 }),
  redCarpet: new THREE.MeshStandardMaterial({ color: "#a3122a", roughness: 0.9 }),
  trunk: new THREE.MeshStandardMaterial({ color: "#3b2a1e", roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: "#1f5a35", roughness: 0.9 }),
  water: new THREE.MeshStandardMaterial({ color: "#3fb7ff", emissive: "#0f6ea8", emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.3 }),
  warmLight: new THREE.MeshBasicMaterial({ color: "#ffd59a" }),
  coolLight: new THREE.MeshBasicMaterial({ color: "#bfe0ff" }),
  laneMark: new THREE.MeshBasicMaterial({ color: "#c8d2e8" }),
  tire: new THREE.MeshStandardMaterial({ color: "#111318", roughness: 0.8 }),
  yellow: new THREE.MeshStandardMaterial({ color: "#f2b81b", roughness: 0.5, metalness: 0.3 }),
  skin: new THREE.MeshStandardMaterial({ color: "#d9a882", roughness: 0.8 }),
};

const box = new THREE.BoxGeometry(1, 1, 1);
const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
const sph = new THREE.SphereGeometry(0.5, 12, 10);
export const GEO = { box, cyl, sph };

export function Box({ p, s, m, r = 0, cast = true }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; r?: number; cast?: boolean }) {
  return <mesh geometry={box} material={m} position={p} scale={s} rotation-y={r} castShadow={cast} receiveShadow />;
}

/** Instanced boxes from a list of [x,y,z,sx,sy,sz,yaw?] */
export function InstancedBoxes({ items, material, cast = true }: { items: number[][]; material: THREE.Material; cast?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(it[0]!, it[1]!, it[2]!);
      o.scale.set(it[3]!, it[4]!, it[5]!);
      o.rotation.set(0, it[6] ?? 0, 0);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[box, material, items.length]} castShadow={cast} receiveShadow />;
}

export function InstancedGeo({ items, geometry, material, cast = true }: { items: number[][]; geometry: THREE.BufferGeometry; material: THREE.Material; cast?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(it[0]!, it[1]!, it[2]!);
      o.scale.set(it[3]!, it[4]!, it[5]!);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={cast} receiveShadow />;
}

/* ---------- People ---------- */
const bodyGeo = new THREE.CapsuleGeometry(0.13, 0.32, 3, 8);
const headGeo = new THREE.SphereGeometry(0.11, 10, 8);
const shirtMats = new Map<string, THREE.Material>();
const shirt = (c: string) => {
  if (!shirtMats.has(c)) shirtMats.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));
  return shirtMats.get(c)!;
};
const std = (c: string, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
const SKINS = ["#f1c7a5", "#d9a882", "#b98160", "#8d5a3c", "#5e3a24"].map((c) => std(c, 0.7));
const HAIRS = ["#1a1410", "#3b2416", "#6b4a2b", "#2a2a2e", "#a8875a"].map((c) => std(c, 0.9));
const PANTS = ["#1f2937", "#111827", "#334155", "#3f3a33", "#1e3a5f"].map((c) => std(c));
const shoeMat = std("#0b0b0e", 0.6);
const limbGeo = new THREE.CapsuleGeometry(0.5, 1, 3, 8);
const torsoGeo = new THREE.CapsuleGeometry(0.5, 0.6, 4, 10);

export function Person({ path, speed = 0.6, color = "#2c5bd6", offset = 0, pingPong = false, idle = false, pos }: { path?: P2[]; speed?: number; color?: string; offset?: number; pingPong?: boolean; idle?: boolean; pos?: [number, number, number] }) {
  const g = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const len = useMemo(() => (path ? loopLength(path) : 1), [path]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (path && g.current) {
      let u = (t * speed) / len + offset;
      if (pingPong) {
        const k = u % 2;
        u = k < 1 ? k : 2 - k;
        const s = sampleLoop(path, u * 0.999, false);
        g.current.position.x = s.x;
        g.current.position.z = s.z;
        g.current.rotation.y = s.yaw + ((u % 2) > 1 ? Math.PI : 0);
      } else {
        const s = sampleLoop(path, u);
        g.current.position.x = s.x;
        g.current.position.z = s.z;
        g.current.rotation.y = s.yaw;
      }
    }
    const sw = idle ? Math.sin(t * 1.2 + offset * 7) * 0.06 : Math.sin(t * 7 + offset * 10) * 0.6;
    if (body.current) {
      body.current.position.y = idle ? 0 : Math.abs(Math.sin(t * 7 + offset * 10)) * 0.02;
      body.current.rotation.y = idle ? Math.sin(t * 0.6 + offset * 5) * 0.25 : 0;
    }
    if (legL.current) legL.current.rotation.x = idle ? 0 : sw;
    if (legR.current) legR.current.rotation.x = idle ? 0 : -sw;
    if (armL.current) armL.current.rotation.x = -sw * 0.8;
    if (armR.current) armR.current.rotation.x = idle ? -0.35 + sw : sw * 0.8;
  });
  const v = Math.abs(Math.floor(offset * 97 + color.length * 13)) ;
  const skinM = SKINS[v % SKINS.length]!;
  const hairM = HAIRS[(v >> 1) % HAIRS.length]!;
  const pantsM = PANTS[(v >> 2) % PANTS.length]!;
  const shirtM = shirt(color);
  return (
    <group ref={g} position={pos ?? [0, 0, 0]}>
      <group ref={body} scale={0.95 + (v % 5) * 0.025}>
        {/* legs pivot at hip */}
        <group ref={legL} position={[-0.045, 0.36, 0]}>
          <mesh geometry={limbGeo} material={pantsM} position-y={-0.17} scale={[0.07, 0.34, 0.07]} castShadow />
          <mesh geometry={GEO.box} material={shoeMat} position={[0, -0.35, 0.02]} scale={[0.065, 0.03, 0.11]} />
        </group>
        <group ref={legR} position={[0.045, 0.36, 0]}>
          <mesh geometry={limbGeo} material={pantsM} position-y={-0.17} scale={[0.07, 0.34, 0.07]} castShadow />
          <mesh geometry={GEO.box} material={shoeMat} position={[0, -0.35, 0.02]} scale={[0.065, 0.03, 0.11]} />
        </group>
        {/* pelvis + torso */}
        <mesh geometry={GEO.box} material={pantsM} position-y={0.38} scale={[0.17, 0.07, 0.1]} />
        <mesh geometry={torsoGeo} material={shirtM} position-y={0.52} scale={[0.19, 0.24, 0.11]} castShadow />
        <mesh geometry={GEO.cyl} material={skinM} position-y={0.66} scale={[0.04, 0.04, 0.04]} />
        {/* arms pivot at shoulder */}
        <group ref={armL} position={[-0.115, 0.62, 0]}>
          <mesh geometry={limbGeo} material={shirtM} position-y={-0.09} scale={[0.05, 0.18, 0.05]} castShadow />
          <mesh geometry={limbGeo} material={skinM} position-y={-0.22} scale={[0.04, 0.1, 0.04]} />
        </group>
        <group ref={armR} position={[0.115, 0.62, 0]}>
          <mesh geometry={limbGeo} material={shirtM} position-y={-0.09} scale={[0.05, 0.18, 0.05]} castShadow />
          <mesh geometry={limbGeo} material={skinM} position-y={-0.22} scale={[0.04, 0.1, 0.04]} />
        </group>
        {/* head + hair */}
        <mesh geometry={GEO.sph} material={skinM} position-y={0.74} scale={[0.12, 0.14, 0.12]} castShadow />
        <mesh geometry={GEO.sph} material={hairM} position={[0, 0.775, -0.012]} scale={[0.128, 0.09, 0.13]} />
      </group>
    </group>
  );
}

/* ---------- Vehicles ---------- */
const carMats = new Map<string, THREE.Material>();
const paint = (c: string) => {
  if (!carMats.has(c)) carMats.set(c, new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.6, roughness: 0.25, clearcoat: 1 }));
  return carMats.get(c)!;
};
const windowMat = new THREE.MeshStandardMaterial({ color: "#0b1220", metalness: 0.9, roughness: 0.1 });
const headMat = new THREE.MeshBasicMaterial({ color: "#fff6dd" });
const tailMat = new THREE.MeshBasicMaterial({ color: "#ff3344" });

export function CarModel({ color }: { color: string }) {
  return (
    <group>
      <mesh geometry={box} material={paint(color)} position={[0, 0.32, 0]} scale={[0.9, 0.34, 1.9]} castShadow />
      <mesh geometry={box} material={windowMat} position={[0, 0.6, -0.1]} scale={[0.78, 0.28, 1]} castShadow />
      <mesh geometry={cyl} material={M.tire} position={[0, 0.17, 0.6]} rotation-z={Math.PI / 2} scale={[0.34, 0.96, 0.34]} />
      <mesh geometry={cyl} material={M.tire} position={[0, 0.17, -0.6]} rotation-z={Math.PI / 2} scale={[0.34, 0.96, 0.34]} />
      <mesh geometry={box} material={headMat} position={[0, 0.34, 0.96]} scale={[0.7, 0.08, 0.02]} />
      <mesh geometry={box} material={tailMat} position={[0, 0.36, -0.96]} scale={[0.7, 0.06, 0.02]} />
    </group>
  );
}

export function TruckModel({ color = "#f2f4f8" }: { color?: string }) {
  return (
    <group>
      <mesh geometry={box} material={paint(color)} position={[0, 1.0, -0.6]} scale={[1.3, 1.5, 3.4]} castShadow />
      <mesh geometry={box} material={paint("#1d4ed8")} position={[0, 0.75, 1.55]} scale={[1.25, 1.1, 0.9]} castShadow />
      <mesh geometry={box} material={windowMat} position={[0, 1.0, 2.0]} scale={[1.1, 0.4, 0.05]} />
      {[1.5, -0.2, -1.6].map((z) => (
        <mesh key={z} geometry={cyl} material={M.tire} position={[0, 0.22, z]} rotation-z={Math.PI / 2} scale={[0.44, 1.32, 0.44]} />
      ))}
      <mesh geometry={box} material={headMat} position={[0, 0.5, 2.01]} scale={[1, 0.1, 0.02]} />
    </group>
  );
}

export function Forklift() {
  return (
    <group>
      <mesh geometry={box} material={M.yellow} position={[0, 0.3, 0]} scale={[0.6, 0.4, 0.9]} castShadow />
      <mesh geometry={box} material={M.tire} position={[0, 0.75, -0.15]} scale={[0.5, 0.5, 0.04]} />
      <mesh geometry={box} material={M.rack} position={[0, 0.6, 0.5]} scale={[0.5, 1.1, 0.05]} />
      <mesh geometry={box} material={M.cardboard} position={[0, 0.35, 0.8]} scale={[0.45, 0.4, 0.45]} castShadow />
    </group>
  );
}

/** Vehicle following a loop with speed easing (slows at corners). */
export function PathMover({ path, speed, offset = 0, children, closed = true, pingPong = false }: { path: P2[]; speed: number; offset?: number; children: React.ReactNode; closed?: boolean; pingPong?: boolean }) {
  const g = useRef<THREE.Group>(null);
  const len = useMemo(() => loopLength(path), [path]);
  const yaw = useRef(0);
  useFrame(({ clock }, delta) => {
    if (!g.current) return;
    let u = (clock.elapsedTime * speed) / len + offset;
    let rev = false;
    if (pingPong) {
      const k = u % 2;
      rev = k > 1;
      u = rev ? 2 - k : k;
      // ease at ends
      u = u * u * (3 - 2 * u);
    }
    const s = sampleLoop(path, pingPong ? u * 0.999 : u, closed && !pingPong);
    g.current.position.x = s.x;
    g.current.position.z = s.z;
    const target = s.yaw + (rev ? Math.PI : 0);
    let d = target - yaw.current;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    yaw.current += d * (1 - Math.exp(-8 * Math.min(delta, 0.05)));
    g.current.rotation.y = yaw.current;
  });
  return <group ref={g}>{children}</group>;
}

/* ---------- Trees ---------- */
export function Trees({ spots }: { spots: [number, number, number?][] }) {
  const trunks = useMemo(() => spots.map(([x, z, s = 1]) => [x, 0.4 * s, z, 0.14 * s, 0.8 * s, 0.14 * s]), [spots]);
  const crowns = useMemo(() => spots.map(([x, z, s = 1]) => [x, 1.25 * s, z, 1.1 * s, 1.3 * s, 1.1 * s]), [spots]);
  return (
    <>
      <InstancedGeo items={trunks} geometry={cyl} material={M.trunk} />
      <InstancedGeo items={crowns} geometry={sph} material={M.leaf} />
    </>
  );
}

export function StreetLights({ spots }: { spots: P2[] }) {
  const poles = useMemo(() => spots.map(([x, z]) => [x, 1.1, z, 0.06, 2.2, 0.06]), [spots]);
  const bulbs = useMemo(() => spots.map(([x, z]) => [x, 2.25, z, 0.22, 0.22, 0.22]), [spots]);
  return (
    <>
      <InstancedGeo items={poles} geometry={cyl} material={M.wallDark} cast={false} />
      <InstancedGeo items={bulbs} geometry={sph} material={M.warmLight} cast={false} />
    </>
  );
}
