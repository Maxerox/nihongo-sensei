import { useState } from 'react'
import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import type { VocabWord } from '../../../shared/types/content'
import { displayWord } from '../../../shared/utils/kanji'
import { pick, shuffle } from '../../../shared/utils/random'
import type { Direction } from '../Flashcard'
import { QuizCard } from '../QuizCard'

export interface VocabQuizProps {
  words: VocabWord[]
  direction: Direction
  showAllKanji: boolean
}

interface Question {
  word: VocabWord
  options: VocabWord[]
}

function makeQuestion(pool: VocabWord[], previous?: VocabWord): Question {
  let word = pick(pool)
  if (previous && pool.length > 1) while (word.id === previous.id) word = pick(pool)
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

/** Quiz de opción múltiple con las palabras elegidas. */
export function VocabQuiz({ words, direction, showAllKanji }: VocabQuizProps) {
  const [q, setQ] = useState<Question | null>(() => (words.length >= 4 ? makeQuestion(words) : null))
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0, streak: 0 })

  if (words.length < 4 || !q) return <EmptyState>Elegí más lecciones para el quiz (hacen falta al menos 4 palabras).</EmptyState>

  // Si cambió la lista y la palabra ya no está, se arma otra pregunta.
  const current = words.some((w) => w.id === q.word.id) ? q : makeQuestion(words)
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
        { label: 'Puntaje', value: `${score.ok}/${score.total}` },
        { label: 'Racha', value: `${score.streak} 🔥` },
      ]}
      lesson={current.word.lesson}
      promptLabel={direction === 'jp' ? `¿Qué significa ${current.word.kana}?` : `¿Cómo se dice «${current.word.es}» en japonés?`}
      prompt={<div style={{ fontSize: direction === 'jp' ? 'clamp(30px,7vw,48px)' : '22px', fontWeight: 600 }}>{prompt}</div>}
      speakText={direction === 'jp' ? current.word.kana : undefined}
      jpOptions={direction === 'es'}
      options={current.options.map((o) => {
        const od = displayWord(o, showAllKanji)
        return direction === 'jp'
          ? { value: o.id, content: o.es }
          : { value: o.id, content: <JpText text={od.main} reading={od.reading || undefined} />, label: o.kana }
      })}
      answer={current.word.id}
      chosen={chosen}
      onChoose={(id) => {
        setChosen(id)
        const ok = id === current.word.id
        setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }))
      }}
      feedback={
        <>
          <JpText text={current.word.kana} /> = {current.word.es}
        </>
      }
      onNext={() => {
        setChosen(null)
        setQ(makeQuestion(words, current.word))
      }}
    />
  )
}
