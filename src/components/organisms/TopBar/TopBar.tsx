import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import { JpText } from '../../atoms/JpText'
import styles from './TopBar.module.scss'

export interface TopBarProps {
  menuOpen: boolean
  onOpenMenu: () => void
  menuButtonRef: Ref<HTMLButtonElement>
  drawerId: string
  /** Nombre de la sección actual. */
  sectionLabel?: string
}

export function TopBar({ menuOpen, onOpenMenu, menuButtonRef, drawerId, sectionLabel }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <button
        ref={menuButtonRef}
        type="button"
        className={styles.burger}
        aria-label="Abrir menú de secciones"
        aria-expanded={menuOpen}
        aria-controls={drawerId}
        aria-haspopup="dialog"
        onClick={onOpenMenu}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <Link to="/" className={styles.brand} aria-label="Nihongo Sensei, ir al inicio">
        <JpText text="日本語先生" className={styles.brandJa} />
        <small aria-hidden="true">Nihongo Sensei</small>
      </Link>
      {sectionLabel && (
        <span className={styles.pill} aria-hidden="true">
          {sectionLabel}
        </span>
      )}
    </header>
  )
}
