import { describe, expect, it } from 'vitest'
import kanjiBook from '../../../data/kanji-book.json'
import type { KanjiBookData } from '../../types/content'
import { canAsk, KANJI_QUIZ_KINDS, kindFor, makeKanjiQuestion, meaningsOverlap } from '../kanjiQuiz'

const book = kanjiBook as KanjiBookData
const all = book.units.flatMap((u) => u.kanji)
const unit = (n: number) => book.units.find((u) => u.unit === n)!.kanji
const get = (k: string) => all.find((x) => x.kanji === k)!

describe('meaningsOverlap', () => {
  it('detecta acepciones compartidas', () => {
    expect(meaningsOverlap('medio; dentro', 'dentro')).toBe(true)
    expect(meaningsOverlap('pie; pierna', 'mano')).toBe(false)
  })
})

describe('makeKanjiQuestion', () => {
  it.each(KANJI_QUIZ_KINDS)('arma 4 opciones distintas con la respuesta (%s), en cada unidad', (kind) => {
    for (const u of book.units) {
      for (const item of u.kanji) {
        const q = makeKanjiQuestion(u.kanji, item, kind)
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.options).toContain(q.answer)
      }
    }
  })

  it('pregunta el significado del kanji', () => {
    const q = makeKanjiQuestion(all, get('体'), 'meaning')
    expect(q.answer).toBe(get('体').meaning)
  })

  it('no ofrece como distractor un kanji con el mismo significado', () => {
    const pool = unit(5)
    for (const item of pool) {
      for (let i = 0; i < 20; i++) {
        const q = makeKanjiQuestion(pool, item, 'kanji')
        const wrong = q.options.filter((o) => o !== q.answer)
        expect(wrong.filter((o) => meaningsOverlap(get(o).meaning, item.meaning))).toEqual([])
      }
    }
  })

  it('en lectura, pregunta una palabra que usa el kanji', () => {
    const q = makeKanjiQuestion(all, get('学'), 'reading')
    expect(q.example?.word).toContain('学')
    expect(q.answer).toBe(q.example?.reading)
  })
})

describe('canAsk', () => {
  it('pide al menos 4 kanji', () => {
    expect(canAsk(unit(9).slice(0, 3), 'meaning')).toBe(false)
    expect(canAsk(unit(9), 'meaning')).toBe(true)
  })
})

describe('kindFor', () => {
  it('respeta el modo elegido y mezcla en "mix"', () => {
    expect(kindFor('reading')).toBe('reading')
    expect(kindFor('mix', () => 0)).toBe('meaning')
    expect(kindFor('mix', () => 0.99)).toBe('reading')
  })
})
