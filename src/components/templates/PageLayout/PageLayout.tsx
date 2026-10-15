import type { ReactNode } from 'react'
import { Panel } from '../../atoms/Panel'
import { PageHeader, type PageHeaderProps } from '../../molecules/PageHeader'
import styles from './PageLayout.module.scss'

export interface PageLayoutProps {
  header: PageHeaderProps
  /** Controles de la página (filtros, pestañas…). */
  toolbar?: ReactNode
  toolbarLabel?: string
  children: ReactNode
  /** Nota al pie (fuentes, aclaraciones). */
  footnote?: ReactNode
}

/** Estructura de cada página: título, controles, contenido y nota. */
export function PageLayout({ header, toolbar, toolbarLabel = 'Opciones', children, footnote }: PageLayoutProps) {
  return (
    <div className={styles.page}>
      <PageHeader {...header} />
      {toolbar && (
        <Panel as="section" aria-label={toolbarLabel}>
          {toolbar}
        </Panel>
      )}
      {children}
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </div>
  )
}
