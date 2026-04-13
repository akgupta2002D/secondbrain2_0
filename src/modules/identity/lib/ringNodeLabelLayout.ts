/** Radius (SVG units) so two-line labels fit inside the organic blob. */
export function ringNodeRadius(line1: string, line2: string, nodeCount: number): number {
  const longest = Math.max(line1.length, line2.length || 0, 1)
  const base = nodeCount > 10 ? 39 : 44
  const grow = Math.max(0, longest - 6) * 2.4
  return Math.min(54, base + grow)
}

/** Font size (user units) from fitted circle radius and line lengths. */
export function ringNodeFontSize(line1: string, line2: string, r: number): number {
  const maxLen = Math.max(line1.length, line2.length || 0, 1)
  const twoLine = line2.length > 0
  const inner = r * 0.78
  const charW = 0.56
  const fromH = inner / (maxLen * charW)
  const fromV = twoLine ? (inner * 1.9) / 2.42 : (inner * 2) / 1.12
  const raw = Math.min(fromH, fromV)
  return Math.max(7.25, Math.min(11.25, raw))
}
