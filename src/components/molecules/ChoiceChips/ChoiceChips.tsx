import { Chip } from '../../atoms/Chip'
import styles from './ChoiceChips.module.scss'

export interface ChoiceOption<V extends string> {
  value: V
  label: string
  /** Cuántos elementos hay en esta opción (se muestra al lado). */
  count?: number
}

export interface ChoiceChipsProps<V extends string> {
  label: string
  options: ChoiceOption<V>[]
  value: V
  onChange: (value: V) => void
}

/**
 * Elegir una sola opción con chips (por ejemplo, el tipo de palabra).
 * Cada chip es un interruptor con aria-pressed; el elegido queda marcado.
 */
export function ChoiceChips<V extends string>({ label, options, value, onChange }: ChoiceChipsProps<V>) {
  return (
    <fieldset className={styles.choice}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.chips}>
        {options.map((o) => (
          <Chip
            key={o.value}
            pressed={o.value === value}
            disabled={o.count === 0 && o.value !== value}
            onClick={() => onChange(o.value)}
            className={styles.chip}
          >
            {o.label}
            {o.count !== undefined && <span className={styles.count}> {o.count}</span>}
          </Chip>
        ))}
      </div>
    </fieldset>
  )
}
