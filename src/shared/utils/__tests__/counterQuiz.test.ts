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
    expect(q).toMatchObject({ display: '1日', answer: 'いちにち' })
    expect(q.options).toContain('ついたち')
    expect(makeCounterQuestion(data, `c:${i}:3`).answer).toBe('みっか')
    expect(makeCounterQuestion(data, `q:${i}`).answer).toBe('なんにち')
  })

  it('lee días y meses', () => {
    expect(makeCounterQuestion(data, 'd:8')).toMatchObject({ display: '8日', answer: 'ようか' })
    expect(makeCounterQuestion(data, 'm:4')).toMatchObject({ display: '4月', answer: 'しがつ' })
  })
})
