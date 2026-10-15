import { useId } from 'react'
import { JpText } from '../../atoms/JpText'
import { LessonTag } from '../../atoms/LessonTag'
import { SpeakButton } from '../../atoms/SpeakButton'
import { VisuallyHidden } from '../../atoms/VisuallyHidden'
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

/** Tarjeta que se da vuelta. La cara oculta queda fuera del árbol de accesibilidad. */
export function Flashcard({ word, direction, showAllKanji, known, flipped, onFlip, position }: FlashcardProps) {
  const hintId = useId()
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
  const front = direction === 'jp' ? japanese : spanish
  const back = direction === 'jp' ? spanish : japanese
  const counter = `${position.index + 1}/${position.total}`

  return (
    <div className={styles.stage}>
      <button
        type="button"
        className={cx(styles.card, flipped && styles.flipped)}
        onClick={onFlip}
        aria-describedby={hintId}
      >
        <span className={cx(styles.face, styles.front)} aria-hidden={flipped}>
          <span className={styles.meta}>
            <LessonTag lesson={word.lesson} /> {counter}
          </span>
          {front}
          {known && <span className={styles.known}>✓ sabida</span>}
        </span>
        <span className={cx(styles.face, styles.back)} aria-hidden={!flipped}>
          <span className={styles.meta}>
            <LessonTag lesson={word.lesson} /> {counter}
          </span>
          {back}
          {known && <span className={styles.known}>✓ sabida</span>}
        </span>
      </button>
      <VisuallyHidden id={hintId}>
        {flipped ? 'Mostrando la respuesta. Tocá para volver.' : 'Tocá para ver la respuesta.'}
      </VisuallyHidden>
      <SpeakButton text={word.kana} className={styles.speak} />
    </div>
  )
}
