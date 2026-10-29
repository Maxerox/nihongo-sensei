import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SkipLink } from '../../atoms/SkipLink'
import { NavDrawer, type NavItem } from '../../organisms/NavDrawer'
import { ToastyPopup } from '../../organisms/ToastyPopup'
import { useRapidClicks } from '../../../shared/hooks/useRapidClicks'
import { TopBar } from '../../organisms/TopBar'
import styles from './AppShell.module.scss'

export interface AppShellProps {
  sections: NavItem[]
}

const DRAWER_ID = 'menu-secciones'
const MAIN_ID = 'contenido'

/** Estructura común: link para saltar, barra superior, menú lateral y contenido. */
export function AppShell({ sections }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const firstRender = useRef(true)
  const current = sections.find((s) => pathname.startsWith(s.to))
  // Easter egg: 5 toques seguidos en el indicador de sección.
  const [toasty, setToasty] = useState(false)
  const hideToasty = useCallback(() => setToasty(false), [])
  const onSectionClick = useRapidClicks(5, 600, useCallback(() => setToasty(true), []))

  const close = useCallback(() => {
    setOpen(false)
    menuButton.current?.focus()
  }, [])

  // Al cambiar de página: arriba de todo y foco en el contenido (para lectores de pantalla).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    document.getElementById(MAIN_ID)?.focus({ preventScroll: true })
  }, [pathname])

  useEffect(() => {
    document.title = current ? `${current.title} · Nihongo Sensei` : 'Nihongo Sensei'
  }, [current])

  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <div className={styles.shell}>
        <TopBar
          menuOpen={open}
          onOpenMenu={() => setOpen(true)}
          menuButtonRef={menuButton}
          drawerId={DRAWER_ID}
          sectionLabel={current?.title}
          onSectionClick={onSectionClick}
        />
        <main id={MAIN_ID} tabIndex={-1} className={styles.main}>
          {/* Mientras se descarga una página, la barra y el menú siguen a la vista. */}
          <Suspense fallback={<p aria-live="polite">Cargando…</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <NavDrawer id={DRAWER_ID} open={open} onClose={close} items={sections} />
      {toasty && <ToastyPopup onDone={hideToasty} />}
    </>
  )
}
