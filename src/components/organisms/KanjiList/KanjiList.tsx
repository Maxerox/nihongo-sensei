import { Button } from '../../atoms/Button'
import { JpText } from '../../atoms/JpText'
import { KanjiReadings } from '../../molecules/KanjiReadings'
import type { KanjiStrokesData } from '../../../shared/types/content'
import type { KanjiPracticeItem } from '../KanjiDrawPractice'
import styles from './KanjiList.module.scss'

export interface KanjiListProps {
  items: KanjiPracticeItem[]
  strokes: KanjiStrokesData
  known: Set<string>
  onPractice: (kanji: string) => void
}

/** Todos los kanji elegidos, por unidad, con lecturas, ejemplos y acceso a practicar los trazos. */
export function KanjiList({ items, strokes, known, onPractice }: KanjiListProps) {
  const units = [...new Set(items.map((k) => k.unit))]
  return (
    <div className={styles.list}>
      {units.map((u) => (
        <section key={u} aria-labelledby={`kanji-unidad-${u}`}>
          <h2 id={`kanji-unidad-${u}`} className={styles.heading}>
            Unidad {u}
          </h2>
          <ul className={styles.grid}>
            {items
              .filter((k) => k.unit === u)
              .map((k) => (
                <li key={k.kanji} className={styles.card}>
                  <div className={styles.head}>
                    <span lang="ja" className={styles.kanji}>
                      {k.kanji}
                    </span>
                    <div>
                      <h3 className={styles.meaning}>{k.meaning}</h3>
                      <p className={styles.meta}>
                        {strokes[k.kanji].strokes.length} trazos{known.has(k.kanji) ? ' · ✓ sabido' : ''}
                      </p>
                    </div>
                  </div>
                  <KanjiReadings on={k.on} kun={k.kun} compact />
                  <ul className={styles.examples} aria-label="Ejemplos">
                    {k.examples.map((e) => (
                      <li key={e.word}>
                        <JpText text={e.word} reading={e.reading} className={styles.word} /> <span>{e.es}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" onClick={() => onPractice(k.kanji)} aria-label={`Practicar los trazos de ${k.kanji} (${k.meaning})`}>
                    ✍️ Practicar trazos
                  </Button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
