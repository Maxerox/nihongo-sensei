import { describe, expect, it } from 'vitest'
import counters from '../../../data/counters.json'
import type { CountersData } from '../../types/content'
import { counterQuestionKeys, DAY_POOL, makeCounterQuestion } from '../counterQuiz'

const data = counters as CountersData

describe('counterQuestionKeys', () => {
  it('separa contadores y fechas, y "all" junta las dos', () => {
    const c = counterQuestionKeys(data, 'counters')
    const d = counterQuestionKeys(data, 'dates')
    expect(d).toHaveLength(12 + DAY_POOL.length)
    expect(counterQuestionKeys(data, 'all')).toEqual([...c, ...d])
    expect(new Set([...c, ...d]).size).toBe(c.length + d.length)
  })

  it('no pregunta 何つ (se pregunta いくつ)', () => {
    const i = data.counters.findIndex((c) => c.label === 'つ')
    expect(counterQuestionKeys(data, 'counters')).not.toContain(`q:${i}`)
  })
})

describe('makeCounterQuestion', () => {
  it('cada pregunta tiene la respuesta entre opciones distintas', () => {
    for (const key of counterQuestionKeys(data, 'all')) {
      const q = makeCounterQuestion(data, key)
      expect(q.answer).toBeTruthy()
      expect(q.options).toContain(q.answer)
      expect(new Set(q.options).size).toBe(q.options.length)
      expect(q.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('cuenta días de duración: 1日 es いちにち y ofrece ついたち como trampa', () => {
    const i = data.counters.findIndex((c) => c.label === '日')
    const q = makeCounterQuestion(data, `c:${i}:1`)
    expect(q).toMatchObject({ display: '1日(間)', answer: 'いちにち／いちにちかん' })
    expect(q.options).toContain('ついたち')
    expect(makeCounterQuestion(data, `c:${i}:3`).answer).toBe('みっか／みっかかん')
    // La fecha que se lee igual no aparece como opción incorrecta.
    expect(makeCounterQuestion(data, `c:${i}:3`).options).not.toContain('みっか')
    expect(makeCounterQuestion(data, `q:${i}`).answer).toBe('なんにち')
  })

  it('pregunta también los días especiales después del 10', () => {
    const i = data.counters.findIndex((c) => c.label === '日')
    const keys = counterQuestionKeys(data, 'counters')
    for (const n of [14, 17, 19, 20, 24]) expect(keys).toContain(`c:${i}:${n}`)
    expect(makeCounterQuestion(data, `c:${i}:20`)).toMatchObject({ display: '20日(間)', answer: 'はつか／はつかかん' })
  })

  it('lee días y meses', () => {
    expect(makeCounterQuestion(data, 'd:8')).toMatchObject({ display: '8日', answer: 'ようか' })
    expect(makeCounterQuestion(data, 'm:4')).toMatchObject({ display: '4月', answer: 'しがつ' })
  })
})

describe('counterItems', () => {
  it('marca como irregulares las lecturas especiales de 日, con o sin 間', async () => {
    const { counterItems } = await import('../counters')
    const c = data.counters.find((x) => x.label === '日')!
    const items = counterItems(c, data.numberBase)
    expect(items.map((it) => it.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 17, 19, 20, 24])
    expect(items.filter((it) => !it.irregular).map((it) => it.n)).toEqual([1])
    expect(items.every((it) => it.reading.split('／')[1] === it.reading.split('／')[0] + 'かん')).toBe(true)
    expect(items.find((it) => it.n === 2)).toMatchObject({ display: 'ふつか（かん）', speak: 'ふつか' })
  })

  it('no cambia los otros contadores', async () => {
    const { counterItems } = await import('../counters')
    const nin = data.counters.find((x) => x.id === 'nin')!
    const items = counterItems(nin, data.numberBase)
    expect(items).toHaveLength(10)
    expect(items.filter((it) => it.irregular).map((it) => it.n)).toEqual([1, 2, 4])
  })
})
