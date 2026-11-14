// El almacenamiento puede fallar (ventana privada, datos bloqueados): todo va en try/catch.
//
// - localStorage ('local'): lo que se guarda para siempre (palabras sabidas, lecciones elegidas…).
// - sessionStorage ('session'): lo que se está haciendo ahora (la ronda de un quiz, la tarjeta
//   del mazo, la pestaña abierta). Sobrevive a recargar la página y se borra al cerrar la pestaña.

export type StorageKind = 'local' | 'session'

const area = (kind: StorageKind) => (kind === 'session' ? window.sessionStorage : window.localStorage)

export function readStorage<T>(key: string, fallback: T, kind: StorageKind = 'local'): T {
  try {
    const raw = area(kind).getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T, kind: StorageKind = 'local'): void {
  try {
    area(kind).setItem(key, JSON.stringify(value))
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
  kanjiUnits: 'mn_kanji_units',
  kanjiKnown: 'mn_kanji_known',
  kanjiDirection: 'mn_kanji_dir',
  kanjiQuizMode: 'mn_kanji_quiz',
  quizSound: 'mn_sound',
  vocabCategory: 'mn_vocab_cat',
  vocabHard: 'mn_vocab_hard',
} as const

/** Claves de sessionStorage: el progreso de lo que se está practicando ahora. */
export const SESSION_KEYS = {
  vocabTab: 'mn_s_vocab_tab',
  vocabDeck: 'mn_s_vocab_deck',
  vocabQuiz: 'mn_s_vocab_quiz',
  kanjiTab: 'mn_s_kanji_tab',
  kanjiDeck: 'mn_s_kanji_deck',
  kanjiQuiz: 'mn_s_kanji_quiz',
  particlesTab: 'mn_s_particles_tab',
  particlesQuiz: 'mn_s_particles_quiz',
  countersTab: 'mn_s_counters_tab',
  countersMix: 'mn_s_counters_mix',
  countersQuiz: 'mn_s_counters_quiz',
} as const
