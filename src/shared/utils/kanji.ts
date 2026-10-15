import kanjiData from '../../data/kanji.json'
import type { KanjiData, VocabWord } from '../types/content'

const data = kanjiData as KanjiData
const allowed = new Set([...data.allowedKanji])

export const KANJI_RE = /[一-鿿]/

export const isKanji = (char: string): boolean => KANJI_RE.test(char)

/** Kanji de la palabra que no están entre los permitidos (unidades 1–8). */
export function unknownKanji(text: string): string[] {
  return [...text].filter((c) => isKanji(c) && !allowed.has(c))
}

export interface WordDisplay {
  /** Lo que se muestra grande. */
  main: string
  /** Lectura en kana para mostrar encima, o '' si `main` ya está en kana. */
  reading: string
}

/**
 * Cómo se muestra una palabra del vocabulario: en kanji solo si todos sus kanji
 * están permitidos (o si se pide mostrar todos), y si no, en kana.
 */
export function displayWord(word: VocabWord, showAllKanji = false): WordDisplay {
  if (!word.kanji) return { main: word.kana, reading: '' }
  const kanjiChars = [...word.kanji].filter(isKanji)
  if (kanjiChars.length === 0) return { main: word.kanji, reading: '' }
  if (showAllKanji || unknownKanji(word.kanji).length === 0) {
    return { main: word.kanji, reading: word.kana }
  }
  return { main: word.kana, reading: '' }
}
