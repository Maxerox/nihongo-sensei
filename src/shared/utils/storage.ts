// localStorage puede fallar (ventana privada, datos bloqueados): todo va en try/catch.

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Sin almacenamiento la app sigue funcionando; solo no recuerda.
  }
}

/** Claves en uso. No renombrar: el progreso guardado depende de ellas. */
export const STORAGE_KEYS = {
  known: 'mn_known',
  vocabLessons: 'mn_lessons',
  direction: 'mn_dir',
  allKanji: 'mn_allk',
  particleLessons: 'mn_plessons',
} as const
