import { describe, expect, it } from 'vitest'
import kanjiStrokes from '../../../data/kanji-strokes.json'
import { checkDrawing, describeResult, resample, type Stroke } from '../strokes'

const data = kanjiStrokes as unknown as Record<string, { points: Stroke[] }>
const ref = (k: string) => data[k].points

// Ruido determinístico para simular una mano que tiembla.
let seed = 1
const noise = (amplitude = 6) => {
  seed = (seed * 16807) % 2147483647
  return (seed / 2147483647 - 0.5) * amplitude
}
/** Dibujo "a mano": más chico, corrido y con temblor. */
const handDrawn = (strokes: Stroke[], scale = 0.7, dx = 12, dy = -8, jitter = 6): Stroke[] =>
  strokes.map((s) => s.map(([x, y]) => [x * scale + dx + noise(jitter), y * scale + dy + noise(jitter)]))

describe('resample', () => {
  it('reparte los puntos a la misma distancia', () => {
    const r = resample([[0, 0], [10, 0]], 6)
    expect(r.map((p) => Math.round(p[0]))).toEqual([0, 2, 4, 6, 8, 10])
  })
})

describe('checkDrawing', () => {
  it.each(['日', '人', '鳥', '聞', '帰', '右', '左', '門'])('acepta %s bien dibujado, aunque esté más chico y corrido', (k) => {
    expect(checkDrawing(handDrawn(ref(k)), ref(k)).correct).toBe(true)
  })

  it('detecta un trazo en la dirección contraria', () => {
    const strokes = handDrawn(ref('日'))
    strokes[1] = [...strokes[1]].reverse()
    const r = checkDrawing(strokes, ref('日'))
    expect(r.correct).toBe(false)
    expect(r.strokes[1].status).toBe('direction')
  })

  it('detecta trazos en otro orden', () => {
    const strokes = handDrawn(ref('十'))
    const r = checkDrawing([strokes[1], strokes[0]], ref('十'))
    expect(r.strokes.map((s) => s.status)).toEqual(['order', 'order'])
    expect(r.strokes[0].looksLike).toBe(2)
  })

  it('detecta trazos de menos', () => {
    const r = checkDrawing(handDrawn(ref('日')).slice(0, 3), ref('日'))
    expect(r.correct).toBe(false)
    expect(describeResult(r)[0]).toBe('Falta 1 trazo: tiene 4.')
  })

  it('rechaza otro kanji con la misma cantidad de trazos', () => {
    // 日 y 月 tienen 4 trazos.
    expect(checkDrawing(handDrawn(ref('月')), ref('日')).correct).toBe(false)
  })

  it('avisa cuando dos trazos que se tocan quedan separados (八 en vez de 入)', () => {
    // Sin temblor: con mucho temblor todavía puede pasar alguna vez (están en el límite).
    const r = checkDrawing(handDrawn(ref('八'), 0.7, 12, -8, 0), ref('入'))
    expect(r.correct).toBe(false)
    expect(describeResult(r)).toContain('Trazo 2: tiene que tocar el trazo 1.')
  })

  it('felicita cuando está todo bien', () => {
    expect(describeResult(checkDrawing(handDrawn(ref('山')), ref('山')))).toEqual(['¡Muy bien! Los 3 trazos están bien.'])
  })
})
