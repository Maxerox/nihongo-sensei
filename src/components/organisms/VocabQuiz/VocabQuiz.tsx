import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { QuizDone } from '../../molecules/QuizDone'
import { useQuizRound } from '../../../shared/hooks/useQuizRound'
import type { VocabWord } from '../../../shared/types/content'
import { displayWord } from '../../../shared/utils/kanji'
import { shuffle } from '../../../shared/utils/random'
import type { Direction } from '../Flashcard'
import { QuizCard } from '../QuizCard'
import styles from './VocabQuiz.module.scss'

export interface VocabQuizProps {
  words: VocabWord[]
  direction: Direction
  showAllKanji: boolean
}

interface Question {
  word: VocabWord
  options: VocabWord[]
}

function makeQuestion(pool: VocabWord[], word: VocabWord): Question {
  const options = [word]
  const seen = new Set([word.es, word.kana])
  for (const w of shuffle(pool)) {
    if (options.length >= 4) break
    if (seen.has(w.es) || seen.has(w.kana)) continue
    seen.add(w.es)
    seen.add(w.kana)
    options.push(w)
  }
  return { word, options: shuffle(options) }
}

/**
 * Quiz de opción múltiple con las palabras elegidas.
 * Las que se aciertan no vuelven a salir en la ronda; las que se fallan, sí.
 */
export function VocabQuiz({ words, direction, showAllKanji }: VocabQuizProps) {
  const byId = new Map(words.map((w) => [w.id, w]))
  const r = useQuizRound(
    words.map((w) => w.id),
    `${words.length}:${words[0]?.id ?? ''}:${words.at(-1)?.id ?? ''}|${direction}`,
    (id) => makeQuestion(words, byId.get(id)!),
  )

  if (words.length < 4) return <EmptyState>Elegí más lecciones para el quiz (hacen falta al menos 4 palabras).</EmptyState>

  if (r.done || !r.question) {
    const missed = r.missed.map((id) => byId.get(id)).filter((w): w is VocabWord => w !== undefined)
    return (
      <QuizDone
        total={r.total}
        firstTry={r.firstTry}
        missed={
          <ul className={styles.missed}>
            {missed.map((w) => {
              const d = displayWord(w, showAllKanji)
              return (
                <li key={w.id}>
                  <JpText text={d.main} reading={d.reading || undefined} /> = {w.es}
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

  const current = r.question
  const d = displayWord(current.word, showAllKanji)

  const prompt =
    direction === 'jp' ? (
      <JpText text={d.main} reading={d.reading || undefined} />
    ) : (
      <span>
        {current.word.emoji && <span aria-hidden="true">{current.word.emoji} </span>}
        {current.word.es}
      </span>
    )

  return (
    <QuizCard
      score={[
        { label: 'Faltan', value: `${r.left}/${r.total}` },
        { label: 'A la primera', value: r.firstTry },
      ]}
      lesson={current.word.lesson}
      promptLabel={direction === 'jp' ? `¿Qué significa ${current.word.kana}?` : `¿Cómo se dice «${current.word.es}» en japonés?`}
      prompt={<div className={direction === 'jp' ? styles.promptJp : styles.promptEs}>{prompt}</div>}
      speakText={direction === 'jp' ? current.word.kana : undefined}
      jpOptions={direction === 'es'}
      options={current.options.map((o) => {
        const od = displayWord(o, showAllKanji)
        return direction === 'jp'
          ? { value: o.id, content: o.es }
          : { value: o.id, content: <JpText text={od.main} reading={od.reading || undefined} />, label: o.kana }
      })}
      answer={current.word.id}
      chosen={r.chosen}
      onChoose={(id) => r.answer(id, id === current.word.id)}
      feedback={
        <>
          <JpText text={current.word.kana} /> = {current.word.es}
        </>
      }
      onNext={r.next}
    />
  )
}
