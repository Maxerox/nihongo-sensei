// Ayudas de la sección Verbos: qué verbos se practican y cómo se muestran conjugados.
import type { VocabWord } from '../types/content'
import { conjugate, stripNote, type VerbFormId } from './conjugate'
import { displayWord, type WordDisplay } from './kanji'
import { kanaKey, looksLikeRomaji, romajiKey, toHiragana } from './romaji'

/**
 * Verbos para practicar: uno por cada verbo distinto (はいります aparece en varias lecciones
 * con distinto uso, pero se conjuga igual). Se queda con el de la primera lección.
 */
export function practiceVerbs(words: readonly VocabWord[]): VocabWord[] {
  const seen = new Set<string>()
  return words
    .filter((w) => w.category === 'verb' && w.verbGroup)
    .filter((w) => {
      const key = `${stripNote(w.kana)}|${w.verbGroup}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

/** El verbo en forma ます, sin la aclaración ［…］, con kanji si están todos vistos. */
export function masuDisplay(word: VocabWord, showAllKanji = false): WordDisplay {
  return displayWord({ ...word, kana: stripNote(word.kana), kanji: word.kanji ? stripNote(word.kanji) : undefined }, showAllKanji)
}

/** El verbo conjugado, con kanji si la forma ます se muestra con kanji. */
export function formDisplay(word: VocabWord, form: VerbFormId, showAllKanji = false): WordDisplay | null {
  const c = conjugate(word, form)
  if (!c) return null
  const base = masuDisplay(word, showAllKanji)
  return base.reading && c.kanji ? { main: c.kanji, reading: c.kana } : { main: c.kana, reading: '' }
}

/**
 * ¿Lo que escribió la persona es la respuesta? Acepta hiragana, katakana, la escritura con
 * kanji o romaji (kaite, katte…), sin espacios.
 */
export function isRightAnswer(input: string, answer: { kana: string; kanji?: string }): boolean {
  const typed = input.replace(/[\s　]/g, '')
  if (!typed) return false
  if (typed === answer.kanji) return true
  if (looksLikeRomaji(typed)) return romajiKey(typed) === kanaKey(answer.kana)
  return toHiragana(typed) === answer.kana
}
