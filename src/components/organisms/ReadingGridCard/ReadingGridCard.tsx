import { useState, type ReactNode } from 'react'
import { Glyph } from '../../atoms/Glyph'
import { JpText } from '../../atoms/JpText'
import { LessonTag } from '../../atoms/LessonTag'
import { ReadingCell } from '../../molecules/ReadingCell'
import { cx } from '../../../shared/utils/classNames'
import styles from './ReadingGridCard.module.scss'

export interface ReadingGridItem {
  key: string
  label: string
  reading: string
  irregular?: boolean
}

export interface ReadingGridCardProps {
  id?: string
  glyph: ReactNode
  title: string
  lesson: number
  /** Cómo se pregunta (なんにん, いくつ…). */
  question?: string
  note?: string
  items: ReadingGridItem[]
  /** Si es false, las lecturas aparecen tapadas hasta tocarlas. */
  showReadings: boolean
  wide?: boolean
}

/** Tarjeta con una cuadrícula de lecturas (un contador, los días del mes…). */
export function ReadingGridCard({ id, glyph, title, lesson, question, note, items, showReadings, wide }: ReadingGridCardProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const titleId = `${id ?? title}-titulo`
  return (
    <article id={id} className={styles.card} aria-labelledby={titleId}>
      <div className={styles.head}>
        <Glyph decorative>{glyph}</Glyph>
        <h2 id={titleId} className={styles.title}>
          {title}
          <small>
            <LessonTag lesson={lesson} />
            {question && (
              <>
                {' '}
                · pregunta: <JpText text={question} />
              </>
            )}
          </small>
        </h2>
      </div>
      {note && <JpText text={note} mixed as="p" className={styles.note} />}
      <ul className={cx(styles.grid, wide && styles.wide)}>
        {items.map((it) => (
          <li key={it.key}>
            <ReadingCell
              label={it.label}
              reading={it.reading}
              irregular={it.irregular}
              hidden={!showReadings && !revealed.has(it.key)}
              onReveal={() => setRevealed((s) => new Set(s).add(it.key))}
            />
          </li>
        ))}
      </ul>
    </article>
  )
}
