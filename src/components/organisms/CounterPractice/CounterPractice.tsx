import { useState } from 'react'
import { JpText } from '../../atoms/JpText'
import { QuizDone } from '../../molecules/QuizDone'
import { SegmentedTabs, tabPanelProps } from '../../molecules/SegmentedTabs'
import { useQuizRound } from '../../../shared/hooks/useQuizRound'
import type { CountersData } from '../../../shared/types/content'
import { counterQuestionKeys, makeCounterQuestion, type CounterMix } from '../../../shared/utils/counterQuiz'
import { QuizCard } from '../QuizCard'
import styles from './CounterPractice.module.scss'

export type { CounterMix }

export interface CounterPracticeProps {
  data: CountersData
}

/**
 * Práctica de lectura de contadores y fechas.
 * La pregunta no lleva furigana: la lectura es la respuesta (CONVENTIONS.md §2.2).
 */
export function CounterPractice({ data }: CounterPracticeProps) {
  const [mix, setMix] = useState<CounterMix>('all')
  const r = useQuizRound(counterQuestionKeys(data, mix), mix, (key) => makeCounterQuestion(data, key))
  const q = r.question

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
        onSelect={setMix}
      />
      <div {...tabPanelProps('contadores-mezcla', mix)}>
        {r.done || !q ? (
          <QuizDone
            total={r.total}
            firstTry={r.firstTry}
            missed={
              <p lang="ja" className={styles.missed}>
                {r.missed.map((key) => makeCounterQuestion(data, key).display).join('　')}
              </p>
            }
            onRestart={r.restart}
            onRetryMissed={r.retryMissed}
          />
        ) : (
          <QuizCard
            score={[
              { label: 'Faltan', value: `${r.left}/${r.total}` },
              { label: 'A la primera', value: r.firstTry },
            ]}
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
            chosen={r.chosen}
            onChoose={(v) => r.answer(v, v === q.answer)}
            feedback={
              <>
                {q.display} se lee <JpText text={q.answer} />.{q.tip && <> <JpText text={q.tip} mixed /></>}
              </>
            }
            onNext={r.next}
          />
        )}
      </div>
    </div>
  )
}
