// Controla que el contenido JSON cumpla las normas de CONVENTIONS.md (sección 2).
import { describe, expect, it } from 'vitest'
import counters from '../../../data/counters.json'
import grammar from '../../../data/grammar.json'
import particles from '../../../data/particles.json'
import vocabulary from '../../../data/vocabulary.json'
import type { CountersData, GrammarData, ParticlesData, VocabularyData } from '../../types/content'
import { toFurigana } from '../furigana'
import { isKanji, unknownKanji } from '../kanji'

const g = grammar as GrammarData
const p = particles as ParticlesData
const c = counters as CountersData
const v = vocabulary as VocabularyData

/** Todos los textos en japonés que la app muestra con furigana. */
const japaneseTexts: string[] = [
  ...g.lessons.flatMap((l) =>
    l.points.flatMap((pt) => [pt.pattern, pt.description, ...(pt.examples ?? []).map((e) => e.ja), ...(pt.table?.rows.flat() ?? [])]),
  ),
  ...p.particles.flatMap((x) => [x.note ?? '', ...x.uses.flatMap((u) => [u.description, u.example.ja])]),
  ...p.pairs.flatMap((x) => [x.description, x.exampleA.ja, x.exampleB.ja]),
  ...p.practice.flatMap((x) => [x.sentence, x.explanation]),
  ...c.counters.map((x) => x.note ?? ''),
]

describe('contenido', () => {
  it('los ejemplos solo usan kanji de las unidades 1–8', () => {
    const bad = japaneseTexts.filter((t) => /[぀-ヿ]/.test(t) && unknownKanji(t).length > 0)
    expect(bad).toEqual([])
  })

  it('todo kanji que se muestra tiene lectura (furigana)', () => {
    const missing = new Set<string>()
    for (const t of japaneseTexts) {
      for (const seg of toFurigana(t)) {
        if (!seg.reading) [...seg.text].filter(isKanji).forEach((k) => missing.add(`${k} en «${t}»`))
      }
    }
    expect([...missing]).toEqual([])
  })

  it('cada ejercicio de partículas tiene la respuesta entre las opciones', () => {
    for (const ex of p.practice) expect(ex.options).toContain(ex.answer)
  })

  it('todas las lecciones 1–19 tienen práctica de partículas', () => {
    const lessons = new Set(p.practice.map((x) => x.lesson))
    for (let l = 1; l <= 19; l++) expect(lessons.has(l)).toBe(true)
  })

  it('los ids del vocabulario son únicos', () => {
    expect(new Set(v.words.map((w) => w.id)).size).toBe(v.words.length)
  })

  it('los verbos tienen el grupo correcto en los casos con trampa', () => {
    const group = (kana: string, kanji?: string) =>
      v.words.find((w) => w.kana === kana && (kanji === undefined || w.kanji === kanji))?.verbGroup
    expect(group('おきます', '起きます')).toBe(2)
    expect(group('おきます', '置きます')).toBe(1)
    expect(group('かえります')).toBe(1)
    expect(group('はなします')).toBe(1)
    expect(group('みます')).toBe(2)
    expect(group('もってきます')).toBe(3)
    expect(group('べんきょうします')).toBe(3)
    expect(group('いただきます')).toBeUndefined()
  })

  it('cada contador tiene 10 lecturas', () => {
    for (const x of c.counters) expect(x.readings).toHaveLength(10)
  })
})
