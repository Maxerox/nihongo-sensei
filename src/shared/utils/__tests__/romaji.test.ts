import { describe, expect, it } from 'vitest'
import vocabulary from '../../../data/vocabulary.json'
import type { VocabularyData } from '../../types/content'
import { kanaKey, romajiKey } from '../romaji'

const matches = (query: string, kana: string) => kanaKey(kana).includes(romajiKey(query))

describe('búsqueda en romaji', () => {
  it.each([
    ['benkyou', 'べんきょうします'],
    ['benkyo', 'べんきょうします'],
    ['benkyō', 'べんきょうします'],
    ['shinbun', 'しんぶん'],
    ['shimbun', 'しんぶん'],
    ['sinbun', 'しんぶん'],
    ['kissaten', 'きっさてん'],
    ['chotto', 'ちょっと'],
    ['jisho', 'じしょ'],
    ['zisyo', 'じしょ'],
    ['tsukue', 'つくえ'],
    ['tukue', 'つくえ'],
    ['fuku', 'ふく'],
    ['kōhī', 'コーヒー'],
    ['koohii', 'コーヒー'],
    ['konnichiwa', 'こんにちは'],
    ['kanji', 'かんじ'],
    ['jitensha', 'じてんしゃ'],
    ['ocha', 'おちゃ'],
  ])('«%s» encuentra %s', (query, kana) => {
    expect(matches(query, kana)).toBe(true)
  })

  it('no encuentra palabras distintas', () => {
    expect(matches('neko', 'いぬ')).toBe(false)
    expect(matches('kasa', 'かぎ')).toBe(false)
  })

  it('toda palabra escrita en kana tiene clave de romaji', () => {
    const words = (vocabulary as VocabularyData).words.filter((w) => /[\u3040-\u30FF]/.test(w.kana))
    const empty = words.filter((w) => kanaKey(w.kana).length === 0).map((w) => w.kana)
    expect(empty).toEqual([])
  })
})
