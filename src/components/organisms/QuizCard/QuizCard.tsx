import { useEffect, useRef, type ReactNode } from 'react'
import { Chip } from '../../atoms/Chip'
import { LessonTag } from '../../atoms/LessonTag'
import { SpeakButton } from '../../atoms/SpeakButton'
import { AnswerFeedback } from '../../molecules/AnswerFeedback'
import { OptionGrid, type OptionItem } from '../../molecules/OptionGrid'
import { ScoreLine, type ScoreItem } from '../../molecules/ScoreLine'
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage'
import { playFeedback } from '../../../shared/utils/sound'
import { STORAGE_KEYS } from '../../../shared/utils/storage'
import styles from './QuizCard.module.scss'

export interface QuizCardProps {
  /** Pregunta (lo que se muestra grande). */
  prompt: ReactNode
  /** Texto chico debajo de la pregunta. */
  hint?: ReactNode
  /** Nombre accesible de la pregunta. */
  promptLabel: string
  lesson?: number
  /** Si `lesson` es una lección del libro principal o una unidad del libro de kanji. */
  lessonKind?: 'lesson' | 'unit'
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
  /**
   * En lugar de opciones, otra forma de responder (por ejemplo, escribir la respuesta).
   * Con esto, `correct` dice si la respuesta estuvo bien (null mientras no se respondió).
   */
  answerArea?: ReactNode
  correct?: boolean | null
}

/** Pregunta de opción múltiple: puntaje, pregunta, opciones y resultado, con sonido de acierto o error. */
export function QuizCard(props: QuizCardProps) {
  const { prompt, hint, promptLabel, lesson, lessonKind, speakText, options, answer, chosen, onChoose, jpOptions, feedback, onNext, score, header, answerArea } = props
  const [sound, setSound] = useLocalStorage(STORAGE_KEYS.quizSound, true)
  const correct = answerArea ? (props.correct ?? null) : chosen === null ? null : chosen === answer
  // Con respuesta escrita, el sonido va cuando aparece el resultado.
  const previous = useRef<boolean | null>(correct)
  useEffect(() => {
    if (answerArea && previous.current === null && correct !== null && sound) playFeedback(correct)
    previous.current = correct
  }, [answerArea, correct, sound])
  return (
    <div className={styles.quiz}>
      {header}
      <div className={styles.top}>
        <div className={styles.score}>{score && <ScoreLine items={score} />}</div>
        <Chip pressed={sound} onClick={() => setSound(!sound)} className={styles.sound}>
          <span aria-hidden="true">{sound ? '🔊' : '🔇'}</span> Sonido
        </Chip>
      </div>
      <section className={styles.card} aria-label={promptLabel}>
        {lesson !== undefined && (
          <span className={styles.tag}>
            <LessonTag lesson={lesson} kind={lessonKind} />
          </span>
        )}
        <div className={styles.prompt}>{prompt}</div>
        {hint && <p className={styles.hint}>{hint}</p>}
        {speakText && <SpeakButton text={speakText} className={styles.speak} />}
      </section>
      {answerArea ?? (
        <OptionGrid
          label="Opciones"
          options={options}
          answer={answer}
          chosen={chosen}
          onChoose={(value) => {
            if (sound) playFeedback(value === answer)
            onChoose(value)
          }}
          jp={jpOptions}
        />
      )}
      <AnswerFeedback correct={correct} message={feedback} onNext={onNext} />
    </div>
  )
}
