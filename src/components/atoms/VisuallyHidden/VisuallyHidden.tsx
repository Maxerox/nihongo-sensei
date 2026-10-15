import type { ReactNode } from 'react'
import styles from './VisuallyHidden.module.scss'

export interface VisuallyHiddenProps {
  children: ReactNode
  as?: 'span' | 'div' | 'label'
  htmlFor?: string
  id?: string
}

/** Texto solo para lectores de pantalla. */
export function VisuallyHidden({ children, as: Tag = 'span', ...rest }: VisuallyHiddenProps) {
  return (
    <Tag className={styles.hidden} {...rest}>
      {children}
    </Tag>
  )
}
