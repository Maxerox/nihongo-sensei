import { useState } from 'react'
import { answerRound, nextInRound, remaining, startRound, type QuizRound } from '../utils/quizRound'
import { readStorage, writeStorage } from '../utils/storage'

export interface QuizRoundApi<K, Q> {
  /** Pregunta actual, o undefined si se terminó la ronda. */
  question: Q | undefined
  /** Clave de la pregunta actual. */
  current: K | undefined
  done: boolean
  total: number
  /** Cuántas faltan acertar. */
  left: number
  firstTry: number
  missed: K[]
  /** Opción elegida en la pregunta actual, o null si todavía no se respondió. */
  chosen: string | null
  answer: (value: string, correct: boolean) => void
  next: () => void
  /** Ronda nueva con todas. */
  restart: () => void
  /** Ronda nueva solo con las que se fallaron. */
  retryMissed: () => void
}

interface State<K, Q> {
  key: string
  round: QuizRound<K>
  question: Q | undefined
  chosen: string | null
}

interface Saved<K> {
  key: string
  round: QuizRound<K>
}

const isRound = (r: unknown): r is QuizRound<unknown> =>
  typeof r === 'object' && r !== null && Array.isArray((r as QuizRound<unknown>).queue) && Array.isArray((r as QuizRound<unknown>).missed)

/**
 * Ronda guardada para esta clave, si hay. Si la pregunta actual ya se había respondido,
 * se pasa a la siguiente (la respuesta ya quedó contada).
 */
function restore<K>(storageKey: string | undefined, resetKey: string, keys: readonly K[]): QuizRound<K> | null {
  if (!storageKey) return null
  const saved = readStorage<Saved<K> | null>(storageKey, null, 'session')
  if (!saved || saved.key !== resetKey || !isRound(saved.round)) return null
  // Solo claves que siguen existiendo (por si cambió el contenido).
  const valid = new Set(keys)
  const round: QuizRound<K> = {
    ...saved.round,
    queue: saved.round.queue.filter((k) => valid.has(k)),
    missed: saved.round.missed.filter((k) => valid.has(k)),
  }
  return round.result === null ? round : nextInRound(round)
}

/**
 * Ronda de quiz sobre `keys` (CONVENTIONS.md §4.6): lo acertado no se repite y lo fallado
 * vuelve unas preguntas después, hasta acertarlo. `build` arma la pregunta de cada clave
 * cada vez que sale (así una que vuelve trae las opciones en otro orden).
 * Empieza una ronda nueva cuando cambia `resetKey`. Con `storageKey`, la ronda se guarda en
 * sessionStorage: sobrevive a recargar la página y se borra al cerrar la pestaña.
 */
export function useQuizRound<K, Q>(keys: readonly K[], resetKey: string, build: (key: K) => Q, storageKey?: string): QuizRoundApi<K, Q> {
  const fresh = (round: QuizRound<K>, chosen: string | null = null, question?: Q): State<K, Q> => ({
    key: resetKey,
    round,
    question: question ?? (round.queue[0] === undefined ? undefined : build(round.queue[0])),
    chosen,
  })
  const [stored, setStored] = useState<State<K, Q>>(() => fresh(restore(storageKey, resetKey, keys) ?? startRound(keys)))
  const setState = (s: State<K, Q>) => {
    setStored(s)
    if (storageKey) writeStorage<Saved<K>>(storageKey, { key: s.key, round: s.round }, 'session')
  }
  // Estado derivado: si cambió la clave, ronda nueva (patrón recomendado por React).
  let state = stored
  if (stored.key !== resetKey) {
    state = fresh(restore(storageKey, resetKey, keys) ?? startRound(keys))
    setState(state)
  }
  const { round } = state

  return {
    question: state.question,
    current: round.queue[0],
    done: round.queue.length === 0,
    total: round.total,
    left: remaining(round),
    firstTry: round.firstTry,
    missed: round.missed,
    chosen: state.chosen,
    answer: (value, correct) => {
      if (state.chosen !== null) return
      setState({ ...state, round: answerRound(round, correct), chosen: value })
    },
    next: () => {
      if (state.chosen !== null) setState(fresh(nextInRound(round)))
    },
    restart: () => setState(fresh(startRound(keys))),
    retryMissed: () => setState(fresh(startRound(round.missed.length ? round.missed : keys))),
  }
}
