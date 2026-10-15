import { useEffect, useMemo, useState } from 'react'
import { Checkbox } from '../../components/atoms/Checkbox'
import { Chip } from '../../components/atoms/Chip'
import { EmptyState } from '../../components/atoms/EmptyState'
import { ProgressBar } from '../../components/atoms/ProgressBar'
import { Select } from '../../components/atoms/Select'
import { LessonPicker } from '../../components/molecules/LessonPicker'
import { SegmentedTabs, tabPanelProps } from '../../components/molecules/SegmentedTabs'
import type { Direction } from '../../components/organisms/Flashcard'
import { FlashcardDeck } from '../../components/organisms/FlashcardDeck'
import { VocabList } from '../../components/organisms/VocabList'
import { VocabQuiz } from '../../components/organisms/VocabQuiz'
import { PageLayout } from '../../components/templates/PageLayout'
import vocabulary from '../../data/vocabulary.json'
import { useLocalStorage } from '../../shared/hooks/useLocalStorage'
import type { VocabularyData } from '../../shared/types/content'
import { STORAGE_KEYS } from '../../shared/utils/storage'
import styles from './VocabularyPage.module.scss'

const data = vocabulary as VocabularyData
type Mode = 'cards' | 'quiz' | 'list'
const TABS_ID = 'vocabulario-modo'

export function VocabularyPage() {
  const [lessons, setLessons] = useLocalStorage<number[]>(STORAGE_KEYS.vocabLessons, data.lessons)
  const [direction, setDirection] = useLocalStorage<Direction>(STORAGE_KEYS.direction, 'jp')
  const [allKanji, setAllKanji] = useLocalStorage<boolean>(STORAGE_KEYS.allKanji, false)
  const [knownList, setKnownList] = useLocalStorage<string[]>(STORAGE_KEYS.known, [])
  const [mode, setMode] = useState<Mode>('cards')
  const [onlyReview, setOnlyReview] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const known = useMemo(() => new Set(knownList), [knownList])
  const inLessons = useMemo(() => data.words.filter((w) => lessons.includes(w.lesson)), [lessons])
  const deckWords = onlyReview ? inLessons.filter((w) => !known.has(w.id)) : inLessons
  const knownCount = inLessons.filter((w) => known.has(w.id)).length
  const resetKey = `${lessons.join(',')}|${onlyReview}`

  useEffect(() => {
    if (!confirmReset) return
    const t = window.setTimeout(() => setConfirmReset(false), 3000)
    return () => window.clearTimeout(t)
  }, [confirmReset])

  const markWord = (id: string, isKnown: boolean) =>
    setKnownList((prev) => {
      const s = new Set(prev)
      if (isKnown) s.add(id)
      else s.delete(id)
      return [...s]
    })

  const toolbar = (
    <>
      <LessonPicker label="Lecciones" lessons={data.lessons} selected={lessons} onChange={setLessons} />
      <div className={styles.row}>
        <SegmentedTabs
          idPrefix={TABS_ID}
          label="Modo de estudio"
          tabs={[
            { id: 'cards', label: 'Tarjetas' },
            { id: 'quiz', label: 'Quiz' },
            { id: 'list', label: 'Lista' },
          ]}
          selected={mode}
          onSelect={setMode}
        />
        <Select
          id="vocabulario-direccion"
          label="Dirección"
          value={direction}
          onChange={(v) => setDirection(v as Direction)}
          options={[
            { value: 'jp', label: 'japonés → español' },
            { value: 'es', label: 'español → japonés' },
          ]}
        />
      </div>
      <div className={styles.row}>
        <Checkbox id="vocabulario-faltan" label="Solo las que me faltan" checked={onlyReview} onChange={setOnlyReview} />
        <Checkbox id="vocabulario-kanji" label="Mostrar todos los kanji" checked={allKanji} onChange={setAllKanji} />
      </div>
      <div className={styles.progress}>
        <div className={styles.row}>
          <p className={styles.stats}>
            <b>{knownCount}</b> de <b>{inLessons.length}</b> palabras marcadas como sabidas
          </p>
          <Chip
            className={styles.reset}
            onClick={() => {
              if (confirmReset) {
                setKnownList([])
                setConfirmReset(false)
              } else setConfirmReset(true)
            }}
          >
            {confirmReset ? '¿Seguro? Tocá de nuevo' : 'Reiniciar progreso'}
          </Chip>
        </div>
        <ProgressBar value={knownCount} max={inLessons.length} label="Palabras sabidas" />
      </div>
    </>
  )

  return (
    <PageLayout
      header={{
        titleJa: '単語',
        titleReading: 'たんご',
        title: 'Vocabulario · lecciones 1–19',
        description: 'Los kanji aparecen solo si están entre los que viste hasta la unidad 8 del libro de kanji. El resto va en kana.',
      }}
      toolbar={toolbar}
      toolbarLabel="Opciones de vocabulario"
      footnote="Vocabulario basado en la 2.ª edición del libro principal. El botón 🔊 usa la voz japonesa de tu navegador, si la tiene. Tu progreso se guarda en este navegador."
    >
      <div {...tabPanelProps(TABS_ID, mode)} className={styles.panel}>
        {lessons.length === 0 ? (
          <EmptyState>Elegí al menos una lección.</EmptyState>
        ) : mode === 'cards' ? (
          <FlashcardDeck
            words={deckWords}
            resetKey={resetKey}
            direction={direction}
            showAllKanji={allKanji}
            known={known}
            onMark={markWord}
            emptyMessage={onlyReview ? '¡Ya marcaste todas como sabidas en estas lecciones! 🎉' : 'No hay palabras.'}
          />
        ) : mode === 'quiz' ? (
          <VocabQuiz key={`${resetKey}|${direction}`} words={inLessons} direction={direction} showAllKanji={allKanji} />
        ) : (
          <VocabList words={inLessons} showAllKanji={allKanji} known={known} />
        )}
      </div>
    </PageLayout>
  )
}
