import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../assets/toasty.mp3', () => ({ default: 'toasty.mp3' }))
const { FEEDBACK_TONES, playFeedback } = await import('../sound')

describe('sonidos de los quizzes', () => {
  it('el acierto sube y el error baja', () => {
    const [a, b] = FEEDBACK_TONES.correct
    const [c, d] = FEEDBACK_TONES.wrong
    expect(b.freq).toBeGreaterThan(a.freq)
    expect(d.freq).toBeLessThan(c.freq)
  })

  it('son cortos (menos de medio segundo)', () => {
    for (const tones of Object.values(FEEDBACK_TONES)) {
      expect(Math.max(...tones.map((t) => t.start + t.duration))).toBeLessThan(0.5)
    }
  })

  it('no falla si el navegador no tiene audio', () => {
    expect(() => playFeedback(true)).not.toThrow()
  })
})
