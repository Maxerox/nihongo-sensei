import { cx } from '../../../shared/utils/classNames'
import { speakJapanese } from '../../../shared/utils/speech'
import styles from './ReadingCell.module.scss'

export interface ReadingCellProps {
  /** Lo que se lee (8日, 3人…). */
  label: string
  /** Lectura en hiragana. */
  reading: string
  irregular?: boolean
  /** Lectura tapada para practicar de memoria. */
  hidden?: boolean
  onReveal?: () => void
}

/** Casilla con una lectura. Al tocarla se destapa (si estaba tapada) y se escucha. */
export function ReadingCell({ label, reading, irregular, hidden, onReveal }: ReadingCellProps) {
  const name = hidden
    ? `${label}: lectura oculta. Tocá para verla`
    : `${label}: ${reading}${irregular ? ', irregular' : ''}`
  return (
    <button
      type="button"
      className={cx(styles.cell, irregular && styles.irregular)}
      aria-label={name}
      onClick={() => {
        if (hidden) onReveal?.()
        speakJapanese(reading)
      }}
    >
      <span className={styles.label} lang="ja" aria-hidden="true">
        {label}
      </span>
      <span className={cx(styles.reading, hidden && styles.covered)} lang="ja" aria-hidden="true">
        {reading}
      </span>
    </button>
  )
}
