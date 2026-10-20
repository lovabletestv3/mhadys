import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import { getService, type ServiceId } from "@/lib/services";
import { easeInOutQuint } from "./paths";

const TRANSITION = 1.8; // seconds

export function CameraRig({ active, compact, reducedMotion, onUserInteract, freeLook }: { active: ServiceId; compact: boolean; reducedMotion: boolean; onUserInteract: () => void; freeLook: boolean }) {
  const { camera } = useThree();
  const controls = useRef<OrbitImpl>(null);
  const from = useRef({ pos: new THREE.Vector3(), tgt: new THREE.Vector3() });
  const to = useRef({ pos: new THREE.Vector3(), tgt: new THREE.Vector3() });
  const t0 = useRef(-1);
  const dragging = useRef(false);
  const initialized = useRef(false);

  const offset = compact ? new THREE.Vector3(6, 19, 22) : new THREE.Vector3(7, 12.5, 15.5);

  const retarget = () => {
    const s = getService(active);
    const tgt = new THREE.Vector3(...s.target);
    if (compact) tgt.z += 1.5;
    to.current.tgt.copy(tgt);
    to.current.pos.copy(tgt).add(offset);
    from.current.pos.copy(camera.position);
    from.current.tgt.copy(controls.current?.target ?? tgt);
    t0.current = -1;
    if (!initialized.current || reducedMotion) {
      camera.position.copy(to.current.pos);
      controls.current?.target.copy(to.current.tgt);
      initialized.current = true;
      t0.current = -2;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(retarget, [active, compact]);

  useFrame(({ clock }) => {
    const c = controls.current;
    if (!c || dragging.current || freeLook) return;
    if (t0.current === -1) t0.current = clock.elapsedTime;
    if (t0.current < 0) return;
    const u = Math.min(1, (clock.elapsedTime - t0.current) / (reducedMotion ? 0.001 : TRANSITION));
    const e = easeInOutQuint(u);
    camera.position.lerpVectors(from.current.pos, to.current.pos, e);
    c.target.lerpVectors(from.current.tgt, to.current.tgt, e);
    if (u >= 1 && !reducedMotion) {
      // gentle cinematic drift while dwelling
      const t = clock.elapsedTime;
      camera.position.x += Math.sin(t * 0.4) * 0.4;
      camera.position.y += Math.sin(t * 0.3) * 0.15;
    }
    c.update();
  });

  return (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enablePan={false}
      enableDamping
      minDistance={8}
      maxDistance={45}
      maxPolarAngle={1.25}
      minPolarAngle={0.35}
      onStart={() => {
        dragging.current = true;
        onUserInteract();
      }}
      onEnd={() => {
        dragging.current = false;
        // smoothly return to framing from wherever the user left it
        from.current.pos.copy(camera.position);
        from.current.tgt.copy(controls.current!.target);
        t0.current = -1;
      }}
    />
  );
}
