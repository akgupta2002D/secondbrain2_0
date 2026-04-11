const prefix = 'sb.thoughts.draft.'

export function draftBackupKey(thoughtId: string): string {
  return `${prefix}${thoughtId}`
}

export function saveDraftBackup(thoughtId: string, body: string): void {
  try {
    localStorage.setItem(draftBackupKey(thoughtId), body)
  } catch {
    // Quota or private mode — ignore.
  }
}

export function loadDraftBackup(thoughtId: string): string | null {
  try {
    return localStorage.getItem(draftBackupKey(thoughtId))
  } catch {
    return null
  }
}

export function clearDraftBackup(thoughtId: string): void {
  try {
    localStorage.removeItem(draftBackupKey(thoughtId))
  } catch {
    // ignore
  }
}
