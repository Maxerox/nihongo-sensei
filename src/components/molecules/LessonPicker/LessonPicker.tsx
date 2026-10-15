import type { ReactNode } from 'react'
import { Chip } from '../../atoms/Chip'
import styles from './LessonPicker.module.scss'

export interface LessonPickerProps {
  label: string
  lessons: number[]
  selected: number[]
  onChange: (selected: number[]) => void
  /** Texto extra debajo (por ejemplo, cuántas oraciones hay). */
  summary?: ReactNode
  /** Nombre de cada chip (por ejemplo, "Lección 3 · 4 oraciones"). */
  describe?: (lesson: number) => string
}

/** Elegir varias lecciones con chips de tipo interruptor. */
export function LessonPicker({ label, lessons, selected, onChange, summary, describe }: LessonPickerProps) {
  const set = new Set(selected)
  const toggle = (l: number) =>
    onChange(set.has(l) ? selected.filter((x) => x !== l) : [...selected, l].sort((a, b) => a - b))

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.actions}>
        <Chip className={styles.action} onClick={() => onChange([...lessons])}>
          Todas
        </Chip>
        <Chip className={styles.action} onClick={() => onChange([])}>
          Ninguna
        </Chip>
      </div>
      <div className={styles.chips}>
        {lessons.map((l) => (
          <Chip
            key={l}
            pressed={set.has(l)}
            onClick={() => toggle(l)}
            title={describe?.(l)}
            aria-label={describe ? describe(l) : `Lección ${l}`}
          >
            {l}
          </Chip>
        ))}
      </div>
      {summary && (
        <p className={styles.summary} aria-live="polite">
          {summary}
        </p>
      )}
    </fieldset>
  )
}
