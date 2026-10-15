/**
 * Grito del easter egg: la voz del navegador dice "Toasty!" aguda y rápida,
 * al estilo del cameo de Mortal Kombat (sin usar el audio original).
 */
export function playToasty(): void {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    const u = new SpeechSynthesisUtterance('Toasty!')
    u.lang = 'en-US'
    u.pitch = 2
    u.rate = 1.35
    u.volume = 1
    const voice = synth.getVoices().find((v) => v.lang?.startsWith('en'))
    if (voice) u.voice = voice
    synth.cancel()
    synth.speak(u)
  } catch {
    // Sin voz disponible: el easter egg se ve igual.
  }
}
