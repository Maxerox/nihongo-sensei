import { useState } from 'react'
import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { QuizDone } from '../../molecules/QuizDone'
import { WriteAnswer } from '../../molecules/WriteAnswer'
import { useQuizRound } from '../../../shared/hooks/useQuizRound'
import type { VerbFormInfo, VocabWord } from '../../../shared/types/content'
import { conjugate, explain, stripNote, wrongForms, type VerbFormId } from '../../../shared/utils/conjugate'
import { shuffle } from '../../../shared/utils/random'
import { formDisplay, isRightAnswer, masuDisplay } from '../../../shared/utils/verbs'
import { QuizCard } from '../QuizCard'
import styles from './VerbPractice.module.scss'

export type VerbPracticeMode = 'choose' | 'write'

export interface VerbPracticeProps {
  verbs: VocabWord[]
  forms: VerbFormInfo[]
  mode: VerbPracticeMode
  /** Para guardar la ronda en sessionStorage. */
  storageKey?: string
}

interface Question {
  verb: VocabWord
  form: VerbFormInfo
  answer: { kana: string; kanji?: string }
  options: string[]
}

/**
 * Práctica de conjugación: se ve el verbo en forma ます y hay que dar otra forma,
 * eligiendo entre 4 opciones o escribiéndola (en hiragana o romaji).
 * Va por rondas: lo acertado no se repite y lo fallado vuelve (CONVENTIONS.md §4.6).
 */
export function VerbPractice({ verbs, forms, mode, storageKey }: VerbPracticeProps) {
  const byId = new Map(verbs.map((v) => [v.id, v]))
  const byForm = new Map(forms.map((f) => [f.id, f]))
  const keys = verbs.flatMap((v) => forms.map((f) => `${v.id}|${f.id}`))
  const r = useQuizRound(
    keys,
    `${keys.length}:${keys[0] ?? ''}:${keys.at(-1) ?? ''}|${mode}`,
    (key): Question => {
      const [id, formId] = key.split('|') as [string, VerbFormId]
      const verb = byId.get(id)!
      const answer = conjugate(verb, formId)!
      return { verb, form: byForm.get(formId)!, answer, options: shuffle([answer.kana, ...shuffle(wrongForms(verb, formId)).slice(0, 3)]) }
    },
    storageKey,
  )

  // Si ya se venía respondiendo, al pasar de pregunta el foco va al campo de escribir.
  const [answeredOnce, setAnsweredOnce] = useState(false)

  if (verbs.length === 0 || forms.length === 0) return <EmptyState>Elegí al menos una lección, un grupo y una forma.</EmptyState>
  if (r.done || !r.question) {
    return (
      <QuizDone
        total={r.total}
        firstTry={r.firstTry}
        missed={
          <ul className={styles.missed}>
            {r.missed.map((key) => {
              const [id, formId] = key.split('|') as [string, VerbFormId]
              const verb = byId.get(id)
              const shown = verb && formDisplay(verb, formId)
              if (!verb || !shown) return null
              const m = masuDisplay(verb)
              return (
                <li key={key}>
                  <JpText text={m.main} reading={m.reading || undefined} /> → <JpText text={shown.main} reading={shown.reading || undefined} />
                </li>
              )
            })}
          </ul>
        }
        onRestart={r.restart}
        onRetryMissed={r.retryMissed}
      />
    )
  }

  const q = r.question
  const verbShown = masuDisplay(q.verb)
  const answerShown = formDisplay(q.verb, q.form.id)!
  const plainVerb = stripNote(q.verb.kana)
  const correct = r.chosen === null ? null : mode === 'write' ? isRightAnswer(r.chosen, q.answer) : r.chosen === q.answer.kana

  const writeArea = (
    <WriteAnswer
      key={r.current}
      id="verbo-respuesta"
      label={`Escribí la ${q.form.name.toLowerCase()} (en hiragana o en romaji)`}
      locked={r.chosen !== null}
      invalid={correct === false}
      focusOnMount={answeredOnce}
      onSubmit={(text) => {
        setAnsweredOnce(true)
        r.answer(text, isRightAnswer(text, q.answer))
      }}
    />
  )

  return (
    <QuizCard
      score={[
        { label: 'Faltan', value: `${r.left}/${r.total}` },
        { label: 'A la primera', value: r.firstTry },
      ]}
      lesson={q.form.lesson}
      promptLabel={`¿Cuál es la ${q.form.name.toLowerCase()} de ${plainVerb}?`}
      prompt={
        <div className={styles.prompt}>
          <span className={styles.verb}>
            <JpText text={verbShown.main} reading={verbShown.reading || undefined} />
          </span>
          <span className={styles.meaning}>{q.verb.es}</span>
          <span className={styles.target}>
            → <b>{q.form.name}</b>{' '}
            <span lang="ja" className={styles.nowrap}>
              （{q.form.ja}）
            </span>
          </span>
        </div>
      }
      jpOptions
      options={q.options.map((o) => ({ value: o, content: o }))}
      answer={q.answer.kana}
      chosen={r.chosen}
      onChoose={(v) => r.answer(v, v === q.answer.kana)}
      answerArea={mode === 'write' ? writeArea : undefined}
      correct={correct}
      feedback={
        <>
          <JpText text={answerShown.main} reading={answerShown.reading || undefined} />
          {' · '}
          <JpText text={explain(q.verb, q.form.id)} mixed />
        </>
      }
      onNext={r.next}
    />
  )
}
