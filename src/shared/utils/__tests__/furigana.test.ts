import { describe, expect, it } from 'vitest'
import { readNumber, toFurigana, toMarkedFurigana } from '../furigana'

const readings = (text: string) =>
  toFurigana(text)
    .filter((s) => s.reading)
    .map((s) => `${s.text}:${s.reading}`)

describe('toFurigana', () => {
  it('usa la palabra más larga del diccionario', () => {
    expect(readings('会社員です')).toEqual(['会社員:かいしゃいん'])
    expect(readings('電車で 行きます')).toEqual(['電車:でんしゃ', '行:い'])
  })

  it('lee 人 según el contexto', () => {
    expect(readings('あの 人')).toEqual(['人:ひと'])
    expect(readings('インドネシア人')).toEqual(['人:じん'])
    expect(readings('何人')).toEqual(['何:なん', '人:にん'])
    expect(readings('～人')).toEqual(['人:にん'])
  })

  it('lee 来 según la conjugación', () => {
    expect(readings('来ます')).toEqual(['来:き'])
    expect(readings('来ない')).toEqual(['来:こ'])
    expect(readings('来る')).toEqual(['来:く'])
  })

  it('distingue なに y なん', () => {
    expect(readings('何を')).toEqual(['何:なに'])
    expect(readings('何か 飲みませんか')).toEqual(['何:なに', '飲:の'])
    expect(readings('何ですか')).toEqual(['何:なん'])
    expect(readings('何かい')).toEqual(['何:なん'])
  })

  it('lee los días de la semana', () => {
    expect(readings('日よう日')).toEqual(['日:にち', '日:び'])
    expect(readings('金よう日')).toEqual(['金:きん', '日:び'])
  })

  it('lee números con contador', () => {
    expect(readings('4時')).toEqual(['4時:よじ'])
    expect(readings('25日に')).toEqual(['25日:にじゅうごにち'])
    expect(readings('1か月')).toEqual(['1か月:いっかげつ'])
    expect(readings('2時間半')).toEqual(['2時間:にじかん', '半:はん'])
    expect(readings('18,600円')).toEqual(['18,600円:いちまんはっせんろっぴゃくえん'])
  })

  it('no toca el texto sin kanji', () => {
    expect(toFurigana('ひらがな と カタカナ')).toEqual([{ text: 'ひらがな と カタカナ' }])
  })
})

describe('toMarkedFurigana', () => {
  it('mantiene el contexto a través de las marcas', () => {
    const segs = toMarkedFurigana('あした 来[[なくても いいです]]')
    expect(segs.find((s) => s.text === '来')?.reading).toBe('こ')
    expect(segs.filter((s) => s.mark).map((s) => s.text).join('')).toBe('なくても いいです')
  })

  it('marca un kanji que está dentro de la marca', () => {
    const segs = toMarkedFurigana('[[何さい]]ですか')
    expect(segs[0]).toMatchObject({ text: '何', reading: 'なん', mark: true })
  })
})

describe('readNumber', () => {
  it('usa las tablas de contadores, días y meses', () => {
    expect(readNumber('8', '日')).toBe('ようか')
    expect(readNumber('4', '月')).toBe('しがつ')
    expect(readNumber('2', '人')).toBe('ふたり')
    expect(readNumber('7', '時間')).toBe('ななじかん')
    expect(readNumber('99', '人')).toBeNull()
  })
})
