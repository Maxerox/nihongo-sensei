import { VisuallyHidden } from '../VisuallyHidden'
import styles from './LessonTag.module.scss'

export interface LessonTagProps {
  lesson: number
  /** "L5" (lección del libro principal) o "U5" (unidad del libro de kanji). */
  kind?: 'lesson' | 'unit'
}

/** "L5", leído como "lección 5" por lectores de pantalla. */
export function LessonTag({ lesson, kind = 'lesson' }: LessonTagProps) {
  return (
    <span className={styles.tag}>
      <span aria-hidden="true">
        {kind === 'unit' ? 'U' : 'L'}
        {lesson}
      </span>
      <VisuallyHidden>
        {kind === 'unit' ? 'unidad' : 'lección'} {lesson}
      </VisuallyHidden>
    </span>
  )
}
