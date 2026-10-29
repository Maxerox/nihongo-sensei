// Preguntas de opción múltiple para la sección Kanji.
import type { KanjiEntry, KanjiExample } from '../types/content'
import { pick, shuffle } from './random'

/**
 * - meaning: se ve el kanji, se elige el significado.
 * - kanji: se ve el significado, se elige el kanji.
 * - reading: se ve una palabra con el kanji, se elige cómo se lee.
 */
export type KanjiQuizKind = 'meaning' | 'kanji' | 'reading'
export type KanjiQuizMode = KanjiQuizKind | 'mix'

export const KANJI_QUIZ_KINDS: KanjiQuizKind[] = ['meaning', 'kanji', 'reading']

export interface KanjiQuestion<T extends KanjiEntry = KanjiEntry> {
  kind: KanjiQuizKind
  item: T
  /** Con 'reading': la palabra que hay que leer. */
  example?: KanjiExample
  /** Opciones mezcladas; una es `answer`. */
  options: string[]
  answer: string
}

/** Palabras sueltas de un significado: "pie; pierna" → pie, pierna. */
const senses = (meaning: string) => meaning.split(/[;,]/).map((s) => s.trim().toLowerCase()).filter(Boolean)

/** Dos significados se pisan si comparten alguna acepción (中 «medio; dentro» y 内 «dentro»). */
export function meaningsOverlap(a: string, b: string): boolean {
  const sa = senses(a)
  return senses(b).some((s) => sa.includes(s))
}

/** Toma `total - 1` distractores distintos entre sí y de la respuesta, en el orden dado. */
function takeDistractors(answer: string, candidates: string[], total: number, reject: (x: string) => boolean = () => false) {
  const out: string[] = []
  for (const c of candidates) {
    if (out.length >= total - 1) break
    if (c === answer || out.includes(c) || reject(c)) continue
    out.push(c)
  }
  return out
}

/** Si alcanzan estos kanji para armar preguntas de este tipo (hacen falta 4 opciones distintas). */
export function canAsk(pool: readonly KanjiEntry[], kind: KanjiQuizKind, total = 4): boolean {
  if (kind === 'reading') return new Set(pool.flatMap((k) => k.examples.map((e) => e.reading))).size >= total
  return pool.length >= total
}

/** Arma una pregunta sobre `item`, con distractores tomados de `pool`. */
export function makeKanjiQuestion<T extends KanjiEntry>(pool: readonly T[], item: T, kind: KanjiQuizKind, total = 4): KanjiQuestion<T> {
  const others = shuffle(pool.filter((k) => k.kanji !== item.kanji))

  if (kind === 'meaning') {
    const answer = item.meaning
    const wrong = takeDistractors(answer, others.map((k) => k.meaning), total, (m) => meaningsOverlap(m, answer))
    return { kind, item, answer, options: shuffle([answer, ...wrong]) }
  }

  if (kind === 'kanji') {
    const answer = item.kanji
    const wrong = takeDistractors(answer, others.filter((k) => !meaningsOverlap(k.meaning, item.meaning)).map((k) => k.kanji), total)
    return { kind, item, answer, options: shuffle([answer, ...wrong]) }
  }

  // reading: los distractores más difíciles son lecturas de largo parecido.
  const example = pick(item.examples)
  const answer = example.reading
  const candidates = others
    .flatMap((k) => k.examples)
    .filter((e) => e.word !== example.word)
    .map((e) => e.reading)
    .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length))
  const wrong = takeDistractors(answer, candidates, total)
  return { kind, item, example, answer, options: shuffle([answer, ...wrong]) }
}

/**
 * Elige el próximo kanji: no repite el anterior y, de vez en cuando,
 * vuelve a preguntar uno que se respondió mal.
 */
export function pickNext<T extends KanjiEntry>(pool: readonly T[], previous?: string, review: readonly string[] = [], random = Math.random): T {
  const fresh = pool.length > 1 ? pool.filter((k) => k.kanji !== previous) : pool
  const toReview = fresh.filter((k) => review.includes(k.kanji))
  const from = toReview.length > 0 && random() < 0.35 ? toReview : fresh
  return from[Math.floor(random() * from.length)]
}

/** Tipo de pregunta para el modo elegido. */
export function kindFor(mode: KanjiQuizMode, random = Math.random): KanjiQuizKind {
  return mode === 'mix' ? KANJI_QUIZ_KINDS[Math.floor(random() * KANJI_QUIZ_KINDS.length)] : mode
}
