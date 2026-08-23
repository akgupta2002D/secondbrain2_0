export type Thought = {
  id: string
  title: string | null
  body: string
  createdAt: string
  updatedAt: string
}

export type ThoughtSaveState =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'error'
  | 'offline'

export type ThoughtDraft = {
  body: string
  dirty: boolean
  saveState: ThoughtSaveState
  lastError: string | null
}
