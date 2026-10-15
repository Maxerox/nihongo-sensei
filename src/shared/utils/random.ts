/** Devuelve una copia mezclada (Fisher–Yates). No modifica el original. */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Un elemento al azar. */
export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Arma 4 opciones de respuesta: la correcta, el "distractor" principal (si hay)
 * y el resto tomados de `others`, sin repetir ni incluir variantes de la correcta.
 */
export function buildOptions(answer: string, main: string | null, others: readonly string[], total = 4): string[] {
  const variants = answer.split('／')
  const set = [answer]
  const add = (x: string | null) => {
    if (x && !set.includes(x) && !variants.includes(x)) set.push(x)
  }
  add(main)
  for (const o of shuffle(others)) {
    if (set.length >= total) break
    add(o)
  }
  return shuffle(set)
}
