import { Chip } from '../../atoms/Chip'
import styles from './ToggleChips.module.scss'

export interface ToggleOption<V extends string> {
  value: V
  label: string
  /** Japonés, con la tipografía japonesa. */
  jp?: boolean
  /** Nombre accesible, si `label` no alcanza. */
  description?: string
}

export interface ToggleChipsProps<V extends string> {
  label: string
  options: ToggleOption<V>[]
  selected: V[]
  onChange: (selected: V[]) => void
}

/** Elegir varias opciones con chips de tipo interruptor (aria-pressed). Mantiene el orden de `options`. */
export function ToggleChips<V extends string>({ label, options, selected, onChange }: ToggleChipsProps<V>) {
  const set = new Set(selected)
  const toggle = (v: V) => {
    const next = new Set(set)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    onChange(options.map((o) => o.value).filter((x) => next.has(x)))
  }
  return (
    <fieldset className={styles.toggle}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.chips}>
        {options.map((o) => (
          <Chip
            key={o.value}
            pressed={set.has(o.value)}
            onClick={() => toggle(o.value)}
            aria-label={o.description}
            title={o.description}
            className={styles.chip}
          >
            {o.jp ? <span lang="ja">{o.label}</span> : o.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  )
}
