import type { HTMLAttributes } from 'react'
import { cx } from '../../../shared/utils/classNames'
import styles from './Panel.module.scss'

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside'
  /** Centra el contenido (pantallas de "terminaste"). */
  centered?: boolean
}

/** Superficie con borde y relleno. */
export function Panel({ as: Tag = 'div', centered, className, ...rest }: PanelProps) {
  return <Tag className={cx(styles.panel, centered && styles.centered, className)} {...rest} />
}
