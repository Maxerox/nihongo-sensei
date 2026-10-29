import { EmptyState } from '../../atoms/EmptyState'
import { VisuallyHidden } from '../../atoms/VisuallyHidden'
import { DeckControls } from '../../molecules/DeckControls'
import { DeckDone } from '../../molecules/DeckDone'
import { useDeck } from '../../../shared/hooks/useDeck'
import type { VocabWord } from '../../../shared/types/content'
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

/** Mazo de tarjetas de vocabulario con controles y atajos de teclado. */
export function FlashcardDeck({ words, resetKey, direction, showAllKanji, known, onMark, emptyMessage }: FlashcardDeckProps) {
  const d = useDeck(words, resetKey, (w, k) => onMark(w.id, k))
  const word = d.current

  if (d.deck.length === 0) return <EmptyState>{emptyMessage}</EmptyState>
  if (!word) return <DeckDone count={d.deck.length} onRestart={d.reshuffle} />

  return (
    <div className={styles.deck}>
      <Flashcard
        word={word}
        direction={direction}
        showAllKanji={showAllKanji}
        known={known.has(word.id)}
        flipped={d.flipped}
        onFlip={d.flip}
        position={{ index: d.index, total: d.deck.length }}
      />
      <VisuallyHidden>
        <span aria-live="polite">{d.flipped ? `Respuesta: ${direction === 'jp' ? word.es : word.kana}` : ''}</span>
      </VisuallyHidden>
      <DeckControls
        onPrev={() => d.move(-1)}
        prevDisabled={d.index === 0}
        onReview={() => d.mark(false)}
        onKnow={() => d.mark(true)}
        onShuffle={d.reshuffle}
      />
    </div>
  )
}
