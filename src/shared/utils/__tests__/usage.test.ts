import { describe, expect, it } from 'vitest'
import type { VocabWord } from '../../types/content'
import { mostUsed } from '../usage'

const w = (id: string, uses?: number): VocabWord => ({ id, lesson: 1, kana: id, es: id, category: 'noun', uses })

describe('mostUsed', () => {
  it('se queda con el 30 % que más aparece', () => {
    const words = Array.from({ length: 10 }, (_, i) => w(`w${i}`, i))
    expect(mostUsed(words).map((x) => x.id)).toEqual(['w7', 'w8', 'w9'])
  })

  it('incluye los empates en el corte y respeta el orden original', () => {
    const words = [w('a', 5), w('b', 9), w('c', 5), w('d', 1), w('e', 0)]
    expect(mostUsed(words, 0.4).map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('no incluye palabras sin usos ni sin conteo', () => {
    expect(mostUsed([w('a', 0), w('b'), w('c', 0)])).toEqual([])
  })
})

describe('conteo del libro (vocabulary.json)', async () => {
  const { default: vocabulary } = await import('../../../data/vocabulary.json')
  const words = (vocabulary as { words: VocabWord[] }).words
  const find = (kana: string, lesson?: number) => words.find((x) => x.kana === kana && (lesson === undefined || x.lesson === lesson))!

  it('casi todas las palabras tienen conteo (menos partículas y sufijos con ～)', () => {
    const without = words.filter((x) => x.uses === undefined)
    expect(without.every((x) => x.kana.startsWith('～'))).toBe(true)
    expect(words.length - without.length).toBeGreaterThan(800)
  })

  it('las palabras de todos los días están entre las más usadas', () => {
    const verbs = mostUsed(words.filter((x) => x.category === 'verb')).map((x) => x.kana)
    expect(verbs).toEqual(expect.arrayContaining(['いきます', 'たべます', 'のみます', 'かいます']))
    const l1 = mostUsed(words.filter((x) => x.lesson === 1)).map((x) => x.kana)
    expect(l1).toEqual(expect.arrayContaining(['わたし', 'はい', 'いいえ']))
  })

  it('una palabra rara aparece menos que una común', () => {
    expect(find('いきます').uses!).toBeGreaterThan(find('かんぱい').uses!)
  })
})
