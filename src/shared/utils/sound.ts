import toastySound from '../../assets/toasty.mp3'

/** Grito del easter egg "Toasty!" (grabación propia, en src/assets/toasty.mp3). */
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
