// "Más usadas": las palabras que más aparecen en las actividades del libro principal
// (2.ª edición: 文型, 例文, 会話, 練習 A/B/C, 問題 y guiones de escucha). El conteo está en
// vocabulary.json (`uses`) y se generó leyendo el libro; ver CONVENTIONS.md §4.3.
import type { VocabWord } from '../types/content'

/** Qué parte de las palabras elegidas se consideran "las más usadas". */
export const MOST_USED_SHARE = 0.3

/**
 * Las más usadas de `words`: el 30 % con más apariciones (al menos 1).
 * Si hay empate en el corte, entran todas las empatadas.
 */
export function mostUsed(words: readonly VocabWord[], share = MOST_USED_SHARE): VocabWord[] {
  const counted = words.filter((w) => (w.uses ?? 0) > 0)
  if (counted.length === 0) return []
  const sorted = counted.map((w) => w.uses ?? 0).sort((a, b) => b - a)
  const keep = Math.max(1, Math.ceil(words.length * share))
  const cut = sorted[Math.min(keep, sorted.length) - 1]
  return words.filter((w) => (w.uses ?? 0) >= cut && (w.uses ?? 0) > 0)
}
