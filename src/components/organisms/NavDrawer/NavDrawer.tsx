import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { JpText } from '../../atoms/JpText'
import styles from './NavDrawer.module.scss'

export interface NavItem {
  to: string
  /** Nombre corto en japonés (単語, 文法…). */
  ja: string
  jaReading: string
  title: string
  description: string
}

export interface NavDrawerProps {
  id: string
  open: boolean
  onClose: () => void
  items: NavItem[]
}

/**
 * Menú lateral con <dialog> nativo en modo modal: el navegador atrapa el foco,
 * deja inerte el resto de la página y lo cierra con Escape.
 */
export function NavDrawer({ id, open, onClose, items }: NavDrawerProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal?.()
      dialog.querySelector<HTMLElement>('[aria-current="page"]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Escape (evento "cancel") y tocar fuera del panel cierran el menú.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    const onPointer = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      if (!inside) onClose()
    }
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('pointerdown', onPointer)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('pointerdown', onPointer)
    }
  }, [open, onClose])

  return (
    <dialog ref={ref} id={id} aria-label="Secciones" className={styles.drawer}>
      <div className={styles.head}>
        <JpText text="日本語先生" className={styles.brand} />
        <button type="button" className={styles.close} aria-label="Cerrar menú" onClick={onClose}>
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <nav aria-label="Secciones">
        <ul className={styles.list}>
          {items.map((it) => (
            <li key={it.to}>
              <NavLink to={it.to} className={styles.item} onClick={onClose}>
                <JpText text={it.ja} reading={it.jaReading} className={styles.badge} />
                <span className={styles.text}>
                  {it.title}
                  <small>{it.description}</small>
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </dialog>
  )
}
