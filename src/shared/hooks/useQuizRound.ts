import { useState } from 'react'
import { answerRound, nextInRound, remaining, startRound, type QuizRound } from '../utils/quizRound'

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

/**
 * Ronda de quiz sobre `keys` (CONVENTIONS.md §4.6): lo acertado no se repite y lo fallado
 * vuelve unas preguntas después, hasta acertarlo. `build` arma la pregunta de cada clave
 * cada vez que sale (así una que vuelve trae las opciones en otro orden).
 * Empieza una ronda nueva cuando cambia `resetKey`.
 */
export function useQuizRound<K, Q>(keys: readonly K[], resetKey: string, build: (key: K) => Q): QuizRoundApi<K, Q> {
  const fresh = (round: QuizRound<K>): State<K, Q> => ({
    key: resetKey,
    round,
    question: round.queue[0] === undefined ? undefined : build(round.queue[0]),
    chosen: null,
  })
  const [stored, setState] = useState<State<K, Q>>(() => fresh(startRound(keys)))
  // Estado derivado: si cambió la clave, ronda nueva (patrón recomendado por React).
  let state = stored
  if (stored.key !== resetKey) {
    state = fresh(startRound(keys))
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
