import type { CSSProperties } from 'react'
import { Fragment, useId, useMemo } from 'react'
import type { GoalsGraphData } from '../model/types'
import { splitNodeLabelLines } from '../lib/splitNodeLabelLines'
import { stringSeedRadians, stringVineAsymmetry } from '../lib/organicBlobPath'
import { ringNodeFontSize, ringNodeRadius } from '../lib/ringNodeLabelLayout'
import { ringPositions, vinePathCubic } from '../lib/polarLayout'

type Props = {
  data: GoalsGraphData
  selectedId: string | null
  onSelect: (id: string | null) => void
}

/** Oversized viewBox so ring glows / labels stay inside the frame. */
const VIEW = 452
const CX = VIEW / 2
const CY = VIEW / 2
/** Ring radius: larger pushes goals farther from Me and farther apart on the circle. */
const RING_R = 158
/** Shift rotating flame mass toward graph center (attraction read). */
const FLAME_PULL_PX = 7.5
const R_CENTER = 48
const R_NODE_HIT_PAD = 18
const VINE_BEND = 40

const DEFAULT_VINE_COLORS = [
  '#22d3ee',
  '#a78bfa',
  '#f472b6',
  '#34d399',
  '#fcd34d',
  '#60a5fa',
  '#fb923c',
  '#4ade80',
  '#f87171',
  '#2dd4bf',
  '#c084fc',
  '#38bdf8',
]

export function IdentityGraph({ data, selectedId, onSelect }: Props) {
  const uid = useId().replace(/:/g, '')
  const n = data.nodes.length
  const ring = useMemo(() => ringPositions(n, CX, CY, RING_R), [n])

  const nodeLayouts = useMemo(() => {
    return data.nodes.map((node, i) => {
      const P = ring[i]!
      const [line1, line2] = splitNodeLabelLines(node.label)
      const r = ringNodeRadius(line1, line2, n)
      const fontSize = ringNodeFontSize(line1, line2, r)
      const seed = stringSeedRadians(node.id)
      const tcx = CX - P.x
      const tcy = CY - P.y
      const tlen = Math.hypot(tcx, tcy) || 1
      const flameShiftX = (tcx / tlen) * FLAME_PULL_PX
      const flameShiftY = (tcy / tlen) * FLAME_PULL_PX
      return {
        cx: P.x,
        cy: P.y,
        r,
        fontSize,
        line1,
        line2,
        seed,
        flameShiftX,
        flameShiftY,
        hitR: r + R_NODE_HIT_PAD,
        vineAsym: stringVineAsymmetry(node.id),
      }
    })
  }, [data.nodes, ring, n])

  const colors = useMemo(
    () =>
      data.nodes.map(
        (node, i) => node.strokeColor ?? DEFAULT_VINE_COLORS[i % DEFAULT_VINE_COLORS.length]!,
      ),
    [data.nodes],
  )

  const vines = useMemo(() => {
    return data.nodes.map((node, i) => {
      const P = ring[i]!
      const L = nodeLayouts[i]!
      const uLen = Math.hypot(CX - P.x, CY - P.y) || 1
      const ux = (CX - P.x) / uLen
      const uy = (CY - P.y) / uLen
      const start = { x: P.x + ux * L.r, y: P.y + uy * L.r }
      const end = { x: CX - ux * R_CENTER, y: CY - uy * R_CENTER }
      const bend = VINE_BEND + L.vineAsym * 10
      const d = vinePathCubic(start, end, bend, L.vineAsym * 0.95)
      return { id: node.id, d, color: colors[i]! }
    })
  }, [data.nodes, ring, colors, nodeLayouts])

  const gradPrefix = `${uid}`

  return (
    <svg
      className="identityGraphSvg"
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      height="auto"
      role="img"
      aria-label="Identity graph: energy toward center"
    >
      <defs>
        <filter id={`${gradPrefix}-vineGlow`} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${gradPrefix}-flameA`} cx="42%" cy="38%" r="65%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="1" />
          <stop offset="18%" stopColor="#fde047" stopOpacity="1" />
          <stop offset="42%" stopColor="#fb923c" stopOpacity="1" />
          <stop offset="68%" stopColor="#ef4444" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id={`${gradPrefix}-flameB`} cx="58%" cy="62%" r="70%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#e879f9" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id={`${gradPrefix}-flameC`} cx="50%" cy="50%" r="55%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.15" />
        </radialGradient>

        <clipPath id={`${gradPrefix}-flameClip`}>
          <circle cx={CX} cy={CY} r={R_CENTER + 26} />
        </clipPath>

        {data.nodes.map((node, i) => {
          const c = colors[i]!
          const gid = `${gradPrefix}-mono-${node.id}`
          return (
            <Fragment key={`mono-${node.id}`}>
              <clipPath id={`${gradPrefix}-ringFlameClip-${node.id}`} clipPathUnits="userSpaceOnUse">
                <circle cx={ring[i]!.x} cy={ring[i]!.y} r={nodeLayouts[i]!.r} />
              </clipPath>
              <radialGradient id={`${gid}-a`} cx="40%" cy="34%" r="72%" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={c} stopOpacity="0.92" />
                <stop offset="48%" stopColor={c} stopOpacity="0.55" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${gid}-b`} cx="62%" cy="58%" r="68%" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={c} stopOpacity="0.78" />
                <stop offset="52%" stopColor={c} stopOpacity="0.42" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${gid}-c`} cx="50%" cy="48%" r="58%" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={c} stopOpacity="0.68" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </radialGradient>
            </Fragment>
          )
        })}

        {vines.map((v, i) => (
          <linearGradient
            key={`g-${v.id}`}
            id={`${gradPrefix}-grad-${v.id}`}
            gradientUnits="userSpaceOnUse"
            x1={ring[i]!.x}
            y1={ring[i]!.y}
            x2={CX}
            y2={CY}
          >
            <stop offset="0%" stopColor={v.color} stopOpacity="1" />
            <stop offset="32%" stopColor={v.color} stopOpacity="0.98" />
            <stop offset="58%" stopColor="#fef08a" stopOpacity="0.98" />
            <stop offset="82%" stopColor="#fffbeb" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.88" />
          </linearGradient>
        ))}
      </defs>

      <g className="identityVineLayerUnder" aria-hidden="true">
        {vines.map((v) => (
          <path
            key={`u-${v.id}`}
            d={v.d}
            fill="none"
            stroke={v.color}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={selectedId === null || selectedId === v.id ? 0.55 : 0.14}
            filter={`url(#${gradPrefix}-vineGlow)`}
          />
        ))}
      </g>

      <g className="identityVineLayer" aria-hidden="true">
        {vines.map((v) => (
          <path
            key={v.id}
            d={v.d}
            fill="none"
            className="identityVineStroke identityVineStrokeHot"
            stroke={`url(#${gradPrefix}-grad-${v.id})`}
            strokeWidth={3.65}
            strokeLinecap="round"
            opacity={selectedId === null || selectedId === v.id ? 1 : 0.35}
            filter={`url(#${gradPrefix}-vineGlow)`}
          />
        ))}
      </g>

      <g clipPath={`url(#${gradPrefix}-flameClip)`} aria-hidden="true">
        <g transform={`translate(${CX} ${CY})`}>
          <g className="identityFlameSpin">
            <ellipse
              cx={0}
              cy={0}
              rx={62}
              ry={50}
              fill={`url(#${gradPrefix}-flameA)`}
              opacity={0.88}
              transform="rotate(12)"
            />
            <ellipse
              cx={0}
              cy={0}
              rx={56}
              ry={54}
              fill={`url(#${gradPrefix}-flameB)`}
              opacity={0.72}
              transform="rotate(-48)"
            />
            <ellipse
              cx={0}
              cy={0}
              rx={50}
              ry={58}
              fill={`url(#${gradPrefix}-flameC)`}
              opacity={0.55}
              transform="rotate(110)"
            />
          </g>
        </g>
      </g>

      {data.nodes.map((node, i) => {
        const P = ring[i]!
        const L = nodeLayouts[i]!
        const active = selectedId === node.id
        const { line1, line2, fontSize, hitR, r, flameShiftX, flameShiftY, seed, vineAsym } = L
        const c = colors[i]!
        const monoId = `${gradPrefix}-mono-${node.id}`
        const maxChars = 13
        const ellip = (s: string) => (s.length > maxChars ? `${s.slice(0, maxChars - 1)}…` : s)
        const dimmed = !(selectedId === null || selectedId === node.id)
        const flameDur = 14 + (i % 6) * 1.35
        const flameDelay = -((seed % 6.283) * 0.32)
        return (
          <g
            key={node.id}
            role="button"
            tabIndex={0}
            aria-label={`${node.label}${node.detail ? `. ${node.detail}` : ''}`}
            aria-pressed={active}
            onClick={() => onSelect(active ? null : node.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(active ? null : node.id)
              }
            }}
            className="identityNodeGroup"
          >
            <circle
              cx={P.x}
              cy={P.y}
              r={hitR}
              fill="transparent"
              className="identityNodeHit"
            />
            <circle
              cx={P.x}
              cy={P.y}
              r={r + 5}
              fill="none"
              stroke={c}
              strokeWidth={10}
              strokeOpacity={dimmed ? 0.12 : 0.4}
              className="identityNodeGlow"
              pointerEvents="none"
            />
            <g clipPath={`url(#${gradPrefix}-ringFlameClip-${node.id})`} pointerEvents="none">
              <g
                transform={`translate(${P.x + flameShiftX} ${P.y + flameShiftY})`}
                className={`identityRingFlameSpin${vineAsym >= 0 ? ' identityRingFlameSpin--rev' : ''}`}
                style={
                  {
                    ['--ring-flame-dur' as string]: `${flameDur}s`,
                    ['--ring-flame-delay' as string]: `${flameDelay}s`,
                  } as CSSProperties
                }
              >
                <ellipse
                  cx={0}
                  cy={0}
                  rx={r * 1.04}
                  ry={r * 0.8}
                  fill={`url(#${monoId}-a)`}
                  opacity={dimmed ? 0.35 : 0.88}
                  transform="rotate(14)"
                />
                <ellipse
                  cx={0}
                  cy={0}
                  rx={r * 0.9}
                  ry={r * 0.96}
                  fill={`url(#${monoId}-b)`}
                  opacity={dimmed ? 0.3 : 0.72}
                  transform="rotate(-42)"
                />
                <ellipse
                  cx={0}
                  cy={0}
                  rx={r * 0.86}
                  ry={r * 0.92}
                  fill={`url(#${monoId}-c)`}
                  opacity={dimmed ? 0.25 : 0.58}
                  transform="rotate(108)"
                />
              </g>
            </g>
            <circle
              cx={P.x}
              cy={P.y}
              r={r}
              className="identityNodeShape"
              fill="rgba(0,0,0,0.64)"
              stroke={c}
              strokeWidth={active ? 3.2 : 2.1}
              opacity={dimmed ? 0.5 : 1}
              pointerEvents="none"
            />
            <text
              x={P.x}
              y={P.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="identityNodeLabel"
              fill="#f9fafb"
              fontSize={fontSize}
              fontWeight={800}
              pointerEvents="none"
            >
              <tspan x={P.x} dy={line2 ? '-0.52em' : '0'}>
                {ellip(line1)}
              </tspan>
              {line2 ? (
                <tspan x={P.x} dy="1.12em">
                  {ellip(line2)}
                </tspan>
              ) : null}
            </text>
          </g>
        )
      })}

      <g
        className="identityCenterGroup"
        role="button"
        tabIndex={0}
        aria-label={`${data.center.label}, center of your goals`}
        onClick={() => onSelect(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(null)
          }
        }}
      >
        <circle
          cx={CX}
          cy={CY}
          r={R_CENTER + 14}
          fill="transparent"
          className="identityNodeHit identityCenterHit"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_CENTER + 6}
          fill="none"
          stroke="#fde047"
          strokeWidth={14}
          strokeOpacity={0.22}
          className="identityCenterPulseRing"
          pointerEvents="none"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_CENTER}
          className="identityCenterVeil identityCenterCircle"
          fill="rgba(0,0,0,0.45)"
          stroke="rgba(254, 243, 199, 0.55)"
          strokeWidth={2.2}
          pointerEvents="none"
        />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="identityCenterLabel"
          fill="#fffbeb"
          fontSize={19}
          fontWeight={950}
          pointerEvents="none"
        >
          {data.center.label}
        </text>
      </g>
    </svg>
  )
}
