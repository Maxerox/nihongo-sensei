// Conjugación de los verbos del vocabulario (forma ます → otras formas).
// Trabaja igual sobre la escritura en kana (かきます) y en kanji (書きます): solo cambia
// la última kana de la raíz y la terminación; con 来ます cambia la lectura, no el kanji.
import type { VerbFormKey, VerbGroup } from '../types/content'

export type VerbFormId = VerbFormKey

export const VERB_FORM_IDS: VerbFormId[] = ['masen', 'mashita', 'masendeshita', 'te', 'nai', 'jisho', 'ta']

/** Fila de la raíz en grupo I (か<u>き</u>ます): u = 辞書形, a = ない形, te/ta = て形 y た形. */
const GODAN: Record<string, { u: string; a: string; te: string; ta: string }> = {
  い: { u: 'う', a: 'わ', te: 'って', ta: 'った' },
  ち: { u: 'つ', a: 'た', te: 'って', ta: 'った' },
  り: { u: 'る', a: 'ら', te: 'って', ta: 'った' },
  み: { u: 'む', a: 'ま', te: 'んで', ta: 'んだ' },
  び: { u: 'ぶ', a: 'ば', te: 'んで', ta: 'んだ' },
  に: { u: 'ぬ', a: 'な', te: 'んで', ta: 'んだ' },
  き: { u: 'く', a: 'か', te: 'いて', ta: 'いた' },
  ぎ: { u: 'ぐ', a: 'が', te: 'いで', ta: 'いだ' },
  し: { u: 'す', a: 'さ', te: 'して', ta: 'した' },
}

/** Saca la aclaración entre ［］: すいます［たばこを～］ → すいます. */
export const stripNote = (s: string): string => s.replace(/［[^］]*］/g, '').trim()

/** Lo que va entre ［］, sin el ～: ［たばこを～］ → たばこを. */
export const verbNote = (s: string): string | undefined => s.match(/［([^］]*)］/)?.[1].replace(/～/g, '').trim() || undefined

export interface VerbLike {
  kana: string
  kanji?: string
  verbGroup?: VerbGroup
}

/** 行きます (y 持って行きます) es el único de grupo I con き → って. */
const isIku = (kana: string) => kana === 'いきます' || kana.endsWith('ていきます')
/** いらっしゃいます se conjuga como いらっしゃる (grupo I en り). */
const isIrassharu = (kana: string) => kana.endsWith('いらっしゃいます')
/** 来ます y compuestos (持って来ます): grupo III en き. */
const isKuru = (kana: string, group?: VerbGroup) => group === 3 && kana.endsWith('きます') && !kana.endsWith('します')

/**
 * Conjuga una escritura (`text`, en kana o kanji) siguiendo las reglas de `kana`.
 * Devuelve null si no se puede (no termina en ます).
 */
function conjugateText(text: string, kana: string, group: VerbGroup, form: VerbFormId): string | null {
  if (!text.endsWith('ます')) return null
  const stem = text.slice(0, -2)
  switch (form) {
    case 'masen':
      return stem + 'ません'
    case 'mashita':
      return stem + 'ました'
    case 'masendeshita':
      return stem + 'ませんでした'
  }
  if (group === 2) {
    const end = { te: 'て', ta: 'た', nai: 'ない', jisho: 'る' }[form]
    return stem + end
  }
  if (group === 3) {
    const head = stem.slice(0, -1) // sin し / き / 来
    if (isKuru(kana, group)) {
      const forms = { te: 'きて', ta: 'きた', nai: 'こない', jisho: 'くる' }[form]
      // Con kanji, 来 se queda y cambia solo la lectura: 来ない (こない), 来る (くる).
      return head + (stem.endsWith('来') ? '来' + forms.slice(1) : forms)
    }
    return head + { te: 'して', ta: 'した', nai: 'しない', jisho: 'する' }[form]
  }
  // Grupo I
  const base = isIrassharu(kana) ? stem.slice(0, -1) + 'り' : stem
  const last = base.slice(-1)
  const row = GODAN[last]
  if (!row) return null
  const head = base.slice(0, -1)
  if (form === 'nai' && kana.endsWith('あります')) return head.slice(0, -1) + 'ない' // ある → ない
  if (isIku(kana) && (form === 'te' || form === 'ta')) return head + (form === 'te' ? 'って' : 'った')
  return head + { te: row.te, ta: row.ta, nai: row.a + 'ない', jisho: row.u }[form]
}

export interface Conjugated {
  /** En kana: es la respuesta. */
  kana: string
  /** Con kanji, si el verbo tiene escritura con kanji. */
  kanji?: string
}

/** Conjuga un verbo del vocabulario. Sin grupo o sin ます, devuelve null. */
export function conjugate(verb: VerbLike, form: VerbFormId): Conjugated | null {
  if (!verb.verbGroup) return null
  const kana = stripNote(verb.kana)
  const k = conjugateText(kana, kana, verb.verbGroup, form)
  if (!k) return null
  const kanjiText = verb.kanji ? stripNote(verb.kanji) : undefined
  const kj = kanjiText ? conjugateText(kanjiText, kana, verb.verbGroup, form) : null
  return kj && kj !== k ? { kana: k, kanji: kj } : { kana: k }
}

/** La regla que se aplicó, para explicar la respuesta. */
export function explain(verb: VerbLike, form: VerbFormId): string {
  const kana = stripNote(verb.kana)
  const group = verb.verbGroup
  if (form === 'masen' || form === 'mashita' || form === 'masendeshita') {
    const end = { masen: 'ません', mashita: 'ました', masendeshita: 'ませんでした' }[form]
    return `ます → ${end}.`
  }
  if (group === 2) return `Grupo II: se saca ます y se agrega ${{ te: 'て', ta: 'た', nai: 'ない', jisho: 'る' }[form]}.`
  if (group === 3) {
    if (isKuru(kana, group)) return `Grupo III (来ます): ${{ te: 'きて', ta: 'きた', nai: 'こない', jisho: 'くる' }[form]}. Ojo: en ない y る cambia la lectura (こ / く).`
    return `Grupo III (します): ${{ te: 'して', ta: 'した', nai: 'しない', jisho: 'する' }[form]}.`
  }
  const stem = kana.slice(0, -2)
  const base = isIrassharu(kana) ? stem.slice(0, -1) + 'り' : stem
  const last = base.slice(-1)
  const row = GODAN[last]
  if (!row) return ''
  if (form === 'nai' && kana.endsWith('あります')) return 'Excepción: la forma ない de あります es ない.'
  if (isIku(kana) && (form === 'te' || form === 'ta')) return `Excepción: 行きます → ${form === 'te' ? '行って' : '行った'} (no 行いて).`
  if (form === 'jisho') return `Grupo I: ${last} → ${row.u} (fila う).`
  if (form === 'nai') return `Grupo I: ${last} → ${row.a} (fila あ${last === 'い' ? '; con い es わ' : ''}) + ない.`
  const which = form === 'te' ? row.te : row.ta
  return `Grupo I: ${last}ます → ${which}.`
}

const ROWS = ['あいうえお', 'かきくけこ', 'がぎぐげご', 'さしすせそ', 'ざじずぜぞ', 'たちつてと', 'だぢづでど', 'なにぬねの', 'はひふへほ', 'ばびぶべぼ', 'ぱぴぷぺぽ', 'まみむめも', 'らりるれろ']
/** Cambia la vocal de una kana: shift('き', 2) = 'く'. */
function shift(kana: string, vowel: number): string | null {
  const row = ROWS.find((r) => r.includes(kana))
  return row ? row[vowel] : null
}

/**
 * Respuestas incorrectas creíbles, en kana: las que salen de aplicar la regla de otro grupo
 * o de otra terminación (かいて en vez de かって, みんで en vez de みて…).
 */
export function wrongForms(verb: VerbLike, form: VerbFormId): string[] {
  const right = conjugate(verb, form)?.kana
  if (!right || !verb.verbGroup) return []
  const kana = stripNote(verb.kana)
  const stem = kana.slice(0, -2)
  const head = stem.slice(0, -1)
  const last = stem.slice(-1)
  const out = new Set<string>()
  const add = (s: string | null | undefined) => {
    if (s && s !== right) out.add(s)
  }
  switch (form) {
    case 'masen':
      add(stem + 'ました')
      add(stem + 'ませんでした')
      add(stem + 'ないです')
      break
    case 'mashita':
      add(stem + 'ません')
      add(stem + 'ませんでした')
      add(stem + 'ましたか')
      break
    case 'masendeshita':
      add(stem + 'ません')
      add(stem + 'ました')
      add(stem + 'ませんでしたか')
      break
    case 'te':
    case 'ta': {
      const t = form === 'te'
      // Las otras terminaciones de grupo I y la de grupo II.
      for (const end of t ? ['って', 'んで', 'いて', 'して'] : ['った', 'んだ', 'いた', 'した']) add(head + end)
      add(stem + (t ? 'て' : 'た'))
      if (verb.verbGroup !== 1) add(GODAN[last] ? head + (t ? GODAN[last].te : GODAN[last].ta) : null)
      add(stem + (t ? 'って' : 'った'))
      break
    }
    case 'nai':
      add(stem + 'ない')
      if (GODAN[last]) add(head + GODAN[last].a + 'ない')
      add(head + shift(last, 0) + 'ない')
      add(head + 'あない')
      add(head + shift(last, 1) + 'ない')
      add(stem + 'らない')
      if (verb.verbGroup === 3) {
        add(head + 'しない')
        add(head + 'きない')
        add(head + 'くない')
      }
      break
    case 'jisho':
      add(stem + 'る')
      if (GODAN[last]) add(head + GODAN[last].u)
      add(head + shift(last, 2))
      add(stem + 'う')
      add(head + shift(last, 2) + 'る')
      if (verb.verbGroup === 3) {
        add(head + 'しる')
        add(head + 'きる')
        add(head + 'こる')
      }
      break
  }
  return [...out]
}
