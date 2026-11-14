import { useEffect, useState } from 'react'
import { shuffle } from '../utils/random'
import { readStorage, writeStorage } from '../utils/storage'

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

interface SavedDeck {
  key: string
  /** Orden del mazo, como posiciones en `items`. */
  order: number[]
  index: number
}

/** Mazo guardado para `resetKey`, si coincide con los items actuales. */
function restore<T>(storageKey: string | undefined, resetKey: string, items: T[]): DeckState<T> | null {
  if (!storageKey) return null
  const saved = readStorage<SavedDeck | null>(storageKey, null, 'session')
  if (!saved || saved.key !== resetKey || !Array.isArray(saved.order) || saved.order.length !== items.length) return null
  if (saved.order.some((i) => items[i] === undefined)) return null
  const index = Math.min(Math.max(0, Number(saved.index) || 0), items.length)
  return { key: `${resetKey}#0`, deck: saved.order.map((i) => items[i]), index, flipped: false }
}

/**
 * Estado de un mazo de tarjetas: barajado, posición, cara visible y atajos de teclado
 * (espacio o Enter da vuelta, flechas para moverse, 1 repasar, 2 lo sé).
 * El mazo se vuelve a barajar solo cuando cambia `resetKey` o se llama a `reshuffle`.
 * Con `storageKey`, el orden y la tarjeta actual se guardan en sessionStorage.
 */
export function useDeck<T>(items: T[], resetKey: string, onMark: (item: T, known: boolean) => void, storageKey?: string): Deck<T> {
  const [seed, setSeed] = useState(0)
  // Al recargar, la semilla vuelve a 0 y se recupera el mazo guardado para `resetKey`.
  const key = `${resetKey}#${seed}`
  const [state, setStored] = useState<DeckState<T>>(
    () => restore(storageKey, resetKey, items) ?? { key, deck: shuffle(items), index: 0, flipped: false },
  )
  const setState = (s: DeckState<T>) => {
    setStored(s)
    if (storageKey) {
      const position = new Map(items.map((it, i) => [it, i]))
      const order = s.deck.map((it) => position.get(it) ?? -1)
      writeStorage<SavedDeck>(storageKey, { key: resetKey, order, index: s.index }, 'session')
    }
  }
  // Estado derivado: si cambió la clave, se arma un mazo nuevo (patrón recomendado por React).
  let now = state
  if (state.key !== key) {
    now = (seed === 0 ? restore(storageKey, resetKey, items) : null) ?? { key, deck: shuffle(items), index: 0, flipped: false }
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
