/**
 * Debounced scheduling with explicit flush for tab hide / unload paths.
 */
export function createDebouncedCallback(
  fn: () => void | Promise<void>,
  delayMs: number,
): {
  schedule: () => void
  flush: () => Promise<void>
  cancel: () => void
} {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending = false

  const run = async (): Promise<void> => {
    pending = false
    await fn()
  }

  return {
    schedule(): void {
      pending = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        void run()
      }, delayMs)
    },

    async flush(): Promise<void> {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (pending) {
        pending = false
        await run()
      }
    },

    cancel(): void {
      if (timer) clearTimeout(timer)
      timer = null
      pending = false
    },
  }
}
