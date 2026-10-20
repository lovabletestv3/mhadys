import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { CalendarDays, CarFront, ShoppingBag } from "lucide-react";
import { SERVICES, type ServiceId } from "@/lib/services";
import { Box, CarModel, InstancedBoxes, M, PathMover, StreetLights, Trees } from "./primitives";
import { EventsZone } from "./EventsZone";
import { MerchZone } from "./MerchZone";
import { AutoZone } from "./AutoZone";
import type { P2 } from "./paths";

const ICONS = { events: CalendarDays, merch: ShoppingBag, auto: CarFront } as const;
const winMat = new THREE.MeshBasicMaterial({ color: "#ffd9a0" });
const cityMat = new THREE.MeshStandardMaterial({ color: "#1a2238", roughness: 0.7, metalness: 0.3 });

function seeded(n: number) {
  let s = n;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function City() {
  const { blocks, windows } = useMemo(() => {
    const r = seeded(7);
    const blocks: number[][] = [];
    const windows: number[][] = [];
    for (let i = 0; i < 70; i++) {
      const x = -45 + r() * 90;
      const z = -14 - r() * 30;
      const h = 1.5 + r() * (z < -25 ? 9 : 4);
      const w = 2 + r() * 3;
      blocks.push([x, h / 2, z, w, h, w]);
      if (r() > 0.4) windows.push([x, h * (0.3 + r() * 0.5), z + w / 2 + 0.01, w * 0.7, 0.15, 0.02]);
    }
    for (let i = 0; i < 30; i++) {
      const x = -45 + r() * 90;
      const z = 14 + r() * 12;
      const h = 1 + r() * 3;
      const w = 2 + r() * 3;
      blocks.push([x, h / 2, z, w, h, w]);
    }
    return { blocks, windows };
  }, []);
  return (
    <>
      <InstancedBoxes items={blocks} material={cityMat} />
      <InstancedBoxes items={windows} material={winMat} cast={false} />
    </>
  );
}

function Roads() {
  const marks = useMemo(() => {
    const out: number[][] = [];
    for (let x = -40; x <= 40; x += 2.2) {
      out.push([x, 0.04, 9.8, 1, 0.01, 0.08]);
      out.push([x, 0.04, -9.2, 1, 0.01, 0.08]);
    }
    for (let z = -8; z <= 8.5; z += 2.2) {
      out.push([-27.2, 0.04, z, 0.08, 0.01, 1]);
      out.push([27.2, 0.04, z, 0.08, 0.01, 1]);
    }
    return out;
  }, []);
  return (
    <>
      <Box p={[0, 0.01, 9.8]} s={[90, 0.02, 3]} m={M.asphalt} cast={false} />
      <Box p={[0, 0.01, -9.2]} s={[90, 0.02, 2.6]} m={M.asphalt} cast={false} />
      <Box p={[-27.2, 0.01, 0.3]} s={[2.6, 0.02, 19]} m={M.asphalt} cast={false} />
      <Box p={[27.2, 0.01, 0.3]} s={[2.6, 0.02, 19]} m={M.asphalt} cast={false} />
      <Box p={[22.6, 0.012, 0.5]} s={[5, 0.02, 14]} m={M.asphalt} cast={false} />
      {/* sidewalks */}
      <Box p={[0, 0.03, 7.9]} s={[52, 0.06, 0.8]} m={M.sidewalk} cast={false} />
      <Box p={[0, 0.03, -7.6]} s={[52, 0.06, 0.6]} m={M.sidewalk} cast={false} />
      <Box p={[-7.5, 0.03, 0]} s={[1.2, 0.06, 15]} m={M.plaza} cast={false} />
      <Box p={[7.3, 0.03, 0]} s={[1.2, 0.06, 15]} m={M.plaza} cast={false} />
      <InstancedBoxes items={marks} material={M.laneMark} cast={false} />
    </>
  );
}

function Marker({ id, active, onSelect, showLabel }: { id: ServiceId; active: boolean; onSelect: (id: ServiceId) => void; showLabel: boolean }) {
  const s = SERVICES.find((x) => x.id === id)!;
  const ring = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.9 }), [s.color]);
  const beamMat = useMemo(() => new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.25, depthWrite: false }), [s.color]);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-6 * Math.min(d, 0.05));
    if (ring.current) {
      ring.current.rotation.z = t;
      const target = active ? 1.3 + Math.sin(t * 3) * 0.1 : 0.8;
      ring.current.scale.setScalar(THREE.MathUtils.lerp(ring.current.scale.x, target, k));
    }
    if (beam.current) (beam.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp((beam.current.material as THREE.MeshBasicMaterial).opacity, active ? 0.35 : 0.08, k);
    if (light.current) light.current.intensity = THREE.MathUtils.lerp(light.current.intensity, active ? 14 : 0, k);
  });
  const Icon = ICONS[id];
  const [x, y, z] = s.marker;
  return (
    <group position={[x, 0, z]}>
      <mesh ref={beam} position-y={y / 2} material={beamMat}>
        <cylinderGeometry args={[0.05, 0.05, y, 8]} />
      </mesh>
      <mesh ref={ring} position-y={y} material={mat}>
        <torusGeometry args={[0.45, 0.07, 8, 32]} />
      </mesh>
      <mesh position-y={y} material={mat}>
        <sphereGeometry args={[0.18, 12, 10]} />
      </mesh>
      <pointLight ref={light} position={[0, 5, 3]} color={s.color} intensity={0} distance={16} />
      {showLabel && (
        <Html position={[0, y + 1.2, 0]} center zIndexRange={[20, 0]}>
          <button
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={active}
            data-service={s.token}
            className={`selector ${active ? "selector-active" : ""}`}
          >
            <span className="selector-icon"><Icon className="h-5 w-5" /></span>
            <span className="text-left">
              <span className="block text-base font-semibold leading-tight text-foreground">{s.label}</span>
              <span className="block text-xs text-muted-foreground">{s.subtitle}</span>
            </span>
          </button>
        </Html>
      )}
    </group>
  );
}

const ringRoad: P2[] = [[-27.8, 10.4], [27.8, 10.4], [27.8, -9.6], [-27.8, -9.6]];
const ringRoadInner: P2[] = [[26.6, 9.2], [-26.6, 9.2], [-26.6, -8.8], [26.6, -8.8]];
const CAR_COLORS = ["#dc2626", "#f8fafc", "#1e3a8a", "#0f172a", "#9ca3af", "#b91c1c", "#e5e7eb", "#1d4ed8"];

export function World({ active, onSelect, showLabels }: { active: ServiceId; onSelect: (id: ServiceId) => void; showLabels: boolean }) {
  const treeSpots = useMemo(() => {
    const r = seeded(3);
    const out: [number, number, number][] = [];
    for (let i = 0; i < 40; i++) out.push([-40 + r() * 80, 12 + r() * 3, 0.8 + r() * 0.6]);
    for (let i = 0; i < 26; i++) out.push([-40 + r() * 80, -11 - r() * 2.5, 0.9 + r() * 0.6]);
    for (let z = -6; z <= 7; z += 2.6) out.push([-7.5 + 1.2, z, 0.7], [7.3 - 1.2, z, 0.7]);
    for (let i = 0; i < 10; i++) out.push([-30 - r() * 8, -8 + r() * 17, 1 + r() * 0.5], [30 + r() * 8, -8 + r() * 17, 1 + r() * 0.5]);
    return out;
  }, []);
  const lights = useMemo(() => {
    const out: P2[] = [];
    for (let x = -36; x <= 36; x += 6) out.push([x, 8.4], [x, -8]);
    return out;
  }, []);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={M.grass}>
        <planeGeometry args={[140, 100]} />
      </mesh>
      <Box p={[0, 0.015, 0]} s={[54, 0.02, 15.2]} m={M.sidewalk} cast={false} />
      <Roads />
      <City />
      <Trees spots={treeSpots} />
      <StreetLights spots={lights} />
      <EventsZone />
      <MerchZone />
      <AutoZone />
      {CAR_COLORS.map((c, i) => (
        <PathMover key={i} path={i % 2 ? ringRoad : ringRoadInner} speed={3 + (i % 3) * 0.4} offset={i / CAR_COLORS.length}>
          <CarModel color={c} />
        </PathMover>
      ))}
      {SERVICES.map((s) => (
        <Marker key={s.id} id={s.id} active={active === s.id} onSelect={onSelect} showLabel={showLabels} />
      ))}
    </>
  );
}
