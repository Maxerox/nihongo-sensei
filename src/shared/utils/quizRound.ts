// Ronda de quiz: lo que se responde bien no vuelve a salir; lo que se responde mal
// vuelve un poco más adelante, hasta acertarlo. Funciones puras (el hook está en useQuizRound).
import { shuffle } from './random'

/** Cuántas preguntas después vuelve a salir una que se respondió mal. */
export const RETRY_GAP = 3

export interface QuizRound<K> {
  /** Lo que falta acertar, en orden. El primero es la pregunta actual. */
  queue: K[]
  total: number
  /** Acertadas al primer intento. */
  firstTry: number
  /** Las que se respondieron mal alguna vez, en el orden en que se fallaron. */
  missed: K[]
  /** Resultado de la pregunta actual, o null si todavía no se respondió. */
  result: boolean | null
}

export function startRound<K>(keys: readonly K[], mix: (k: readonly K[]) => K[] = shuffle): QuizRound<K> {
  const unique = [...new Set(keys)]
  return { queue: mix(unique), total: unique.length, firstTry: 0, missed: [], result: null }
}

/** Registra la respuesta de la pregunta actual (una sola vez por pregunta). */
export function answerRound<K>(round: QuizRound<K>, correct: boolean): QuizRound<K> {
  const current = round.queue[0]
  if (current === undefined || round.result !== null) return round
  const failedBefore = round.missed.includes(current)
  return {
    ...round,
    result: correct,
    firstTry: round.firstTry + (correct && !failedBefore ? 1 : 0),
    missed: correct || failedBefore ? round.missed : [...round.missed, current],
  }
}

/** Pasa a la siguiente: si se acertó, sale de la ronda; si no, vuelve más adelante. */
export function nextInRound<K>(round: QuizRound<K>): QuizRound<K> {
  if (round.result === null) return round
  const [current, ...rest] = round.queue
  if (round.result) return { ...round, queue: rest, result: null }
  const at = Math.min(RETRY_GAP, rest.length)
  return { ...round, queue: [...rest.slice(0, at), current, ...rest.slice(at)], result: null }
}

/** Cuántas quedan por acertar (sin contar la actual si ya se acertó). */
export const remaining = <K>(round: QuizRound<K>) => round.queue.length - (round.result ? 1 : 0)
