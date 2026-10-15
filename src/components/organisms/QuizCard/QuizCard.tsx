import type { ReactNode } from 'react'
import { LessonTag } from '../../atoms/LessonTag'
import { SpeakButton } from '../../atoms/SpeakButton'
import { AnswerFeedback } from '../../molecules/AnswerFeedback'
import { OptionGrid, type OptionItem } from '../../molecules/OptionGrid'
import { ScoreLine, type ScoreItem } from '../../molecules/ScoreLine'
import styles from './QuizCard.module.scss'

export interface QuizCardProps {
  /** Pregunta (lo que se muestra grande). */
  prompt: ReactNode
  /** Texto chico debajo de la pregunta. */
  hint?: ReactNode
  /** Nombre accesible de la pregunta. */
  promptLabel: string
  lesson?: number
  /** Japonés para leer en voz alta (si corresponde). */
  speakText?: string
  options: OptionItem[]
  answer: string
  chosen: string | null
  onChoose: (value: string) => void
  jpOptions?: boolean
  feedback?: ReactNode
  onNext: () => void
  score?: ScoreItem[]
  /** Contenido arriba de todo (por ejemplo, un selector de lecciones). */
  header?: ReactNode
}

/** Pregunta de opción múltiple: puntaje, pregunta, opciones y resultado. */
export function QuizCard(props: QuizCardProps) {
  const { prompt, hint, promptLabel, lesson, speakText, options, answer, chosen, onChoose, jpOptions, feedback, onNext, score, header } = props
  return (
    <div className={styles.quiz}>
      {header}
      {score && <ScoreLine items={score} />}
      <section className={styles.card} aria-label={promptLabel}>
        {lesson !== undefined && (
          <span className={styles.tag}>
            <LessonTag lesson={lesson} />
          </span>
        )}
        <div className={styles.prompt}>{prompt}</div>
        {hint && <p className={styles.hint}>{hint}</p>}
        {speakText && <SpeakButton text={speakText} className={styles.speak} />}
      </section>
      <OptionGrid label="Opciones" options={options} answer={answer} chosen={chosen} onChoose={onChoose} jp={jpOptions} />
      <AnswerFeedback correct={chosen === null ? null : chosen === answer} message={feedback} onNext={onNext} />
    </div>
  )
}
