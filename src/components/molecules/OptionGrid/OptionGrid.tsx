import type { ReactNode } from 'react'
import { cx } from '../../../shared/utils/classNames'
import styles from './OptionGrid.module.scss'

export interface OptionItem {
  value: string
  content: ReactNode
  /** Nombre accesible si el contenido no es texto simple. */
  label?: string
}

export interface OptionGridProps {
  label: string
  options: OptionItem[]
  answer: string
  /** Opción elegida, o null si todavía no se respondió. */
  chosen: string | null
  onChoose: (value: string) => void
  jp?: boolean
}

/** Opciones de respuesta. Después de responder marca la correcta y la elegida. */
export function OptionGrid({ label, options, answer, chosen, onChoose, jp }: OptionGridProps) {
  const answered = chosen !== null
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.srState}>{label}</legend>
      <div className={styles.grid}>
      {options.map((o) => {
        const isAnswer = answered && o.value === answer
        const isWrong = answered && o.value === chosen && o.value !== answer
        const state = isAnswer ? ' (correcta)' : isWrong ? ' (tu respuesta, incorrecta)' : ''
        return (
          <button
            key={o.value}
            type="button"
            lang={jp ? 'ja' : undefined}
            className={cx(styles.option, jp && styles.jp, isAnswer && styles.ok, isWrong && styles.bad)}
            disabled={answered}
            aria-label={o.label ? o.label + state : undefined}
            onClick={() => onChoose(o.value)}
          >
            {o.content}
            {!o.label && state && <span className={styles.srState}>{state}</span>}
          </button>
        )
      })}
      </div>
    </fieldset>
  )
}
