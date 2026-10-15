import { useMemo, useState } from 'react'
import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { SearchInput } from '../../atoms/SearchInput'
import { VerbGroupTag } from '../../atoms/VerbGroupTag'
import type { VocabWord } from '../../../shared/types/content'
import { displayWord } from '../../../shared/utils/kanji'
import { lessonHeading } from '../../../shared/utils/lessons'
import { kanaKey, looksLikeRomaji, romajiKey } from '../../../shared/utils/romaji'
import styles from './VocabList.module.scss'

export interface VocabListProps {
  words: VocabWord[]
  showAllKanji: boolean
  known: Set<string>
}

/** Lista de vocabulario por lección, con buscador. */
export function VocabList({ words, showAllKanji, known }: VocabListProps) {
  const [query, setQuery] = useState('')
  // Clave en romaji de cada palabra, calculada una sola vez.
  const keys = useMemo(() => new Map(words.map((w) => [w.id, kanaKey(w.kana)])), [words])
  const q = query.trim().toLowerCase()
  const romaji = looksLikeRomaji(q) ? romajiKey(q) : ''
  const filtered = q
    ? words.filter(
        (w) =>
          w.kana.includes(q) ||
          (w.kanji ?? '').includes(q) ||
          w.es.toLowerCase().includes(q) ||
          (romaji !== '' && (keys.get(w.id) ?? '').includes(romaji)),
      )
    : words
  const lessons = [...new Set(filtered.map((w) => w.lesson))].sort((a, b) => a - b)

  return (
    <div className={styles.list}>
      <SearchInput
        id="vocab-search"
        label="Buscar palabras en japonés, romaji o español"
        placeholder="Buscar en japonés, romaji o español…"
        value={query}
        onChange={setQuery}
      />
      <p className={styles.count} aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'palabra' : 'palabras'}
      </p>
      {lessons.length === 0 && <EmptyState>No encontré nada con «{query}».</EmptyState>}
      {lessons.map((l) => {
        const ws = filtered.filter((w) => w.lesson === l)
        const h = lessonHeading(l)
        return (
          <section key={l} aria-labelledby={`vocab-l${l}`}>
            <h2 id={`vocab-l${l}`} className={styles.heading}>
              <JpText text={h.text} reading={h.reading} /> <span>Lección {l} · {ws.length} palabras</span>
            </h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.caption}>Vocabulario de la lección {l}</caption>
                <thead className={styles.caption}>
                  <tr>
                    <th scope="col">Imagen</th>
                    <th scope="col">Japonés</th>
                    <th scope="col">Significado</th>
                    <th scope="col">Sabida</th>
                  </tr>
                </thead>
                <tbody>
                  {ws.map((w) => {
                    const d = displayWord(w, showAllKanji)
                    return (
                      <tr key={w.id}>
                        <td className={styles.emoji} aria-hidden="true">
                          {w.emoji}
                        </td>
                        <td className={styles.word}>
                          <JpText text={d.main} reading={d.reading || undefined} />
                          {w.verbGroup && <VerbGroupTag group={w.verbGroup} />}
                        </td>
                        <td>{w.es}</td>
                        <td className={styles.known}>{known.has(w.id) ? <span aria-label="sabida">✓</span> : ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}
