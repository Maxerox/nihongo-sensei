import type { Counter } from '../types/content'

/** "Forma ingenua" número + contador, sin cambios de sonido (よん + じ = よんじ). */
export function naiveReading(numberBase: readonly string[], n: number, suffix: string): string {
  return numberBase[n - 1] + suffix
}

/** Número del 1 al 99 armado "a mano": 14 → じゅうよん, 24 → にじゅうよん. */
export function naiveNumber(numberBase: readonly string[], n: number): string {
  const tens = Math.floor(n / 10)
  const units = n % 10
  const t = tens ? (tens > 1 ? numberBase[tens - 1] : '') + 'じゅう' : ''
  return t + (units ? numberBase[units - 1] : '')
}

/** Día del mes armado "a mano": 14 → じゅうよんにち. */
export function naiveDay(numberBase: readonly string[], n: number): string {
  return naiveNumber(numberBase, n) + 'にち'
}

/** Mes armado "a mano": 4 → よんがつ. */
export function naiveMonth(numberBase: readonly string[], n: number): string {
  return (n <= 10 ? numberBase[n - 1] : 'じゅう' + numberBase[n - 11]) + 'がつ'
}

/** Una lectura es irregular si no coincide con ninguna de sus variantes ingenuas. */
export const isIrregular = (reading: string, naive: string): boolean => !reading.split('／').includes(naive)

/** Cómo se escribe el número con su contador (10 de ～つ es solo "10"; 2日(間)). */
export const counterDisplay = (counter: Counter, n: number): string =>
  counter.label === 'つ' && n === 10 ? '10' : `${n}${counter.label}${counter.optionalSuffix ? `(${counter.optionalSuffix.text})` : ''}`

export interface CounterItem {
  n: number
  label: string
  /** Todas las variantes, separadas por ／ (es la respuesta en la práctica). */
  reading: string
  /** Cómo se muestra: ふつか／ふつかかん → ふつか（かん）. */
  display: string
  /** Lo que se escucha al tocarla: la primera variante. */
  speak: string
  irregular: boolean
}

/** Junta "X／X + sufijo" en "X（sufijo）": ふつか／ふつかかん → ふつか（かん）. */
export function compactOptional(reading: string, suffixReading?: string): string {
  if (!suffixReading) return reading
  const [a, b] = reading.split('／')
  return b === a + suffixReading ? `${a}（${suffixReading}）` : reading
}

/** Lecturas de un contador: del 1 al 10 y las extra (14日, 20日…), con las irregulares marcadas. */
export function counterItems(counter: Counter, numberBase: readonly string[]): CounterItem[] {
  const all = [...counter.readings.map((reading, i) => ({ n: i + 1, reading })), ...(counter.extra ?? [])]
  return all.map(({ n, reading }) => ({
    n,
    label: counterDisplay(counter, n),
    reading,
    display: compactOptional(reading, counter.optionalSuffix?.reading),
    speak: reading.split('／')[0],
    // Es irregular si ninguna variante es "número ＋ contador" (ににち).
    irregular: counter.reading !== null && isIrregular(reading, naiveNumber(numberBase, n) + counter.reading),
  }))
}

/** Lectura del contador para mostrar como furigana (か月 → かげつ). */
export const counterLabelReading = (counter: Counter): string | null =>
  counter.label === 'か月' ? 'かげつ' : counter.reading
