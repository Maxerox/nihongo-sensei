import { useRef, type KeyboardEvent } from 'react'
import { panelId, tabId } from './tabs'
import styles from './SegmentedTabs.module.scss'

export interface TabItem<T extends string> {
  id: T
  label: string
}

export interface SegmentedTabsProps<T extends string> {
  /** Prefijo único para los ids (une cada pestaña con su panel). */
  idPrefix: string
  label: string
  tabs: TabItem<T>[]
  selected: T
  onSelect: (id: T) => void
}

/** Pestañas accesibles: flechas, Inicio y Fin; solo la activa entra en el orden de Tab. */
export function SegmentedTabs<T extends string>({ idPrefix, label, tabs, selected, onSelect }: SegmentedTabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = tabs.findIndex((t) => t.id === selected)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    onSelect(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {tabs.map((t, i) => {
        const active = t.id === selected
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, t.id)}
            aria-selected={active}
            aria-controls={panelId(idPrefix)}
            tabIndex={active ? 0 : -1}
            className={styles.tab}
            onClick={() => onSelect(t.id)}
            onKeyDown={onKeyDown}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
