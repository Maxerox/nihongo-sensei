import toastySound from '../../assets/toasty.mp3'

/**
 * Grito del easter egg "Toasty!" (grabación propia, en src/assets/toasty.mp3).
 * Se usa tal cual se grabó; solo se convirtió de OGG/Opus a MP3.
 */
export function playToasty(): void {
  try {
    const audio = new Audio(toastySound)
    audio.volume = 1
    // Si el navegador bloquea el audio, el easter egg se ve igual.
    void audio.play().catch(() => {})
  } catch {
    // Sin soporte de audio.
  }
}

/** Una nota de los sonidos de acierto y error. */
export interface Tone {
  /** Hz. */
  freq: number
  /** Segundos desde que empieza el sonido. */
  start: number
  /** Segundos. */
  duration: number
  wave: OscillatorType
}

/**
 * Acierto: dos notas que suben (la5 → mi6), cortas y brillantes.
 * Error: dos notas graves que bajan, más suaves.
 */
export const FEEDBACK_TONES: Record<'correct' | 'wrong', Tone[]> = {
  correct: [
    { freq: 880, start: 0, duration: 0.12, wave: 'sine' },
    { freq: 1318.5, start: 0.1, duration: 0.25, wave: 'sine' },
  ],
  wrong: [
    { freq: 233, start: 0, duration: 0.16, wave: 'triangle' },
    { freq: 174.6, start: 0.15, duration: 0.3, wave: 'triangle' },
  ],
}

const VOLUME = 0.2
let context: AudioContext | null = null

function audioContext(): AudioContext | null {
  if (context) return context
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  context = Ctor ? new Ctor() : null
  return context
}

/** Sonido de acierto o error en los quizzes. Se genera en el momento: no usa archivos. */
export function playFeedback(correct: boolean): void {
  try {
    const ctx = audioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
    const now = ctx.currentTime
    for (const t of FEEDBACK_TONES[correct ? 'correct' : 'wrong']) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = t.wave
      osc.frequency.value = t.freq
      const from = now + t.start
      const to = from + t.duration
      gain.gain.setValueAtTime(0.0001, from)
      gain.gain.exponentialRampToValueAtTime(VOLUME, from + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, to)
      osc.connect(gain).connect(ctx.destination)
      osc.start(from)
      osc.stop(to + 0.02)
    }
  } catch {
    // Sin soporte de audio: el quiz funciona igual.
  }
}
