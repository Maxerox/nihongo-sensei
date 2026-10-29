import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { EmptyState } from '../../atoms/EmptyState'
import { LessonTag } from '../../atoms/LessonTag'
import { KanjiReadings } from '../../molecules/KanjiReadings'
import { ScoreLine } from '../../molecules/ScoreLine'
import type { KanjiEntry, KanjiStrokesData } from '../../../shared/types/content'
import { KanjiDrawPad } from '../KanjiDrawPad'
import styles from './KanjiDrawPractice.module.scss'

export interface KanjiPracticeItem extends KanjiEntry {
  unit: number
}

export interface KanjiDrawPracticeProps {
  items: KanjiPracticeItem[]
  strokes: KanjiStrokesData
  /** Kanji con el que empezar (por ejemplo, elegido desde la lista). */
  startWith?: string
}

/**
 * Práctica de escritura: muestra el significado y las lecturas, y hay que dibujar el kanji.
 * El kanji no se muestra hasta corregir: es la respuesta.
 */
export function KanjiDrawPractice({ items, strokes, startWith }: KanjiDrawPracticeProps) {
  const startIndex = Math.max(0, items.findIndex((k) => k.kanji === startWith))
  const [index, setIndex] = useState(startIndex)
  const [solved, setSolved] = useState<Set<string>>(new Set())
  const [revealed, setRevealed] = useState(false)

  if (items.length === 0) return <EmptyState>Elegí al menos una unidad.</EmptyState>
  const i = Math.min(index, items.length - 1)
  const item = items[i]
  const go = (n: number) => {
    setIndex((n + items.length) % items.length)
    setRevealed(false)
  }

  return (
    <div className={styles.practice}>
      <ScoreLine
        items={[
          { label: 'Kanji', value: `${i + 1}/${items.length}` },
          { label: 'Bien dibujados', value: solved.size },
        ]}
      />
      <section className={styles.prompt} aria-label="Kanji para dibujar">
        <span className={styles.tag}>
          <LessonTag lesson={item.unit} kind="unit" />
        </span>
        <h2 className={styles.meaning}>{item.meaning}</h2>
        <KanjiReadings on={item.on} kun={item.kun} />
        <p className={styles.count}>{strokes[item.kanji].strokes.length} trazos</p>
        {revealed && (
          <p className={styles.answer}>
            Es <span lang="ja">{item.kanji}</span>
          </p>
        )}
      </section>
      <KanjiDrawPad
        key={item.kanji}
        kanji={item.kanji}
        data={strokes[item.kanji]}
        onChecked={(r) => {
          if (r.correct) {
            setSolved((s) => new Set(s).add(item.kanji))
            setRevealed(true)
          }
        }}
      />
      <div className={styles.nav}>
        <Button onClick={() => go(i - 1)}>← Anterior</Button>
        <Button onClick={() => setRevealed(true)} disabled={revealed}>
          Mostrar el kanji
        </Button>
        <Button variant="primary" onClick={() => go(i + 1)}>
          Siguiente →
        </Button>
      </div>
    </div>
  )
}
