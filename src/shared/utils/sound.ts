import toastySound from '../../assets/toasty.mp3'

/**
 * Grito del easter egg "Toasty!" (grabación propia, en src/assets/toasty.mp3).
 * La "i" final está estirada para que dure lo mismo que la cara en pantalla (~2,3 s).
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
