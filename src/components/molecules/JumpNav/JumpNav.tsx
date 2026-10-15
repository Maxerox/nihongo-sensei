import { Chip } from '../../atoms/Chip'
import { JpText } from '../../atoms/JpText'
import { scrollToId } from '../../../shared/utils/scroll'
import styles from './JumpNav.module.scss'

export interface JumpNavItem {
  /** id del elemento al que se salta. */
  targetId: string
  text: string
  /** Si el texto es japonés. */
  jp?: boolean
  /** Lectura de la palabra entera, si se conoce. */
  reading?: string
  /** Nombre accesible (por ejemplo, "Ir a la lección 5"). */
  label: string
}

export interface JumpNavProps {
  label: string
  items: JumpNavItem[]
  onJump?: (targetId: string) => void
}

/** Chips para saltar a una parte de la página. */
export function JumpNav({ label, items, onJump }: JumpNavProps) {
  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {items.map((it) => (
          <li key={it.targetId}>
            <Chip
              jp={it.jp}
              aria-label={it.label}
              title={it.label}
              onClick={() => {
                onJump?.(it.targetId)
                // Esperar a que la página termine de dibujarse si onJump cambió algo.
                requestAnimationFrame(() => scrollToId(it.targetId))
              }}
            >
              {it.jp ? <JpText text={it.text} reading={it.reading} /> : it.text}
            </Chip>
          </li>
        ))}
      </ul>
    </nav>
  )
}
