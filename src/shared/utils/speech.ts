import { stripMarks } from './furigana'

/** Limpia el texto para que la voz no lea símbolos de notación (［］, ～, ／…). */
export function speechText(raw: string): string {
  return stripMarks(raw)
    .replace(/［[^］]*］|（[^）]*）|[～―＿]/g, '')
    .split('／')[0]
    .trim()
}

/** Lee en voz alta con la voz japonesa del navegador, si existe. Si no, no hace nada. */
export function speakJapanese(raw: string): void {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    const u = new SpeechSynthesisUtterance(speechText(raw))
    u.lang = 'ja-JP'
    u.rate = 0.85
    const voice = synth.getVoices().find((v) => v.lang?.startsWith('ja'))
    if (voice) u.voice = voice
    synth.cancel()
    synth.speak(u)
  } catch {
    // Sin voz disponible.
  }
}
