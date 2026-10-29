// Controla el contenido de la sección Kanji (kanji-book.json y kanji-strokes.json).
import { describe, expect, it } from 'vitest'
import kanjiBook from '../../../data/kanji-book.json'
import kanjiStrokes from '../../../data/kanji-strokes.json'
import type { KanjiBookData, KanjiStrokesData } from '../../types/content'
import { alignReading } from '../furigana'

const book = kanjiBook as KanjiBookData
const strokes = kanjiStrokes as unknown as KanjiStrokesData
const all = book.units.flatMap((u) => u.kanji)

describe('libro de kanji', () => {
  it('tiene las unidades 1 a 9 y 72 kanji sin repetir', () => {
    expect(book.units.map((u) => u.unit)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(all).toHaveLength(72)
    expect(new Set(all.map((k) => k.kanji)).size).toBe(72)
  })

  it('cada kanji tiene trazos, con un número por trazo', () => {
    const bad = all
      .map((k) => k.kanji)
      .filter((k) => !strokes[k] || strokes[k].points.length !== strokes[k].strokes.length || strokes[k].numbers.length !== strokes[k].strokes.length)
    expect(bad).toEqual([])
  })

  it('cada kanji tiene significado, alguna lectura y ejemplos que lo usan', () => {
    const bad = all
      .filter((k) => !k.meaning || k.on.length + k.kun.length === 0 || k.examples.length === 0 || k.examples.some((e) => !e.word.includes(k.kanji)))
      .map((k) => k.kanji)
    expect(bad).toEqual([])
  })

  it('las lecturas on van en katakana y las kun en hiragana', () => {
    const bad = all
      .filter((k) => k.on.some((r) => !/^[゠-ヿ]+$/.test(r)) || k.kun.some((r) => !/^[぀-ゟ.]+$/.test(r)))
      .map((k) => k.kanji)
    expect(bad).toEqual([])
  })

  it('la furigana de cada ejemplo se puede repartir entre sus kanji', () => {
    const notAligned = all
      .flatMap((k) => k.examples)
      .filter((e) => /[぀-ヿ]/.test(e.word))
      .filter((e) => {
        const segs = alignReading(e.word, e.reading)
        return segs.length === 1 && segs[0].reading !== undefined
      })
      .map((e) => e.word)
    expect(notAligned).toEqual([])
  })
})
