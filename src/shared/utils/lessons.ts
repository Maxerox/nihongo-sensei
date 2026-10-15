/** Título japonés de una lección con su lectura: 5 → 第5課 (だいごか). */
export function lessonHeading(n: number): { text: string; reading: string } {
  const units = ['いっ', 'に', 'さん', 'よん', 'ご', 'ろっ', 'なな', 'はっ', 'きゅう', 'じゅっ']
  let reading: string
  if (n === 10) reading = 'じゅっ'
  else if (n < 10) reading = units[n - 1]
  else reading = 'じゅう' + (n % 10 ? units[(n % 10) - 1] : '')
  return { text: `第${n}課`, reading: `だい${reading}か` }
}

/** Lecciones del 1 al `max`. */
export const lessonRange = (max = 19): number[] => Array.from({ length: max }, (_, i) => i + 1)

/** Ids de anclas usados en las páginas. */
export const lessonAnchor = (n: number) => `leccion-${n}`
