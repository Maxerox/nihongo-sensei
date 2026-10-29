import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { LessonTag } from '../../atoms/LessonTag'
import { VisuallyHidden } from '../../atoms/VisuallyHidden'
import { DeckControls } from '../../molecules/DeckControls'
import { DeckDone } from '../../molecules/DeckDone'
import { FlipCard } from '../../molecules/FlipCard'
import { KanjiReadings } from '../../molecules/KanjiReadings'
import { useDeck } from '../../../shared/hooks/useDeck'
import type { KanjiPracticeItem } from '../KanjiDrawPractice'
import styles from './KanjiDeck.module.scss'

export type KanjiDirection = 'kanji' | 'meaning'

export interface KanjiDeckProps {
  items: KanjiPracticeItem[]
  resetKey: string
  direction: KanjiDirection
  known: Set<string>
  onMark: (kanji: string, known: boolean) => void
}

/** Tarjetas de kanji: del kanji a sus lecturas y significado, o al revés. */
export function KanjiDeck({ items, resetKey, direction, known, onMark }: KanjiDeckProps) {
  const d = useDeck(items, `${resetKey}|${direction}`, (k, isKnown) => onMark(k.kanji, isKnown))
  const k = d.current

  if (d.deck.length === 0) return <EmptyState>Elegí al menos una unidad.</EmptyState>
  if (!k) return <DeckDone count={d.deck.length} onRestart={d.reshuffle} />

  // La cara de la pregunta no lleva lecturas: son la respuesta.
  const kanjiFace = (
    <span lang="ja" className={styles.kanji}>
      {k.kanji}
    </span>
  )
  const meaningFace = <span className={styles.meaning}>{k.meaning}</span>
  const answer = (
    <span className={styles.answer}>
      {direction === 'meaning' && (
        <span lang="ja" className={styles.kanjiSmall}>
          {k.kanji}
        </span>
      )}
      {direction === 'kanji' && <span className={styles.meaningSmall}>{k.meaning}</span>}
      <KanjiReadings on={k.on} kun={k.kun} compact />
      <span className={styles.examples}>
        {k.examples.slice(0, 2).map((e) => (
          <span key={e.word} className={styles.example}>
            <JpText text={e.word} reading={e.reading} /> {e.es}
          </span>
        ))}
      </span>
    </span>
  )

  return (
    <div className={styles.deck}>
      <FlipCard
        front={direction === 'kanji' ? kanjiFace : meaningFace}
        back={answer}
        meta={
          <>
            <LessonTag lesson={k.unit} kind="unit" /> {d.index + 1}/{d.deck.length}
          </>
        }
        knownLabel={known.has(k.kanji) ? '✓ sabido' : undefined}
        flipped={d.flipped}
        onFlip={d.flip}
      />
      <VisuallyHidden>
        <span aria-live="polite">
          {d.flipped ? `Respuesta: ${direction === 'kanji' ? k.meaning : k.kanji}. On: ${k.on.join(', ')}. Kun: ${k.kun.map((r) => r.replace('.', '')).join(', ')}.` : ''}
        </span>
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
