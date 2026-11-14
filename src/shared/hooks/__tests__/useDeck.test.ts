import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDeck } from '../useDeck'

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
const noop = () => {}

describe('useDeck con sessionStorage', () => {
  it('al recargar sigue en la misma tarjeta y con el mismo orden', () => {
    sessionStorage.clear()
    const first = renderHook(() => useDeck(items, 'r', noop, 'test_deck'))
    act(() => first.result.current.move(1))
    act(() => first.result.current.move(1))
    const order = first.result.current.deck.map((x) => x.id)
    first.unmount()
    const again = renderHook(() => useDeck(items, 'r', noop, 'test_deck'))
    expect(again.result.current.index).toBe(2)
    expect(again.result.current.deck.map((x) => x.id)).toEqual(order)
  })

  it('si cambiaron las palabras, arma un mazo nuevo', () => {
    sessionStorage.clear()
    const first = renderHook(() => useDeck(items, 'r', noop, 'test_deck'))
    act(() => first.result.current.move(1))
    first.unmount()
    const again = renderHook(() => useDeck(items.slice(0, 3), 'r', noop, 'test_deck'))
    expect(again.result.current.index).toBe(0)
    expect(again.result.current.deck).toHaveLength(3)
  })
})
