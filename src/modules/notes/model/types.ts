export type Note = {
  id: string
  text: string
  date: string
}

export type NoteSaveState = 'idle' | 'saving' | 'saved' | 'error' | 'offline'
