import { useState } from 'react'
import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { canAsk, kindFor, makeKanjiQuestion, pickNext, type KanjiQuestion, type KanjiQuizMode } from '../../../shared/utils/kanjiQuiz'
import type { KanjiPracticeItem } from '../KanjiDrawPractice'
import { QuizCard } from '../QuizCard'
import styles from './KanjiQuiz.module.scss'

export interface KanjiQuizProps {
  items: KanjiPracticeItem[]
  mode: KanjiQuizMode
}

type Question = KanjiQuestion<KanjiPracticeItem>

function nextQuestion(items: KanjiPracticeItem[], mode: KanjiQuizMode, previous?: string, review: string[] = []): Question {
  const kind = kindFor(mode)
  // Con pocas unidades puede no alcanzar para preguntar lecturas: se pregunta el significado.
  const safeKind = canAsk(items, kind) ? kind : 'meaning'
  return makeKanjiQuestion(items, pickNext(items, previous, review), safeKind)
}

/** Lecturas en una línea: タイ、からだ. */
const readings = (k: KanjiPracticeItem) => [...k.on, ...k.kun.map((r) => r.replace('.', ''))].join('、')

/**
 * Quiz de kanji: significado, kanji o lectura, con 4 opciones.
 * Los que salen mal vuelven a aparecer hasta que se responden bien.
 */
export function KanjiQuiz({ items, mode }: KanjiQuizProps) {
  const enough = canAsk(items, 'meaning')
  const [q, setQ] = useState<Question | null>(() => (enough ? nextQuestion(items, mode) : null))
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0, streak: 0 })
  const [review, setReview] = useState<string[]>([])

  if (!enough || !q) return <EmptyState>Elegí más unidades para el quiz (hacen falta al menos 4 kanji).</EmptyState>

  const { item, kind, example } = q
  const jpOptions = kind !== 'meaning'

  const prompt =
    kind === 'meaning' ? (
      <span lang="ja" className={styles.kanji}>
        {item.kanji}
      </span>
    ) : kind === 'kanji' ? (
      <span className={styles.meaning}>{item.meaning}</span>
    ) : (
      // Sin furigana: la lectura es la respuesta.
      <span lang="ja" className={styles.word}>
        {example?.word}
      </span>
    )

  const promptLabel =
    kind === 'meaning'
      ? '¿Qué significa este kanji?'
      : kind === 'kanji'
        ? `¿Qué kanji significa «${item.meaning}»?`
        : '¿Cómo se lee esta palabra?'

  const hint = kind === 'meaning' ? 'Elegí el significado.' : kind === 'kanji' ? 'Elegí el kanji.' : `«${example?.es}» · elegí la lectura.`

  const feedback =
    kind === 'reading' && example ? (
      <>
        <JpText text={example.word} reading={example.reading} /> = {example.es}
      </>
    ) : (
      <>
        <span lang="ja" className={styles.inlineKanji}>
          {item.kanji}
        </span>{' '}
        = {item.meaning} · <span lang="ja">{readings(item)}</span>
      </>
    )

  return (
    <div className={styles.quiz}>
      <QuizCard
        score={[
          { label: 'Puntaje', value: `${score.ok}/${score.total}` },
          { label: 'Racha', value: `${score.streak} 🔥` },
        ]}
        lesson={item.unit}
        lessonKind="unit"
        promptLabel={promptLabel}
        prompt={prompt}
        hint={hint}
        jpOptions={jpOptions}
        options={q.options.map((o) => ({ value: o, content: kind === 'kanji' ? <span className={styles.optionKanji}>{o}</span> : o }))}
        answer={q.answer}
        chosen={chosen}
        onChoose={(value) => {
          setChosen(value)
          const ok = value === q.answer
          setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }))
          setReview((r) => (ok ? r.filter((k) => k !== item.kanji) : r.includes(item.kanji) ? r : [...r, item.kanji]))
        }}
        feedback={feedback}
        onNext={() => {
          setChosen(null)
          setQ(nextQuestion(items, mode, item.kanji, review))
        }}
      />
      {review.length > 0 && (
        <p className={styles.review}>
          Para repasar:{' '}
          <span lang="ja" className={styles.reviewKanji}>
            {review.join(' ')}
          </span>
        </p>
      )}
    </div>
  )
}
