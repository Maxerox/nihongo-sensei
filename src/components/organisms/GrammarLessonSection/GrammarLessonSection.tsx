import { JpText } from '../../atoms/JpText'
import { DataTable } from '../../molecules/DataTable'
import { ExampleItem } from '../../molecules/ExampleItem'
import type { GrammarLesson, GrammarPoint } from '../../../shared/types/content'
import { lessonAnchor, lessonHeading } from '../../../shared/utils/lessons'
import styles from './GrammarLessonSection.module.scss'

export interface GrammarLessonSectionProps {
  lesson: GrammarLesson
  /** Puntos a mostrar (por ejemplo, filtrados por la búsqueda). */
  points: GrammarPoint[]
}

/** Una lección del cheatsheet de gramática. */
export function GrammarLessonSection({ lesson, points }: GrammarLessonSectionProps) {
  const h = lessonHeading(lesson.lesson)
  const headingId = `${lessonAnchor(lesson.lesson)}-titulo`
  return (
    <section id={lessonAnchor(lesson.lesson)} className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        <JpText text={h.text} reading={h.reading} />{' '}
        <span>
          Lección {lesson.lesson} · {lesson.title}
        </span>
      </h2>
      {points.map((p) => (
        <article key={p.pattern} className={styles.point}>
          <h3 className={styles.pattern}>
            <JpText text={p.pattern} />
          </h3>
          <JpText text={p.description} mixed as="p" className={styles.description} />
          {p.table && <DataTable table={p.table} caption={p.pattern} />}
          {p.examples && (
            <ul className={styles.examples} aria-label="Ejemplos">
              {p.examples.map((e) => (
                <ExampleItem key={e.ja} example={e} />
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  )
}
