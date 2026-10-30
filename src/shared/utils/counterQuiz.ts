// Preguntas de la práctica de contadores y fechas. Cada pregunta tiene una clave fija
// ("c:3:7" = contador 3 con el número 7), así la ronda sabe cuáles ya se acertaron.
import type { CountersData } from '../types/content'
import { counterDisplay, naiveDay, naiveMonth, naiveReading } from './counters'
import { buildOptions } from './random'

export type CounterMix = 'all' | 'counters' | 'dates'

export interface CounterQuestion {
  display: string
  answer: string
  lesson: number
  hint: string
  options: string[]
  tip?: string
}

/** Días que se preguntan: los irregulares y algunos regulares. */
export const DAY_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 17, 19, 20, 24, 30]

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

/** Todas las preguntas posibles para lo que se eligió practicar. */
export function counterQuestionKeys(data: CountersData, mix: CounterMix): string[] {
  const counters = data.counters.flatMap((c, i) => [...range(10).map((n) => `c:${i}:${n}`), ...(c.label !== 'つ' ? [`q:${i}`] : [])])
  const dates = [...range(12).map((m) => `m:${m}`), ...DAY_POOL.map((d) => `d:${d}`)]
  return mix === 'counters' ? counters : mix === 'dates' ? dates : [...counters, ...dates]
}

/** Arma la pregunta de una clave de `counterQuestionKeys`. */
export function makeCounterQuestion(data: CountersData, key: string): CounterQuestion {
  const [kind, a, b] = key.split(':')
  const base = data.numberBase
  if (kind === 'q') {
    const c = data.counters[Number(a)]
    return {
      display: `何${c.label}`,
      answer: c.question,
      lesson: c.lesson,
      hint: `¿Cómo se pregunta? · ${c.meaning}`,
      options: buildOptions(c.question, null, data.counters.map((x) => x.question)),
    }
  }
  if (kind === 'c') {
    const c = data.counters[Number(a)]
    const n = Number(b)
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
  if (kind === 'm') {
    const m = Number(a)
    const answer = data.months[m - 1]
    const near = data.months.filter((_, i) => i !== m - 1 && Math.abs(i - (m - 1)) <= 3)
    return { display: `${m}月`, answer, lesson: 5, hint: '¿Cómo se lee? · mes', options: buildOptions(answer, naiveMonth(base, m), near) }
  }
  const d = Number(a)
  const answer = data.days[d - 1]
  const near = data.days.filter((_, i) => i !== d - 1 && (Math.abs(i - (d - 1)) <= 2 || (d <= 10 && i < 10)))
  return { display: `${d}日`, answer, lesson: 5, hint: '¿Cómo se lee? · día del mes', options: buildOptions(answer, naiveDay(base, d), near) }
}
