// Tipos de los archivos de src/data/*.json. Si cambia un JSON, se actualiza acá.

export interface Example {
  /** Japonés. `[[...]]` marca la parte que se resalta. */
  ja: string
  es: string
}

// vocabulary.json
export interface VocabWord {
  /** "lección:índice:kana". No cambiar: el progreso guardado depende de este id. */
  id: string
  lesson: number
  kana: string
  /** Forma con kanji del libro, si tiene. */
  kanji?: string
  es: string
  emoji?: string
  /** Grupo del verbo (I, II o III). Solo en los verbos en forma ます. */
  verbGroup?: VerbGroup
}
export type VerbGroup = 1 | 2 | 3
export interface VocabularyData {
  lessons: number[]
  words: VocabWord[]
}

// grammar.json
export interface GrammarTable {
  head: string[]
  rows: string[][]
}
export interface GrammarPoint {
  pattern: string
  description: string
  examples?: Example[]
  table?: GrammarTable
}
export interface GrammarLesson {
  lesson: number
  title: string
  points: GrammarPoint[]
}
export interface GrammarData {
  lessons: GrammarLesson[]
}

// particles.json
export interface ParticleUse {
  description: string
  example: Example
  lesson: number
}
export interface Particle {
  particle: string
  romaji: string
  role: string
  note?: string
  uses: ParticleUse[]
}
export interface ParticlePair {
  a: string
  b: string
  description: string
  exampleA: Example
  exampleB: Example
}
export interface ParticleExercise {
  /** Oración con ＿ donde va la partícula. */
  sentence: string
  answer: string
  options: string[]
  explanation: string
  lesson: number
}
export interface ParticlesData {
  particles: Particle[]
  pairs: ParticlePair[]
  practice: ParticleExercise[]
}

// counters.json
export interface Counter {
  id: string
  /** Cómo se escribe detrás del número (人, だい, 時間…). */
  label: string
  /** Lectura base del contador, o null para ～つ (números japoneses). */
  reading: string | null
  meaning: string
  emoji: string
  lesson: number
  /** Cómo se pregunta (なんにん, いくつ…). */
  question: string
  note?: string
  /** Lecturas del 1 al 10. Las variantes van separadas por ／. */
  readings: string[]
}
export interface Weekday {
  kanji: string
  reading: string
  es: string
}
export interface CountersData {
  numberBase: string[]
  counters: Counter[]
  days: string[]
  months: string[]
  weekdays: Weekday[]
}

// kanji.json
export interface KanjiData {
  /** Kanji de las unidades 1–8 del libro de kanji, en un solo string. */
  allowedKanji: string
  /** Lecturas fijas. Las que dependen del contexto están en furigana.ts. */
  furiganaDictionary: Record<string, string>
  /** Números con contador que no se pueden armar con las tablas (600円…). */
  numberExceptions: Record<string, string>
}
