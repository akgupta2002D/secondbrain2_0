/** Split a short label onto two lines for ring nodes (two-word phrases read clearly). */
export function splitNodeLabelLines(label: string): [string, string] {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['', '']
  if (words.length === 1) return [words[0]!, '']
  if (words.length === 2) return [words[0]!, words[1]!]
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}
