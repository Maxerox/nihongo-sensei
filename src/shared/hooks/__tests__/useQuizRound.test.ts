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

describe('useQuizRound con sessionStorage', () => {
  it('al recargar sigue la misma ronda, sin repetir lo acertado', () => {
    sessionStorage.clear()
    const first = renderHook(() => useQuizRound(keys, 'r', (k) => k, 'test_round'))
    const asked = first.result.current.current!
    act(() => first.result.current.answer('x', true))
    act(() => first.result.current.next())
    first.unmount()
    const again = renderHook(() => useQuizRound(keys, 'r', (k) => k, 'test_round'))
    expect(again.result.current).toMatchObject({ total: 3, left: 2, firstTry: 1 })
    expect(again.result.current.current).not.toBe(asked)
  })

  it('si se recarga con la pregunta ya respondida, pasa a la siguiente', () => {
    sessionStorage.clear()
    const first = renderHook(() => useQuizRound(keys, 'r', (k) => k, 'test_round'))
    act(() => first.result.current.answer('x', false))
    const failed = first.result.current.current
    first.unmount()
    const again = renderHook(() => useQuizRound(keys, 'r', (k) => k, 'test_round'))
    expect(again.result.current.chosen).toBeNull()
    expect(again.result.current.current).not.toBe(failed)
    expect(again.result.current.missed).toEqual([failed])
  })

  it('con otra clave (otras lecciones) empieza de cero', () => {
    sessionStorage.clear()
    const first = renderHook(() => useQuizRound(keys, 'r', (k) => k, 'test_round'))
    act(() => first.result.current.answer('x', true))
    act(() => first.result.current.next())
    first.unmount()
    const other = renderHook(() => useQuizRound(['z', 'y'], 'otra', (k) => k, 'test_round'))
    expect(other.result.current).toMatchObject({ total: 2, left: 2, firstTry: 0 })
  })
})
