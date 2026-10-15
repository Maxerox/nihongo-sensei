import type { Counter } from '../types/content'

/** "Forma ingenua" número + contador, sin cambios de sonido (よん + じ = よんじ). */
export function naiveReading(numberBase: readonly string[], n: number, suffix: string): string {
  return numberBase[n - 1] + suffix
}

/** Día del mes armado "a mano": 14 → じゅうよんにち. */
export function naiveDay(numberBase: readonly string[], n: number): string {
  const tens = Math.floor(n / 10)
  const units = n % 10
  const t = tens ? (tens > 1 ? numberBase[tens - 1] : '') + 'じゅう' : ''
  return t + (units ? numberBase[units - 1] : '') + 'にち'
}

/** Mes armado "a mano": 4 → よんがつ. */
export function naiveMonth(numberBase: readonly string[], n: number): string {
  return (n <= 10 ? numberBase[n - 1] : 'じゅう' + numberBase[n - 11]) + 'がつ'
}

/** Una lectura es irregular si no coincide con ninguna de sus variantes ingenuas. */
export const isIrregular = (reading: string, naive: string): boolean => !reading.split('／').includes(naive)

/** Cómo se escribe el número con su contador (10 de ～つ es solo "10"). */
export const counterDisplay = (counter: Counter, n: number): string =>
  counter.label === 'つ' && n === 10 ? '10' : `${n}${counter.label}`

/** Lectura del contador para mostrar como furigana (か月 → かげつ). */
export const counterLabelReading = (counter: Counter): string | null =>
  counter.label === 'か月' ? 'かげつ' : counter.reading
