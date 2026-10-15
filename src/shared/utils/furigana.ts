import countersData from '../../data/counters.json'
import kanjiData from '../../data/kanji.json'
import type { CountersData, KanjiData } from '../types/content'
import { isKanji } from './kanji'

const kanji = kanjiData as KanjiData
const counters = countersData as CountersData

/** Un pedazo de texto. Si tiene `reading`, se muestra con furigana. */
export interface FuriganaSegment {
  text: string
  reading?: string
  /** Parte resaltada con [[...]]. */
  mark?: boolean
}

const KATAKANA = /[゠-ヿ]/

/** Lecturas que dependen de lo que hay antes o después. */
type ContextRule = (prev: string, next: string) => string
const CONTEXT_RULES: Record<string, ContextRule> = {
  // インドネシア人 → じん · 何人／～人 → にん · あの人 → ひと
  人: (prev) => (KATAKANA.test(prev.slice(-1)) ? 'じん' : /[何～]$/.test(prev) ? 'にん' : 'ひと'),
  // 来ない → こ · 来る → く · 来ます／来て／来た → き
  来: (_prev, next) => (next.startsWith('な') ? 'こ' : next.startsWith('る') ? 'く' : 'き'),
  // 何ですか／何人／何時 → なん · 何を／何か／何も → なに
  何: (_prev, next) =>
    /^(か[い月]|かげ)/.test(next) ||
    /^[でのさまじ時人年分日月週ぷ]/.test(next) ||
    /^(にち|がつ|がい|ばん|よう)/.test(next)
      ? 'なん'
      : 'なに',
  // 日よう日 → にち…び
  日: (prev) => (prev.endsWith('よう') ? 'び' : 'にち'),
  // か月／月よう日 → げつ · 4月 → がつ
  月: (prev, next) => (prev.endsWith('か') || next.startsWith('よう') ? 'げつ' : 'がつ'),
}

const DICTIONARY_KEYS = [...Object.keys(kanji.furiganaDictionary), ...Object.keys(CONTEXT_RULES)].sort(
  (a, b) => b.length - a.length,
)

const NUMBER_COUNTER_RE = /^([0-9][0-9,]*)(時間|週間|か月|人|日|月|時|分|円|年)/

/** Lectura de "número + contador" (4時 → よじ, 25日 → にじゅうごにち). */
export function readNumber(num: string, counter: string): string | null {
  const exception = kanji.numberExceptions[num + counter]
  if (exception) return exception
  const n = Number(num.replace(/,/g, ''))
  if (counter === '日') return counters.days[n - 1] ?? null
  if (counter === '月') return counters.months[n - 1] ?? null
  const table = counters.counters.find((c) => c.label === counter)
  if (table && n >= 1 && n <= 10) return table.readings[n - 1].split('／')[0]
  if (counter === '時' && (n === 11 || n === 12)) return n === 11 ? 'じゅういちじ' : 'じゅうにじ'
  return null
}

/** Separa un texto plano en segmentos con su lectura. */
export function toFurigana(text: string): FuriganaSegment[] {
  const out: FuriganaSegment[] = []
  const pushPlain = (s: string) => {
    const last = out[out.length - 1]
    if (last && last.reading === undefined) last.text += s
    else out.push({ text: s })
  }
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (/[0-9]/.test(ch) && (i === 0 || !/[0-9,]/.test(text[i - 1]))) {
      const m = text.slice(i).match(NUMBER_COUNTER_RE)
      const reading = m ? readNumber(m[1], m[2]) : null
      if (m && reading) {
        out.push({ text: m[0], reading })
        i += m[0].length
        continue
      }
    }
    if (isKanji(ch)) {
      const key = DICTIONARY_KEYS.find((k) => text.startsWith(k, i))
      if (key) {
        const rule = CONTEXT_RULES[key]
        const reading = rule
          ? rule(text.slice(Math.max(0, i - 3), i), text.slice(i + key.length, i + key.length + 3))
          : kanji.furiganaDictionary[key]
        out.push({ text: key, reading })
        i += key.length
        continue
      }
    }
    pushPlain(ch)
    i++
  }
  return out
}

/**
 * Como `toFurigana`, pero entiende las marcas `[[...]]` de los ejemplos.
 * Las lecturas se calculan sobre el texto sin marcas, así el contexto no se corta.
 */
export function toMarkedFurigana(raw: string): FuriganaSegment[] {
  const ranges: Array<[number, number]> = []
  let plain = ''
  const re = /\[\[(.+?)\]\]/g
  let last = 0
  for (const m of raw.matchAll(re)) {
    plain += raw.slice(last, m.index)
    ranges.push([plain.length, plain.length + m[1].length])
    plain += m[1]
    last = (m.index ?? 0) + m[0].length
  }
  plain += raw.slice(last)
  if (ranges.length === 0) return toFurigana(plain)

  const inMark = (pos: number) => ranges.some(([a, b]) => pos >= a && pos < b)
  const out: FuriganaSegment[] = []
  let pos = 0
  for (const seg of toFurigana(plain)) {
    if (seg.reading !== undefined) {
      out.push({ ...seg, mark: inMark(pos) })
    } else {
      // Un tramo de kana puede empezar fuera de la marca y terminar adentro.
      for (const ch of seg.text) {
        const mark = inMark(pos)
        const prev = out[out.length - 1]
        if (prev && prev.reading === undefined && Boolean(prev.mark) === mark) prev.text += ch
        else out.push({ text: ch, mark })
        pos++
      }
      continue
    }
    pos += seg.text.length
  }
  return out
}

/** Texto sin marcas, para leer en voz alta. */
export const stripMarks = (raw: string): string => raw.replace(/\[\[|\]\]/g, '')
