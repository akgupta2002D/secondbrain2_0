export type Point2 = { x: number; y: number }

/** Evenly space `count` points on a circle (first at top by default). */
export function ringPositions(
  count: number,
  cx: number,
  cy: number,
  radius: number,
  startAngleRad = -Math.PI / 2,
): Point2[] {
  if (count <= 0) return []
  const step = (2 * Math.PI) / count
  return Array.from({ length: count }, (_, i) => {
    const a = startAngleRad + i * step
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }
  })
}

/**
 * Quadratic Bézier from outer toward center with a perpendicular bulge (vine-like).
 */
export function vinePathQ(
  outer: Point2,
  inner: Point2,
  curvature: number,
): string {
  const mx = (outer.x + inner.x) / 2
  const my = (outer.y + inner.y) / 2
  const dx = inner.x - outer.x
  const dy = inner.y - outer.y
  const len = Math.hypot(dx, dy) || 1
  const px = (-dy / len) * curvature
  const py = (dx / len) * curvature
  const cx1 = mx + px
  const cy1 = my + py
  return `M ${outer.x} ${outer.y} Q ${cx1} ${cy1} ${inner.x} ${inner.y}`
}

/**
 * Cubic Bézier “vine” from outer toward center: asymmetric, more organic than a single quad.
 * `asym` in roughly [-1, 1] biases the S-curve; `bend` scales perpendicular offset.
 */
export function vinePathCubic(
  outer: Point2,
  inner: Point2,
  bend: number,
  asym: number,
): string {
  const dx = inner.x - outer.x
  const dy = inner.y - outer.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux
  const t1 = len * 0.36
  const t2 = len * 0.36
  const bend1 = bend * (1 + asym * 0.42)
  const bend2 = bend * (0.62 + asym * 0.28)
  const c1x = outer.x + ux * t1 + px * bend1
  const c1y = outer.y + uy * t1 + py * bend1
  const c2x = inner.x - ux * t2 - px * bend2
  const c2y = inner.y - uy * t2 - py * bend2
  return `M ${outer.x} ${outer.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${inner.x} ${inner.y}`
}
