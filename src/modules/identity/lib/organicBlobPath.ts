import type { Point2 } from './polarLayout'

/** Stable pseudo-random phase in radians from a string (for per-node shape). */
export function stringSeedRadians(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)!
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 6283) / 1000
}

/** Asymmetry in [-1, 1] for vine curvature from node id. */
export function stringVineAsymmetry(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)!) | 0
  const u = (h >>> 0) / 2 ** 32
  return u * 2 - 1
}

/**
 * Closed path: roughly circular with smooth wobble (energy / irregular hub).
 * `steps` line segments; enough steps to read smooth at our viewBox scale.
 */
export function organicBlobPath(cx: number, cy: number, r: number, seedRad: number): string {
  const steps = 36
  const parts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * Math.PI * 2 - Math.PI / 2 + seedRad * 0.08
    const rr = blobRadiusAtAngle(r, seedRad, a)
    const x = cx + rr * Math.cos(a)
    const y = cy + rr * Math.sin(a)
    parts.push(i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : `L ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  parts.push('Z')
  return parts.join(' ')
}

function blobRadiusAtAngle(r: number, seedRad: number, a: number): number {
  const wob = r * 0.072
  const w =
    Math.sin(a * 3 + seedRad) * 0.48 +
    Math.sin(a * 5 - seedRad * 1.4) * 0.32 +
    Math.sin(a * 2 + seedRad * 0.6) * 0.2
  return r + wob * w
}

/** Point on blob boundary in the direction of `toward` (same radial profile as {@link organicBlobPath}). */
export function pointOnBlobToward(
  cx: number,
  cy: number,
  r: number,
  seedRad: number,
  toward: Point2,
): Point2 {
  const dx = toward.x - cx
  const dy = toward.y - cy
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const a = Math.atan2(uy, ux)
  const rr = blobRadiusAtAngle(r, seedRad, a)
  return { x: cx + ux * rr, y: cy + uy * rr }
}
