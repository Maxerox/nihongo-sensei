import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRapidClicks } from '../useRapidClicks'

describe('useRapidClicks', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('dispara con 5 clicks seguidos', () => {
    const onTrigger = vi.fn<() => void>()
    const { result } = renderHook(() => useRapidClicks(5, 600, onTrigger))
    for (let i = 0; i < 5; i++) {
      act(() => result.current())
      vi.advanceTimersByTime(200)
    }
    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('vuelve a contar si hay una pausa larga', () => {
    const onTrigger = vi.fn<() => void>()
    const { result } = renderHook(() => useRapidClicks(5, 600, onTrigger))
    for (let i = 0; i < 4; i++) {
      act(() => result.current())
      vi.advanceTimersByTime(200)
    }
    vi.advanceTimersByTime(1000)
    act(() => result.current())
    expect(onTrigger).not.toHaveBeenCalled()
  })
})
