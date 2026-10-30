import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { QuizDone } from '../../molecules/QuizDone'
import { useQuizRound } from '../../../shared/hooks/useQuizRound'
import { canAsk, kindFor, makeKanjiQuestion, type KanjiQuizMode } from '../../../shared/utils/kanjiQuiz'
import type { KanjiPracticeItem } from '../KanjiDrawPractice'
import { QuizCard } from '../QuizCard'
import styles from './KanjiQuiz.module.scss'

export interface KanjiQuizProps {
  items: KanjiPracticeItem[]
  mode: KanjiQuizMode
}

/** Lecturas en una línea: タイ、からだ. */
const readings = (k: KanjiPracticeItem) => [...k.on, ...k.kun.map((r) => r.replace('.', ''))].join('、')

/**
 * Quiz de kanji: significado, kanji o lectura, con 4 opciones.
 * Los kanji que se aciertan no vuelven a salir en la ronda; los que se fallan, sí.
 */
export function KanjiQuiz({ items, mode }: KanjiQuizProps) {
  const enough = canAsk(items, 'meaning')
  const byKanji = new Map(items.map((k) => [k.kanji, k]))
  const r = useQuizRound(
    items.map((k) => k.kanji),
    `${items.map((k) => k.kanji).join('')}|${mode}`,
    (kanji) => {
      const kind = kindFor(mode)
      // Con pocas unidades puede no alcanzar para preguntar lecturas: se pregunta el significado.
      return makeKanjiQuestion(items, byKanji.get(kanji)!, canAsk(items, kind) ? kind : 'meaning')
    },
  )

  if (!enough) return <EmptyState>Elegí más unidades para el quiz (hacen falta al menos 4 kanji).</EmptyState>

  const reviewList = (
    <span lang="ja" className={styles.reviewKanji}>
      {r.missed.join(' ')}
    </span>
  )
  if (r.done || !r.question) {
    return <QuizDone total={r.total} firstTry={r.firstTry} missed={reviewList} onRestart={r.restart} onRetryMissed={r.retryMissed} />
  }

  const q = r.question
  const { item, kind, example } = q
  const pendingReview = r.missed.filter((k) => k !== item.kanji || r.chosen !== q.answer)

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
          { label: 'Faltan', value: `${r.left}/${r.total}` },
          { label: 'A la primera', value: r.firstTry },
        ]}
        lesson={item.unit}
        lessonKind="unit"
        promptLabel={promptLabel}
        prompt={prompt}
        hint={hint}
        jpOptions={kind !== 'meaning'}
        options={q.options.map((o) => ({ value: o, content: kind === 'kanji' ? <span className={styles.optionKanji}>{o}</span> : o }))}
        answer={q.answer}
        chosen={r.chosen}
        onChoose={(value) => r.answer(value, value === q.answer)}
        feedback={feedback}
        onNext={r.next}
      />
      {pendingReview.length > 0 && (
        <p className={styles.review}>
          Para repasar:{' '}
          <span lang="ja" className={styles.reviewKanji}>
            {pendingReview.join(' ')}
          </span>
        </p>
      )}
    </div>
  )
}
