import * as THREE from "three";

export type P2 = [number, number];

/** Sample a closed polyline (x,z) at normalized t; returns position and yaw. */
export function sampleLoop(points: P2[], t: number, closed = true) {
  const segs: { a: P2; b: P2; len: number }[] = [];
  let total = 0;
  const n = closed ? points.length : points.length - 1;
  for (let i = 0; i < n; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, b, len });
    total += len;
  }
  let d = (((t % 1) + 1) % 1) * total;
  for (const s of segs) {
    if (d <= s.len) {
      const k = d / s.len;
      return {
        x: s.a[0] + (s.b[0] - s.a[0]) * k,
        z: s.a[1] + (s.b[1] - s.a[1]) * k,
        yaw: Math.atan2(s.b[0] - s.a[0], s.b[1] - s.a[1]),
        total,
      };
    }
    d -= s.len;
  }
  const l = segs[segs.length - 1]!;
  return { x: l.b[0], z: l.b[1], yaw: 0, total };
}

export function loopLength(points: P2[]) {
  return sampleLoop(points, 0).total;
}

export const easeInOutQuint = (x: number) =>
  x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;

export const tmpV = new THREE.Vector3();
