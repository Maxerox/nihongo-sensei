import { useState } from 'react'
import { JpText } from '../../atoms/JpText'
import { SegmentedTabs, tabPanelProps } from '../../molecules/SegmentedTabs'
import type { CountersData } from '../../../shared/types/content'
import { counterDisplay, naiveDay, naiveMonth, naiveReading } from '../../../shared/utils/counters'
import { buildOptions, pick } from '../../../shared/utils/random'
import { QuizCard } from '../QuizCard'
import styles from './CounterPractice.module.scss'

export type CounterMix = 'all' | 'counters' | 'dates'

interface Question {
  display: string
  answer: string
  lesson: number
  hint: string
  options: string[]
  tip?: string
}

const DAY_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 17, 19, 20, 24, 30]

function makeQuestion(data: CountersData, mix: CounterMix): Question {
  const kind = mix === 'all' ? (Math.random() < 0.6 ? 'counters' : 'dates') : mix
  const base = data.numberBase
  if (kind === 'counters') {
    const c = pick(data.counters)
    if (c.label !== 'つ' && Math.random() < 0.1) {
      return {
        display: `何${c.label}`,
        answer: c.question,
        lesson: c.lesson,
        hint: `¿Cómo se pregunta? · ${c.meaning}`,
        options: buildOptions(c.question, null, data.counters.map((x) => x.question)),
      }
    }
    const n = Math.floor(Math.random() * 10) + 1
    const answer = c.readings[n - 1]
    const near = c.readings.filter((_, i) => i !== n - 1 && Math.abs(i - (n - 1)) <= 3)
    return {
      display: counterDisplay(c, n),
      answer,
      lesson: c.lesson,
      hint: `¿Cómo se lee? · ${c.meaning} ${c.emoji}`,
      options: buildOptions(answer, c.reading ? naiveReading(base, n, c.reading) : null, near),
      tip: c.note,
    }
  }
  if (Math.random() < 0.25) {
    const m = Math.floor(Math.random() * 12) + 1
    const answer = data.months[m - 1]
    const near = data.months.filter((_, i) => i !== m - 1 && Math.abs(i - (m - 1)) <= 3)
    return { display: `${m}月`, answer, lesson: 5, hint: '¿Cómo se lee? · mes', options: buildOptions(answer, naiveMonth(base, m), near) }
  }
  const d = pick(DAY_POOL)
  const answer = data.days[d - 1]
  const near = data.days.filter((_, i) => i !== d - 1 && (Math.abs(i - (d - 1)) <= 2 || (d <= 10 && i < 10)))
  return { display: `${d}日`, answer, lesson: 5, hint: '¿Cómo se lee? · día del mes', options: buildOptions(answer, naiveDay(base, d), near) }
}

export interface CounterPracticeProps {
  data: CountersData
}

/**
 * Práctica de lectura de contadores y fechas.
 * La pregunta no lleva furigana: la lectura es la respuesta (CONVENTIONS.md §2.2).
 */
export function CounterPractice({ data }: CounterPracticeProps) {
  const [mix, setMix] = useState<CounterMix>('all')
  const [q, setQ] = useState<Question>(() => makeQuestion(data, 'all'))
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0 })

  const changeMix = (m: CounterMix) => {
    setMix(m)
    setChosen(null)
    setQ(makeQuestion(data, m))
  }

  return (
    <div className={styles.wrap}>
      <SegmentedTabs
        idPrefix="contadores-mezcla"
        label="Qué practicar"
        tabs={[
          { id: 'all', label: 'Todo' },
          { id: 'counters', label: 'Contadores' },
          { id: 'dates', label: 'Fechas' },
        ]}
        selected={mix}
        onSelect={changeMix}
      />
      <div {...tabPanelProps('contadores-mezcla', mix)}>
        <QuizCard
          score={[{ label: 'Aciertos', value: `${score.ok}/${score.total}` }]}
          lesson={q.lesson}
          promptLabel={`¿Cómo se lee ${q.display}?`}
          prompt={
            <span lang="ja" className={styles.prompt}>
              {q.display}
            </span>
          }
          hint={q.hint}
          jpOptions
          options={q.options.map((o) => ({ value: o, content: o }))}
          answer={q.answer}
          chosen={chosen}
          onChoose={(v) => {
            setChosen(v)
            setScore((s) => ({ ok: s.ok + (v === q.answer ? 1 : 0), total: s.total + 1 }))
          }}
          feedback={
            <>
              {q.display} se lee <JpText text={q.answer} />.{q.tip && <> <JpText text={q.tip} mixed /></>}
            </>
          }
          onNext={() => {
            setChosen(null)
            setQ(makeQuestion(data, mix))
          }}
        />
      </div>
    </div>
  )
}
