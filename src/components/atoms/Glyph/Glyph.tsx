import type { ReactNode } from 'react'
import { cx } from '../../../shared/utils/classNames'
import styles from './Glyph.module.scss'

export interface GlyphProps {
  children: ReactNode
  tone?: 'ai' | 'matcha'
  size?: 'sm' | 'md'
  /** Si es solo decorativo (el texto ya está en otro lado). */
  decorative?: boolean
}

/** Cuadrado con un carácter japonés grande (partícula, contador…). */
export function Glyph({ children, tone = 'ai', size = 'md', decorative }: GlyphProps) {
  return (
    <span lang="ja" aria-hidden={decorative || undefined} className={cx(styles.glyph, styles[tone], styles[size])}>
      {children}
    </span>
  )
}
