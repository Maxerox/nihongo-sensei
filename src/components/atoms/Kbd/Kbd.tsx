import type { ReactNode } from 'react'
import styles from './Kbd.module.scss'

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={styles.kbd}>{children}</kbd>
}
