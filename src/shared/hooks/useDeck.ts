import { useEffect, useState } from 'react'
import { shuffle } from '../utils/random'

interface DeckState<T> {
  key: string
  deck: T[]
  index: number
  flipped: boolean
}

export interface Deck<T> {
  deck: T[]
  index: number
  /** Tarjeta actual, o undefined si se terminó el mazo. */
  current: T | undefined
  flipped: boolean
  flip: () => void
  move: (delta: number) => void
  /** Marca la tarjeta actual como sabida o para repasar, y pasa a la siguiente. */
  mark: (known: boolean) => void
  reshuffle: () => void
}

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.matches('input, select, textarea, button, a') || el.isContentEditable)

/**
 * Estado de un mazo de tarjetas: barajado, posición, cara visible y atajos de teclado
 * (espacio o Enter da vuelta, flechas para moverse, 1 repasar, 2 lo sé).
 * El mazo se vuelve a barajar solo cuando cambia `resetKey` o se llama a `reshuffle`.
 */
export function useDeck<T>(items: T[], resetKey: string, onMark: (item: T, known: boolean) => void): Deck<T> {
  const [seed, setSeed] = useState(0)
  const key = `${resetKey}#${seed}`
  const [state, setState] = useState<DeckState<T>>(() => ({ key, deck: shuffle(items), index: 0, flipped: false }))
  // Estado derivado: si cambió la clave, se arma un mazo nuevo (patrón recomendado por React).
  let now = state
  if (state.key !== key) {
    now = { key, deck: shuffle(items), index: 0, flipped: false }
    setState(now)
  }
  const { deck, index, flipped } = now
  const set = (patch: Partial<DeckState<T>>) => setState({ ...now, ...patch })
  const current = deck[index]

  const move = (d: number) => set({ index: Math.max(0, Math.min(deck.length, index + d)), flipped: false })
  const flip = () => set({ flipped: !flipped })
  const mark = (known: boolean) => {
    if (current === undefined) return
    onMark(current, known)
    move(1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey || current === undefined) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        flip()
      } else if (e.key === 'ArrowRight') move(1)
      else if (e.key === 'ArrowLeft') move(-1)
      else if (e.key === '1') mark(false)
      else if (e.key === '2') mark(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  return { deck, index, current, flipped, flip, move, mark, reshuffle: () => setSeed((s) => s + 1) }
}
