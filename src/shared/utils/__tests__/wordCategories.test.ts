import { describe, expect, it } from 'vitest'
import vocabulary from '../../../data/vocabulary.json'
import type { VocabularyData } from '../../types/content'
import { byCategory, pickDistractors, WORD_CATEGORIES } from '../wordCategories'

const data = vocabulary as VocabularyData
const words = data.words
const find = (kana: string) => words.find((w) => w.kana === kana)!

describe('categorías del vocabulario', () => {
  it('toda palabra tiene una categoría conocida', () => {
    const ids = new Set(WORD_CATEGORIES.map((c) => c.id))
    expect(words.filter((w) => !ids.has(w.category)).map((w) => w.kana)).toEqual([])
  })

  it('los verbos son justo las palabras con grupo', () => {
    expect(words.filter((w) => (w.category === 'verb') !== (w.verbGroup !== undefined)).map((w) => w.kana)).toEqual([])
  })

  it('los adjetivos な son los que llevan ［な］', () => {
    expect(words.filter((w) => (w.category === 'adj-na') !== w.kana.includes('［な］')).map((w) => w.kana)).toEqual([])
  })

  it('clasifica bien los casos con trampa', () => {
    expect(find('おおきい').category).toBe('adj-i')
    expect(find('ちいさい').category).toBe('adj-i')
    expect(find('せかい').category).toBe('noun')
    expect(find('おととい').category).toBe('noun')
    expect(find('ちち').category).toBe('noun')
    expect(find('いただきます').category).toBe('expression')
    expect(find('はい').category).toBe('expression')
    expect(find('ときどき').category).toBe('adverb')
    expect(find('どこ').category).toBe('question')
    expect(find('でも').category).toBe('other')
  })

  it('cada categoría tiene al menos 4 palabras (para armar el quiz)', () => {
    for (const c of WORD_CATEGORIES) expect(byCategory(words, c.id).length).toBeGreaterThanOrEqual(4)
  })
})

describe('pickDistractors', () => {
  it('en modo difícil, las opciones son del mismo tipo de palabra', () => {
    for (const kana of ['たべます', 'おおきい', 'きれい［な］', 'ほん', 'いつも', 'どこ']) {
      const w = find(kana)
      for (let i = 0; i < 20; i++) {
        const d = pickDistractors(w, words, true)
        expect(d).toHaveLength(3)
        expect(d.every((x) => x.category === w.category)).toBe(true)
      }
    }
  })

  it('si no alcanzan en las lecciones elegidas, completa con el resto del vocabulario', () => {
    const w = find('おおきい')
    const lesson = words.filter((x) => x.lesson === w.lesson)
    const d = pickDistractors(w, lesson.filter((x) => x.category !== 'adj-i' || x.id === w.id), true, words)
    expect(d).toHaveLength(3)
    expect(d.every((x) => x.category === 'adj-i')).toBe(true)
  })

  it('no repite significado ni lectura, ni la palabra misma', () => {
    const w = find('あつい')
    const d = pickDistractors(w, words, true)
    expect(d.some((x) => x.kana === 'あつい' || x.id === w.id)).toBe(false)
  })
})
