import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { Panel } from '../../atoms/Panel'
import { LessonPicker } from '../../molecules/LessonPicker'
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

interface Round {
  key: string
  order: number[]
  index: number
  score: number
  chosen: string | null
  options: string[]
}

const BLANK = '＿'

/** Completar oraciones con la partícula correcta, filtrando por lección. */
export function ParticlePractice({ exercises, lessons, onLessonsChange }: ParticlePracticeProps) {
  const pool = exercises.map((_, i) => i).filter((i) => lessons.includes(exercises[i].lesson))
  const poolKey = pool.join(',')
  const newRound = (): Round => {
    const order = shuffle(pool)
    return { key: poolKey, order, index: 0, score: 0, chosen: null, options: order.length ? shuffle(exercises[order[0]].options) : [] }
  }
  const [stored, setRound] = useState<Round>(newRound)
  const round = stored.key === poolKey ? stored : newRound()

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

  if (round.index >= round.order.length) {
    const perfect = round.score === round.order.length
    return (
      <div className={styles.wrap}>
        {picker}
        <Panel centered>
          <span className={styles.big} aria-hidden="true">
            🎉
          </span>
          <h2 className={styles.result}>
            {round.score} de {round.order.length}
          </h2>
          <p className={styles.sub}>{perfect ? '¡Perfecto!' : 'Volvé a intentarlo para repasar las que fallaste.'}</p>
          <Button variant="primary" size="lg" onClick={() => setRound(newRound())}>
            Empezar de nuevo
          </Button>
        </Panel>
      </div>
    )
  }

  const ex = exercises[round.order[round.index]]
  const answered = round.chosen !== null
  const [before, after] = ex.sentence.split(BLANK)
  const blankText = answered ? ex.answer : '？'

  return (
    <QuizCard
      header={picker}
      score={[
        { label: 'Pregunta', value: `${round.index + 1}/${round.order.length}` },
        { label: 'Aciertos', value: round.score },
      ]}
      lesson={ex.lesson}
      promptLabel="Completá la oración con la partícula correcta"
      prompt={
        <p className={styles.sentence}>
          <JpText text={before} />
          <span
            className={`${styles.blank} ${answered ? (round.chosen === ex.answer ? styles.ok : styles.bad) : ''}`}
            lang="ja"
          >
            <span aria-hidden={!answered}>{blankText}</span>
            {!answered && <span className={styles.srOnly}>espacio en blanco</span>}
          </span>
          <JpText text={after ?? ''} />
        </p>
      }
      jpOptions
      options={round.options.map((o) => ({ value: o, content: o }))}
      answer={ex.answer}
      chosen={round.chosen}
      onChoose={(v) => setRound({ ...round, chosen: v, score: round.score + (v === ex.answer ? 1 : 0) })}
      feedback={<JpText text={ex.explanation} mixed />}
      onNext={() => {
        const index = round.index + 1
        const next = round.order[index]
        setRound({ ...round, index, chosen: null, options: next === undefined ? [] : shuffle(exercises[next].options) })
      }}
    />
  )
}
