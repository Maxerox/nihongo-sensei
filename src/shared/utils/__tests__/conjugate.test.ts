import { describe, expect, it } from 'vitest'
import vocabulary from '../../../data/vocabulary.json'
import type { VerbGroup, VocabularyData } from '../../types/content'
import { conjugate, explain, VERB_FORM_IDS, wrongForms, type VerbFormId } from '../conjugate'

const words = (vocabulary as VocabularyData).words
const verbs = words.filter((w) => w.category === 'verb')
const v = (kana: string, group: VerbGroup, kanji?: string) => ({ kana, kanji, verbGroup: group })
const forms = (kana: string, group: VerbGroup) =>
  Object.fromEntries((['te', 'nai', 'jisho', 'ta'] as VerbFormId[]).map((f) => [f, conjugate(v(kana, group), f)?.kana]))

describe('conjugate', () => {
  it('grupo I, cada terminación', () => {
    expect(forms('かいます', 1)).toEqual({ te: 'かって', nai: 'かわない', jisho: 'かう', ta: 'かった' })
    expect(forms('まちます', 1)).toEqual({ te: 'まって', nai: 'またない', jisho: 'まつ', ta: 'まった' })
    expect(forms('かえります', 1)).toEqual({ te: 'かえって', nai: 'かえらない', jisho: 'かえる', ta: 'かえった' })
    expect(forms('よみます', 1)).toEqual({ te: 'よんで', nai: 'よまない', jisho: 'よむ', ta: 'よんだ' })
    expect(forms('あそびます', 1)).toEqual({ te: 'あそんで', nai: 'あそばない', jisho: 'あそぶ', ta: 'あそんだ' })
    expect(forms('かきます', 1)).toEqual({ te: 'かいて', nai: 'かかない', jisho: 'かく', ta: 'かいた' })
    expect(forms('およぎます', 1)).toEqual({ te: 'およいで', nai: 'およがない', jisho: 'およぐ', ta: 'およいだ' })
    expect(forms('はなします', 1)).toEqual({ te: 'はなして', nai: 'はなさない', jisho: 'はなす', ta: 'はなした' })
  })

  it('excepciones: 行きます, あります, いらっしゃいます', () => {
    expect(forms('いきます', 1)).toEqual({ te: 'いって', nai: 'いかない', jisho: 'いく', ta: 'いった' })
    expect(forms('もっていきます', 1).te).toBe('もっていって')
    expect(forms('あります', 1).nai).toBe('ない')
    expect(forms('いらっしゃいます', 1)).toEqual({ te: 'いらっしゃって', nai: 'いらっしゃらない', jisho: 'いらっしゃる', ta: 'いらっしゃった' })
    // き pero no 行きます
    expect(forms('ききます', 1).te).toBe('きいて')
  })

  it('grupo II, incluso con raíz en i (みます, おきます, かります)', () => {
    expect(forms('たべます', 2)).toEqual({ te: 'たべて', nai: 'たべない', jisho: 'たべる', ta: 'たべた' })
    expect(forms('みます', 2)).toEqual({ te: 'みて', nai: 'みない', jisho: 'みる', ta: 'みた' })
    expect(forms('かります', 2).te).toBe('かりて')
  })

  it('grupo III: します, 来ます y compuestos', () => {
    expect(forms('します', 3)).toEqual({ te: 'して', nai: 'しない', jisho: 'する', ta: 'した' })
    expect(forms('べんきょうします', 3)).toEqual({ te: 'べんきょうして', nai: 'べんきょうしない', jisho: 'べんきょうする', ta: 'べんきょうした' })
    expect(forms('きます', 3)).toEqual({ te: 'きて', nai: 'こない', jisho: 'くる', ta: 'きた' })
    expect(forms('もってきます', 3).nai).toBe('もってこない')
  })

  it('conjuga también la escritura con kanji', () => {
    expect(conjugate(v('かきます', 1, '書きます'), 'te')).toEqual({ kana: 'かいて', kanji: '書いて' })
    expect(conjugate(v('きます', 3, '来ます'), 'nai')).toEqual({ kana: 'こない', kanji: '来ない' })
    expect(conjugate(v('もってきます', 3, '持って来ます'), 'jisho')).toEqual({ kana: 'もってくる', kanji: '持って来る' })
    expect(conjugate(v('いきます', 1, '行きます'), 'ta')).toEqual({ kana: 'いった', kanji: '行った' })
    expect(conjugate(v('すいます［たばこを～］', 1, '吸います'), 'nai')).toEqual({ kana: 'すわない', kanji: '吸わない' })
  })

  it('las formas de ます', () => {
    expect(conjugate(v('たべます', 2), 'masen')?.kana).toBe('たべません')
    expect(conjugate(v('たべます', 2), 'mashita')?.kana).toBe('たべました')
    expect(conjugate(v('たべます', 2), 'masendeshita')?.kana).toBe('たべませんでした')
  })

  it('conjuga todos los verbos del vocabulario, en todas las formas', () => {
    const bad = verbs.flatMap((w) => VERB_FORM_IDS.filter((f) => !conjugate(w, f)).map((f) => `${w.kana} ${f}`))
    expect(bad).toEqual([])
  })
})

describe('wrongForms', () => {
  it('da al menos 3 respuestas incorrectas distintas de la correcta, para todos los verbos', () => {
    const bad = verbs.flatMap((w) =>
      VERB_FORM_IDS.filter((f) => {
        const wrong = wrongForms(w, f)
        return wrong.length < 3 || wrong.includes(conjugate(w, f)!.kana)
      }).map((f) => `${w.kana} ${f}`),
    )
    expect(bad).toEqual([])
  })

  it('usa los errores típicos', () => {
    expect(wrongForms(v('かいます', 1), 'te')).toEqual(expect.arrayContaining(['かいて', 'かんで']))
    expect(wrongForms(v('みます', 2), 'te')).toContain('みって')
    expect(wrongForms(v('かきます', 1), 'nai')).toContain('かきない')
  })
})

describe('explain', () => {
  it('explica la regla y las excepciones', () => {
    expect(explain(v('かいます', 1), 'nai')).toContain('わ')
    expect(explain(v('いきます', 1), 'te')).toContain('Excepción')
    expect(explain(v('きます', 3), 'nai')).toContain('こない')
    expect(explain(v('たべます', 2), 'te')).toContain('Grupo II')
  })
})

describe('verb-forms.json', async () => {
  const { default: data } = await import('../../../data/verb-forms.json')
  const info = data as import('../../types/content').VerbFormsData
  const groupOf: Record<string, VerbGroup> = { I: 1, II: 2, III: 3 }

  it('tiene todas las formas que se practican', () => {
    expect(info.forms.map((f) => f.id).sort()).toEqual([...VERB_FORM_IDS].sort())
  })

  it('cada ejemplo de las reglas coincide con conjugate()', () => {
    const bad: string[] = []
    for (const f of info.forms) {
      for (const r of f.rules) {
        for (const ex of r.examples) {
          const [from, to] = ex.split(' → ')
          // El grupo del ejemplo: el de la regla, o el del vocabulario si la regla es para todos.
          const g = groupOf[r.group] ?? verbs.find((w) => w.kana === from)?.verbGroup
          const got = conjugate({ kana: from, verbGroup: g }, f.id)?.kana
          if (got !== to) bad.push(`${f.id}: ${ex} (da ${got})`)
        }
      }
    }
    expect(bad).toEqual([])
  })
})

describe('verbs', async () => {
  const { practiceVerbs, formDisplay, isRightAnswer } = await import('../verbs')

  it('practica cada verbo una sola vez', () => {
    const list = practiceVerbs(words)
    expect(list.filter((w) => w.kana.startsWith('はいります'))).toHaveLength(1)
    expect(list.filter((w) => w.kana.startsWith('あります'))).toHaveLength(1)
    expect(list.length).toBeGreaterThan(90)
  })

  it('muestra la forma conjugada con kanji solo si el verbo se muestra con kanji', () => {
    const iku = words.find((w) => w.kana === 'いきます')!
    expect(formDisplay(iku, 'te')).toEqual({ main: '行って', reading: 'いって' })
    const wakaru = words.find((w) => w.kana === 'わかります')!
    expect(formDisplay(wakaru, 'nai')).toEqual({ main: 'わからない', reading: '' })
  })

  it('acepta hiragana, katakana, kanji y romaji', () => {
    const ans = { kana: 'かいて', kanji: '書いて' }
    expect(isRightAnswer('かいて', ans)).toBe(true)
    expect(isRightAnswer('カイテ', ans)).toBe(true)
    expect(isRightAnswer('書いて', ans)).toBe(true)
    expect(isRightAnswer('kaite', ans)).toBe(true)
    expect(isRightAnswer(' kai te ', ans)).toBe(true)
    expect(isRightAnswer('katte', ans)).toBe(false)
    expect(isRightAnswer('いって', { kana: 'いって' })).toBe(true)
    expect(isRightAnswer('itte', { kana: 'いって' })).toBe(true)
    expect(isRightAnswer('ite', { kana: 'いって' })).toBe(false)
    expect(isRightAnswer('', ans)).toBe(false)
  })

  it('verb-forms.json usa solo kanji de las unidades 1–8', async () => {
    const { default: kanji } = await import('../../../data/kanji.json')
    const { default: forms } = await import('../../../data/verb-forms.json')
    const allowed = (kanji as { allowedKanji: string }).allowedKanji
    expect([...JSON.stringify(forms)].filter((c) => /[一-鿿]/.test(c) && !allowed.includes(c))).toEqual([])
  })
})
