import { useEffect, useState } from 'react'
import { Button } from '../../atoms/Button'
import { EmptyState } from '../../atoms/EmptyState'
import { Kbd } from '../../atoms/Kbd'
import { Panel } from '../../atoms/Panel'
import { VisuallyHidden } from '../../atoms/VisuallyHidden'
import type { VocabWord } from '../../../shared/types/content'
import { shuffle } from '../../../shared/utils/random'
import { Flashcard, type Direction } from '../Flashcard'
import styles from './FlashcardDeck.module.scss'

export interface FlashcardDeckProps {
  words: VocabWord[]
  /** Cuando cambia, el mazo se vuelve a armar y barajar (por ejemplo, al cambiar de lecciones). */
  resetKey: string
  direction: Direction
  showAllKanji: boolean
  known: Set<string>
  onMark: (id: string, known: boolean) => void
  /** Texto si no hay palabras. */
  emptyMessage: string
}

interface DeckState {
  key: string
  deck: VocabWord[]
  index: number
  flipped: boolean
}

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.matches('input, select, textarea, button, a') || el.isContentEditable)

/** Mazo de tarjetas con controles y atajos de teclado. */
export function FlashcardDeck({ words, resetKey, direction, showAllKanji, known, onMark, emptyMessage }: FlashcardDeckProps) {
  const [seed, setSeed] = useState(0)
  const key = `${resetKey}#${seed}`
  const [state, setState] = useState<DeckState>(() => ({ key, deck: shuffle(words), index: 0, flipped: false }))
  // Estado derivado: si cambió la clave, se arma un mazo nuevo (patrón recomendado por React).
  let current = state
  if (state.key !== key) {
    current = { key, deck: shuffle(words), index: 0, flipped: false }
    setState(current)
  }
  const { deck, index, flipped } = current
  const set = (patch: Partial<DeckState>) => setState({ ...current, ...patch })

  const word = deck[index]
  const move = (d: number) => set({ index: Math.max(0, Math.min(deck.length, index + d)), flipped: false })
  const mark = (k: boolean) => {
    if (!word) return
    onMark(word.id, k)
    move(1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        set({ flipped: !flipped })
      } else if (e.key === 'ArrowRight') move(1)
      else if (e.key === 'ArrowLeft') move(-1)
      else if (e.key === '1') mark(false)
      else if (e.key === '2') mark(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  if (deck.length === 0) return <EmptyState>{emptyMessage}</EmptyState>

  if (!word) {
    return (
      <Panel centered>
        <span className={styles.big} aria-hidden="true">
          🎌
        </span>
        <h2 className={styles.doneTitle}>¡Terminaste el mazo!</h2>
        <p className={styles.sub}>{deck.length} tarjetas repasadas.</p>
        <Button variant="primary" size="lg" onClick={() => setSeed((s) => s + 1)}>
          Barajar y empezar de nuevo
        </Button>
      </Panel>
    )
  }

  return (
    <div className={styles.deck}>
      <Flashcard
        word={word}
        direction={direction}
        showAllKanji={showAllKanji}
        known={known.has(word.id)}
        flipped={flipped}
        onFlip={() => set({ flipped: !flipped })}
        position={{ index, total: deck.length }}
      />
      <VisuallyHidden>
        <span aria-live="polite">{flipped ? `Respuesta: ${direction === 'jp' ? word.es : word.kana}` : ''}</span>
      </VisuallyHidden>
      <div className={styles.controls}>
        <Button size="lg" className={styles.nav} onClick={() => move(-1)} disabled={index === 0} aria-label="Tarjeta anterior">
          <span aria-hidden="true">←</span>
        </Button>
        <Button size="lg" variant="danger" onClick={() => mark(false)}>
          Repasar
        </Button>
        <Button size="lg" variant="success" onClick={() => mark(true)}>
          Lo sé ✓
        </Button>
        <Button size="lg" className={styles.nav} onClick={() => setSeed((s) => s + 1)} aria-label="Barajar el mazo">
          <span aria-hidden="true">⤮</span>
        </Button>
      </div>
      <p className={styles.keys}>
        <Kbd>espacio</Kbd> dar vuelta · <Kbd>←</Kbd>
        <Kbd>→</Kbd> moverse · <Kbd>1</Kbd> repasar · <Kbd>2</Kbd> lo sé
      </p>
    </div>
  )
}
