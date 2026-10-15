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
  /** Click en el indicador de sección (lo usa el easter egg). */
  onSectionClick?: () => void
}

export function TopBar({ menuOpen, onOpenMenu, menuButtonRef, drawerId, sectionLabel, onSectionClick }: TopBarProps) {
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
        <button type="button" className={styles.pill} aria-label={`Sección actual: ${sectionLabel}`} onClick={onSectionClick}>
          {sectionLabel}
        </button>
      )}
    </header>
  )
}
