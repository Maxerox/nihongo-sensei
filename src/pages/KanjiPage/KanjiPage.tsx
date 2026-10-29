import { useMemo, useState } from 'react'
import { Select } from '../../components/atoms/Select'
import { LessonPicker } from '../../components/molecules/LessonPicker'
import { SegmentedTabs, tabPanelProps } from '../../components/molecules/SegmentedTabs'
import { KanjiDeck, type KanjiDirection } from '../../components/organisms/KanjiDeck'
import { KanjiDrawPractice, type KanjiPracticeItem } from '../../components/organisms/KanjiDrawPractice'
import { KanjiList } from '../../components/organisms/KanjiList'
import { PageLayout } from '../../components/templates/PageLayout'
import kanjiBook from '../../data/kanji-book.json'
import kanjiStrokes from '../../data/kanji-strokes.json'
import { useLocalStorage } from '../../shared/hooks/useLocalStorage'
import type { KanjiBookData, KanjiStrokesData } from '../../shared/types/content'
import { STORAGE_KEYS } from '../../shared/utils/storage'
import styles from './KanjiPage.module.scss'

const book = kanjiBook as KanjiBookData
const strokes = kanjiStrokes as unknown as KanjiStrokesData
const ALL_UNITS = book.units.map((u) => u.unit)
const ALL: KanjiPracticeItem[] = book.units.flatMap((u) => u.kanji.map((k) => ({ ...k, unit: u.unit })))
type Tab = 'cards' | 'draw' | 'list'
const TABS_ID = 'kanji-vista'

export function KanjiPage() {
  const [units, setUnits] = useLocalStorage<number[]>(STORAGE_KEYS.kanjiUnits, ALL_UNITS)
  const [knownList, setKnownList] = useLocalStorage<string[]>(STORAGE_KEYS.kanjiKnown, [])
  const [direction, setDirection] = useLocalStorage<KanjiDirection>(STORAGE_KEYS.kanjiDirection, 'kanji')
  const [tab, setTab] = useState<Tab>('cards')
  const [drawStart, setDrawStart] = useState<string | undefined>()

  const known = useMemo(() => new Set(knownList), [knownList])
  const items = useMemo(() => ALL.filter((k) => units.includes(k.unit)), [units])
  const knownCount = items.filter((k) => known.has(k.kanji)).length

  const mark = (kanji: string, isKnown: boolean) =>
    setKnownList((prev) => {
      const s = new Set(prev)
      if (isKnown) s.add(kanji)
      else s.delete(kanji)
      return [...s]
    })

  return (
    <PageLayout
      header={{
        titleJa: '漢字',
        titleReading: 'かんじ',
        title: 'Kanji · unidades 1–9',
        description: 'Los kanji de las unidades 1 a 9 de 漢字マスターN5 (Kanji Master N5): lecturas, significados y trazos.',
      }}
      toolbarLabel="Opciones de kanji"
      toolbar={
        <>
          <LessonPicker
            label="Unidades"
            lessons={ALL_UNITS}
            selected={units}
            onChange={setUnits}
            describe={(u) => `Unidad ${u} · ${book.units.find((x) => x.unit === u)?.kanji.length ?? 0} kanji`}
            summary={`${items.length} kanji · ${knownCount} marcados como sabidos`}
          />
          <div className={styles.row}>
            <SegmentedTabs
              idPrefix={TABS_ID}
              label="Modo de estudio"
              tabs={[
                { id: 'cards', label: 'Tarjetas' },
                { id: 'draw', label: 'Dibujar' },
                { id: 'list', label: 'Lista' },
              ]}
              selected={tab}
              onSelect={setTab}
            />
            {tab === 'cards' && (
              <Select
                id="kanji-direccion"
                label="Tarjetas"
                value={direction}
                onChange={(v) => setDirection(v as KanjiDirection)}
                options={[
                  { value: 'kanji', label: 'kanji → lecturas y significado' },
                  { value: 'meaning', label: 'significado → kanji' },
                ]}
              />
            )}
          </div>
        </>
      }
      footnote={
        <>
          Datos de trazos de{' '}
          <a href="https://kanjivg.tagaini.net" target="_blank" rel="noreferrer">
            KanjiVG
          </a>{' '}
          (Ulrich Apel), con licencia{' '}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.es" target="_blank" rel="noreferrer">
            CC BY-SA 3.0
          </a>
          . La corrección compara cada trazo con el orden, la dirección y la forma de referencia.
        </>
      }
    >
      <div {...tabPanelProps(TABS_ID, tab)} className={styles.panel}>
        {tab === 'cards' && <KanjiDeck items={items} resetKey={units.join(',')} direction={direction} known={known} onMark={mark} />}
        {tab === 'draw' && <KanjiDrawPractice key={`${units.join(',')}|${drawStart ?? ''}`} items={items} strokes={strokes} startWith={drawStart} />}
        {tab === 'list' && (
          <KanjiList
            items={items}
            strokes={strokes}
            known={known}
            onPractice={(k) => {
              setDrawStart(k)
              setTab('draw')
              window.scrollTo(0, 0)
            }}
          />
        )}
      </div>
    </PageLayout>
  )
}
