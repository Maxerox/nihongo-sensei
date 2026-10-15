import { useCallback, useRef } from 'react'

/**
 * Devuelve un handler de click que llama a `onTrigger` cuando se hacen
 * `count` clicks seguidos, con menos de `maxGapMs` entre uno y otro.
 */
export function useRapidClicks(count: number, maxGapMs: number, onTrigger: () => void): () => void {
  const clicks = useRef(0)
  const last = useRef(0)
  return useCallback(() => {
    const now = Date.now()
    clicks.current = now - last.current <= maxGapMs ? clicks.current + 1 : 1
    last.current = now
    if (clicks.current >= count) {
      clicks.current = 0
      onTrigger()
    }
  }, [count, maxGapMs, onTrigger])
}
