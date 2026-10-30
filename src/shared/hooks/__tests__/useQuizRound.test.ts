import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useQuizRound } from '../useQuizRound'

const keys = ['a', 'b', 'c']
const answerAll = (result: { current: ReturnType<typeof useQuizRound<string, string>> }, correct: (k: string) => boolean) => {
  const asked: string[] = []
  for (let i = 0; i < 20 && !result.current.done; i++) {
    const k = result.current.current!
    asked.push(k)
    act(() => result.current.answer('x', correct(k)))
    act(() => result.current.next())
  }
  return asked
}

describe('useQuizRound', () => {
  it('pregunta cada clave una vez si se aciertan todas', () => {
    const { result } = renderHook(() => useQuizRound(keys, 'r', (k) => `¿${k}?`))
    expect(result.current.question).toBe(`¿${result.current.current}?`)
    expect([...answerAll(result, () => true)].sort()).toEqual(keys)
    expect(result.current).toMatchObject({ done: true, firstTry: 3, total: 3 })
  })

  it('vuelve a preguntar la que se falla hasta acertarla', () => {
    const { result } = renderHook(() => useQuizRound(keys, 'r', (k) => k))
    const first = result.current.current!
    let failed = false
    const asked = answerAll(result, (k) => {
      if (k === first && !failed) return !(failed = true)
      return true
    })
    expect(asked.filter((k) => k === first)).toHaveLength(2)
    expect(result.current.missed).toEqual([first])
    expect(result.current.firstTry).toBe(2)
  })

  it('"Practicar las que fallé" arma una ronda solo con esas', () => {
    const { result } = renderHook(() => useQuizRound(keys, 'r', (k) => k))
    const first = result.current.current!
    let failed = false
    answerAll(result, (k) => (k === first && !failed ? !(failed = true) : true))
    act(() => result.current.retryMissed())
    expect(result.current).toMatchObject({ total: 1, current: first, done: false })
  })

  it('empieza de nuevo cuando cambia la clave', () => {
    const { result, rerender } = renderHook(({ k }) => useQuizRound(k === 'r' ? keys : ['z'], k, (x) => x), { initialProps: { k: 'r' } })
    rerender({ k: 's' })
    expect(result.current).toMatchObject({ total: 1, current: 'z' })
  })
})
