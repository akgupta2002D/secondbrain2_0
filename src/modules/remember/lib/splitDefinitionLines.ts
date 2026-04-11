/**
 * Split definition text for display on the card back: break after a period
 * followed by whitespace (sentence boundary). Single segment returns one line.
 */
export function splitDefinitionForDisplay(text: string): string[] {
  const trimmed = text.trim()
  if (trimmed.length === 0) return ['']

  const parts = trimmed.split(/(?<=\.)\s+/).filter((s) => s.length > 0)
  return parts.length > 0 ? parts : [trimmed]
}
