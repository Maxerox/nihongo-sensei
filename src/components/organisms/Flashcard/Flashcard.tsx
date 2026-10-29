import { JpText } from '../../atoms/JpText'
import { LessonTag } from '../../atoms/LessonTag'
import { SpeakButton } from '../../atoms/SpeakButton'
import { FlipCard } from '../../molecules/FlipCard'
import type { VocabWord } from '../../../shared/types/content'
import { cx } from '../../../shared/utils/classNames'
import { displayWord } from '../../../shared/utils/kanji'
import styles from './Flashcard.module.scss'

export type Direction = 'jp' | 'es'

export interface FlashcardProps {
  word: VocabWord
  direction: Direction
  showAllKanji: boolean
  known: boolean
  flipped: boolean
  onFlip: () => void
  position: { index: number; total: number }
}

/** Tarjeta de vocabulario: japonés de un lado, significado del otro. */
export function Flashcard({ word, direction, showAllKanji, known, flipped, onFlip, position }: FlashcardProps) {
  const d = displayWord(word, showAllKanji)
  const long = d.main.length > 7

  const japanese = (
    <>
      <JpText text={d.main} reading={d.reading || undefined} className={cx(styles.word, long && styles.long)} />
      {d.reading === '' && d.main !== word.kana && <span className={styles.kana}>{word.kana}</span>}
    </>
  )
  const spanish = (
    <>
      {word.emoji && (
        <span className={styles.emoji} aria-hidden="true">
          {word.emoji}
        </span>
      )}
      <span className={styles.meaning}>{word.es}</span>
    </>
  )

  return (
    <FlipCard
      front={direction === 'jp' ? japanese : spanish}
      back={direction === 'jp' ? spanish : japanese}
      meta={
        <>
          <LessonTag lesson={word.lesson} /> {position.index + 1}/{position.total}
        </>
      }
      knownLabel={known ? '✓ sabida' : undefined}
      flipped={flipped}
      onFlip={onFlip}
      corner={<SpeakButton text={word.kana} />}
    />
  )
}
