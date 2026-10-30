import { describe, expect, it } from 'vitest'
import { answerRound, nextInRound, remaining, RETRY_GAP, startRound } from '../quizRound'

const inOrder = <K,>(k: readonly K[]) => [...k]
const play = (round: ReturnType<typeof startRound<string>>, correct: boolean) => nextInRound(answerRound(round, correct))

describe('quizRound', () => {
  it('lo que se acierta no vuelve a salir', () => {
    let r = startRound(['a', 'b', 'c'], inOrder)
    const asked: string[] = []
    while (r.queue.length) {
      asked.push(r.queue[0])
      r = play(r, true)
    }
    expect(asked).toEqual(['a', 'b', 'c'])
    expect(r.firstTry).toBe(3)
  })

  it('lo que se falla vuelve unas preguntas después, hasta acertarlo', () => {
    let r = startRound(['a', 'b', 'c', 'd', 'e'], inOrder)
    r = play(r, false)
    expect(r.queue).toEqual(['b', 'c', 'd', 'a', 'e'])
    expect(r.queue.indexOf('a')).toBe(RETRY_GAP)
    r = play(play(play(r, true), true), true)
    expect(r.queue[0]).toBe('a')
    r = play(r, true)
    expect(r.queue).toEqual(['e'])
    // 'a' se acertó, pero no al primer intento.
    expect(r.firstTry).toBe(3)
    expect(r.missed).toEqual(['a'])
  })

  it('con una sola pendiente que se falla, se vuelve a preguntar enseguida', () => {
    const r = play(startRound(['a'], inOrder), false)
    expect(r.queue).toEqual(['a'])
  })

  it('solo cuenta la primera respuesta de cada pregunta', () => {
    let r = startRound(['a', 'b'], inOrder)
    r = answerRound(r, false)
    r = answerRound(r, true)
    expect(r.result).toBe(false)
    expect(r.missed).toEqual(['a'])
  })

  it('no avanza si todavía no se respondió', () => {
    const r = startRound(['a', 'b'], inOrder)
    expect(nextInRound(r)).toBe(r)
  })

  it('cuenta las que faltan', () => {
    let r = startRound(['a', 'b', 'c'], inOrder)
    expect(remaining(r)).toBe(3)
    r = answerRound(r, true)
    expect(remaining(r)).toBe(2)
    r = answerRound(nextInRound(r), false)
    expect(remaining(r)).toBe(2)
  })

  it('no repite claves duplicadas', () => {
    expect(startRound(['a', 'a', 'b'], inOrder)).toMatchObject({ queue: ['a', 'b'], total: 2 })
  })
})
