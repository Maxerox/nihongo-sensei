import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { Panel } from '../../atoms/Panel'
import { LessonPicker } from '../../molecules/LessonPicker'
import { QuizDone } from '../../molecules/QuizDone'
import { useQuizRound } from '../../../shared/hooks/useQuizRound'
import type { ParticleExercise } from '../../../shared/types/content'
import { lessonRange } from '../../../shared/utils/lessons'
import { shuffle } from '../../../shared/utils/random'
import { QuizCard } from '../QuizCard'
import styles from './ParticlePractice.module.scss'

export interface ParticlePracticeProps {
  exercises: ParticleExercise[]
  lessons: number[]
  onLessonsChange: (lessons: number[]) => void
}

const BLANK = '＿'

/**
 * Completar oraciones con la partícula correcta, filtrando por lección.
 * Las que se aciertan no vuelven a salir en la ronda; las que se fallan, sí.
 */
export function ParticlePractice({ exercises, lessons, onLessonsChange }: ParticlePracticeProps) {
  const pool = exercises.map((_, i) => i).filter((i) => lessons.includes(exercises[i].lesson))
  const poolKey = pool.join(',')
  const r = useQuizRound(pool, poolKey, (i) => ({ index: i, options: shuffle(exercises[i].options) }))

  const counts = new Map<number, number>()
  exercises.forEach((e) => counts.set(e.lesson, (counts.get(e.lesson) ?? 0) + 1))
  const picker = (
    <Panel>
      <LessonPicker
        label="Practicar lecciones"
        lessons={lessonRange()}
        selected={lessons}
        onChange={onLessonsChange}
        describe={(l) => `Lección ${l} · ${counts.get(l) ?? 0} oraciones`}
        summary={`${pool.length} oraciones de ${lessons.length} ${lessons.length === 1 ? 'lección' : 'lecciones'}`}
      />
    </Panel>
  )

  if (pool.length === 0) {
    return (
      <div className={styles.wrap}>
        {picker}
        <EmptyState>Elegí al menos una lección para practicar.</EmptyState>
      </div>
    )
  }

  if (r.done || !r.question) {
    return (
      <div className={styles.wrap}>
        {picker}
        <QuizDone
          total={r.total}
          firstTry={r.firstTry}
          missed={
            <ul className={styles.missed}>
              {r.missed.map((i) => (
                <li key={i}>
                  <JpText text={exercises[i].sentence.replace(BLANK, exercises[i].answer)} />
                </li>
              ))}
            </ul>
          }
          onRestart={r.restart}
          onRetryMissed={r.retryMissed}
        />
      </div>
    )
  }

  const ex = exercises[r.question.index]
  const answered = r.chosen !== null
  const [before, after] = ex.sentence.split(BLANK)
  const blankText = answered ? ex.answer : '？'

  return (
    <QuizCard
      header={picker}
      score={[
        { label: 'Faltan', value: `${r.left}/${r.total}` },
        { label: 'A la primera', value: r.firstTry },
      ]}
      lesson={ex.lesson}
      promptLabel="Completá la oración con la partícula correcta"
      prompt={
        <p className={styles.sentence}>
          <JpText text={before} />
          <span
            className={`${styles.blank} ${answered ? (r.chosen === ex.answer ? styles.ok : styles.bad) : ''}`}
            lang="ja"
          >
            <span aria-hidden={!answered}>{blankText}</span>
            {!answered && <span className={styles.srOnly}>espacio en blanco</span>}
          </span>
          <JpText text={after ?? ''} />
        </p>
      }
      jpOptions
      options={r.question.options.map((o) => ({ value: o, content: o }))}
      answer={ex.answer}
      chosen={r.chosen}
      onChoose={(v) => r.answer(v, v === ex.answer)}
      feedback={<JpText text={ex.explanation} mixed />}
      onNext={r.next}
    />
  )
}
