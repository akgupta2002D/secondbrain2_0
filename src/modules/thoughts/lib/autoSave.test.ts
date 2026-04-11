import { describe, expect, it, vi } from 'vitest'
import { createDebouncedCallback } from './autoSave'

describe('createDebouncedCallback', () => {
  it('debounces until delay elapses', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const { schedule } = createDebouncedCallback(fn, 100)
    schedule()
    schedule()
    schedule()
    expect(fn).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('flush runs pending work immediately', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const { schedule, flush } = createDebouncedCallback(fn, 500)
    schedule()
    await flush()
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
