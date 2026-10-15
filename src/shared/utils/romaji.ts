// Búsqueda en romaji: convierte kana a una forma "canónica" en letras latinas
// y normaliza lo que escribe la persona a esa misma forma, así coinciden
// aunque se use Hepburn o Kunrei, vocales largas o no, ん como n o m, etc.

const KANA: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'si', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'ti', つ: 'tu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'hu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'i', ゑ: 'e', を: 'wo', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'zi', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'zi', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o', ゔ: 'bu',
}

const SMALL_Y: Record<string, string> = { ゃ: 'a', ゅ: 'u', ょ: 'o' }
// ファ, フィ… → ha, hi… (igual que "fa" → "ha" del lado de la búsqueda)
const SMALL_VOWEL: Record<string, string> = { ぁ: 'a', ぃ: 'i', ぇ: 'e', ぉ: 'o' }

/** Katakana → hiragana (ー queda igual). */
export function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
}

/** Pasos finales que se aplican igual a los dos lados. */
function collapse(s: string): string {
  return s
    .replace(/nn/g, 'n')
    .replace(/wo/g, 'o')
    .replace(/wa/g, 'ha')
    .replace(/ou|oo/g, 'o')
    .replace(/uu/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/ii/g, 'i')
    .replace(/ee/g, 'e')
}

/** Kana (hiragana o katakana) → forma canónica para comparar. Ignora lo que no es kana. */
export function kanaKey(text: string): string {
  const chars = [...toHiragana(text)]
  let out = ''
  let doubleNext = false
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    const next = chars[i + 1]
    if (c === 'っ') {
      doubleNext = true
      continue
    }
    if (c === 'ー') {
      const vowel = out.match(/[aeiou](?=[^aeiou]*$)/)?.[0]
      if (vowel) out += vowel
      continue
    }
    let r = KANA[c]
    if (r === undefined) continue
    if (next && SMALL_Y[next] && r.endsWith('i') && r.length > 1) {
      r = r.slice(0, -1) + 'y' + SMALL_Y[next]
      i++
    } else if (next && SMALL_VOWEL[next] && r === 'hu') {
      r = 'h' + SMALL_VOWEL[next]
      i++
    }
    if (doubleNext) {
      r = r[0] + r
      doubleNext = false
    }
    out += r
  }
  return collapse(out)
}

/** Lo que escribe la persona en romaji → misma forma canónica. */
export function romajiKey(query: string): string {
  const s = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // ō → o, â → a
    .replace(/[^a-z]/g, '')
    .replace(/shi/g, 'si')
    .replace(/chi/g, 'ti')
    .replace(/tsu/g, 'tu')
    .replace(/fu/g, 'hu')
    .replace(/f/g, 'h')
    .replace(/ji/g, 'zi')
    .replace(/j/g, 'zy')
    .replace(/sh/g, 'sy')
    .replace(/ch/g, 'ty')
    .replace(/dz?u/g, 'zu')
    .replace(/di/g, 'zi')
    .replace(/m(?=[bpm])/g, 'n')
    .replace(/n'/g, 'n')
  return collapse(s)
}

/** ¿El texto parece romaji? (letras latinas y nada de kana). */
export const looksLikeRomaji = (query: string): boolean => /[a-zA-Z]/.test(query) && !/[぀-ヿ一-鿿]/.test(query)
