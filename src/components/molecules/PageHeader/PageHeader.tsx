import type { ReactNode } from 'react'
import { JpText } from '../../atoms/JpText'
import styles from './PageHeader.module.scss'

export interface PageHeaderProps {
  /** Título en japonés (con su lectura). */
  titleJa: string
  titleReading?: string
  /** Título en español (va al lado, más chico). */
  title: string
  description?: ReactNode
}

export function PageHeader({ titleJa, titleReading, title, description }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <JpText text={titleJa} reading={titleReading} className={styles.ja} /> <small>{title}</small>
      </h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  )
}
