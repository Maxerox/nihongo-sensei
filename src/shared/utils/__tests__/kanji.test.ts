import { describe, expect, it } from 'vitest'
import { displayWord } from '../kanji'
import { isIrregular, naiveDay, naiveMonth } from '../counters'
import { buildOptions } from '../random'

const base = ['いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう']

describe('displayWord', () => {
  it('muestra kanji si todos están permitidos', () => {
    expect(displayWord({ id: 'x', lesson: 1, kana: 'がくせい', kanji: '学生', es: '' })).toEqual({ main: '学生', reading: 'がくせい' })
  })
  it('usa kana si hay un kanji no visto', () => {
    expect(displayWord({ id: 'x', lesson: 3, kana: 'でんわ', kanji: '電話', es: '' })).toEqual({ main: 'でんわ', reading: '' })
  })
  it('muestra todos los kanji si se pide', () => {
    expect(displayWord({ id: 'x', lesson: 3, kana: 'でんわ', kanji: '電話', es: '' }, true).main).toBe('電話')
  })
})

describe('contadores', () => {
  it('arma días y meses ingenuos', () => {
    expect(naiveDay(base, 14)).toBe('じゅうよんにち')
    expect(naiveDay(base, 20)).toBe('にじゅうにち')
    expect(naiveMonth(base, 4)).toBe('よんがつ')
  })
  it('detecta lecturas irregulares', () => {
    expect(isIrregular('よじ', 'よんじ')).toBe(true)
    expect(isIrregular('ななじかん／しちじかん', 'ななじかん')).toBe(false)
  })
})

describe('buildOptions', () => {
  it('incluye la respuesta y el distractor, sin repetir', () => {
    const opts = buildOptions('ようか', 'はちにち', ['よっか', 'ここのか', 'ようか', 'なのか'])
    expect(opts).toHaveLength(4)
    expect(opts).toContain('ようか')
    expect(opts).toContain('はちにち')
    expect(new Set(opts).size).toBe(4)
  })
})
