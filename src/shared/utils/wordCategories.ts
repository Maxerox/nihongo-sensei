// Tipos de palabra del vocabulario: nombres para la interfaz y opciones del quiz difícil.
import type { VocabWord, WordCategory } from '../types/content'
import { shuffle } from './random'

export const WORD_CATEGORIES: { id: WordCategory; label: string; singular: string }[] = [
  { id: 'verb', label: 'Verbos', singular: 'verbo' },
  { id: 'adj-i', label: 'Adjetivos い', singular: 'adjetivo い' },
  { id: 'adj-na', label: 'Adjetivos な', singular: 'adjetivo な' },
  { id: 'noun', label: 'Sustantivos', singular: 'sustantivo' },
  { id: 'adverb', label: 'Adverbios', singular: 'adverbio' },
  { id: 'question', label: 'Preguntas', singular: 'palabra de pregunta' },
  { id: 'expression', label: 'Expresiones', singular: 'expresión' },
  { id: 'other', label: 'Otros', singular: 'sufijo, contador o conector' },
]

export type CategoryFilter = WordCategory | 'all'

export const categoryLabel = (id: WordCategory) => WORD_CATEGORIES.find((c) => c.id === id)?.label ?? id

export const byCategory = (words: readonly VocabWord[], filter: CategoryFilter) =>
  filter === 'all' ? [...words] : words.filter((w) => w.category === filter)

/**
 * Elige `total - 1` opciones incorrectas para `word`, sin repetir significado ni lectura.
 * En modo difícil son del mismo tipo de palabra (verbo con verbos…): primero de `pool`
 * y, si no alcanzan, de `fallback` (por ejemplo, todo el vocabulario).
 */
export function pickDistractors(
  word: VocabWord,
  pool: readonly VocabWord[],
  hard: boolean,
  fallback: readonly VocabWord[] = [],
  total = 4,
): VocabWord[] {
  const out: VocabWord[] = []
  const seen = new Set([word.es, word.kana])
  const take = (from: readonly VocabWord[]) => {
    for (const w of shuffle(from)) {
      if (out.length >= total - 1) return
      if (w.id === word.id || seen.has(w.es) || seen.has(w.kana)) continue
      if (hard && w.category !== word.category) continue
      seen.add(w.es)
      seen.add(w.kana)
      out.push(w)
    }
  }
  take(pool)
  take(fallback)
  return out
}
