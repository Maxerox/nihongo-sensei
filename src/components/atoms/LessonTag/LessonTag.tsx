import { VisuallyHidden } from '../VisuallyHidden'
import styles from './LessonTag.module.scss'

export interface LessonTagProps {
  lesson: number
}

/** "L5", leído como "lección 5" por lectores de pantalla. */
export function LessonTag({ lesson }: LessonTagProps) {
  return (
    <span className={styles.tag}>
      <span aria-hidden="true">L{lesson}</span>
      <VisuallyHidden>lección {lesson}</VisuallyHidden>
    </span>
  )
}
