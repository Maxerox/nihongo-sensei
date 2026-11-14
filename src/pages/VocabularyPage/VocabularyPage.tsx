import { useEffect, useMemo, useState } from 'react'
import { Checkbox } from '../../components/atoms/Checkbox'
import { Chip } from '../../components/atoms/Chip'
import { EmptyState } from '../../components/atoms/EmptyState'
import { ProgressBar } from '../../components/atoms/ProgressBar'
import { Select } from '../../components/atoms/Select'
import { ChoiceChips } from '../../components/molecules/ChoiceChips'
import { LessonPicker } from '../../components/molecules/LessonPicker'
import { SegmentedTabs, tabPanelProps } from '../../components/molecules/SegmentedTabs'
import type { Direction } from '../../components/organisms/Flashcard'
import { FlashcardDeck } from '../../components/organisms/FlashcardDeck'
import { VocabList } from '../../components/organisms/VocabList'
import { VocabQuiz } from '../../components/organisms/VocabQuiz'
import { PageLayout } from '../../components/templates/PageLayout'
import vocabulary from '../../data/vocabulary.json'
import { useLocalStorage, useSessionStorage } from '../../shared/hooks/useLocalStorage'
import type { VocabularyData } from '../../shared/types/content'
import { SESSION_KEYS, STORAGE_KEYS } from '../../shared/utils/storage'
import { byCategory, WORD_CATEGORIES, type CategoryFilter } from '../../shared/utils/wordCategories'
import styles from './VocabularyPage.module.scss'

const data = vocabulary as VocabularyData
type Mode = 'cards' | 'quiz' | 'list'
const TABS_ID = 'vocabulario-modo'

export function VocabularyPage() {
  const [lessons, setLessons] = useLocalStorage<number[]>(STORAGE_KEYS.vocabLessons, data.lessons)
  const [direction, setDirection] = useLocalStorage<Direction>(STORAGE_KEYS.direction, 'jp')
  const [allKanji, setAllKanji] = useLocalStorage<boolean>(STORAGE_KEYS.allKanji, false)
  const [knownList, setKnownList] = useLocalStorage<string[]>(STORAGE_KEYS.known, [])
  const [category, setCategory] = useLocalStorage<CategoryFilter>(STORAGE_KEYS.vocabCategory, 'all')
  const [hard, setHard] = useLocalStorage<boolean>(STORAGE_KEYS.vocabHard, false)
  const [mode, setMode] = useSessionStorage<Mode>(SESSION_KEYS.vocabTab, 'cards')
  const [onlyReview, setOnlyReview] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const known = useMemo(() => new Set(knownList), [knownList])
  const allInLessons = useMemo(() => data.words.filter((w) => lessons.includes(w.lesson)), [lessons])
  const inLessons = useMemo(() => byCategory(allInLessons, category), [allInLessons, category])
  const deckWords = onlyReview ? inLessons.filter((w) => !known.has(w.id)) : inLessons
  const knownCount = inLessons.filter((w) => known.has(w.id)).length
  const resetKey = `${lessons.join(',')}|${onlyReview}|${category}`
  const categoryName = WORD_CATEGORIES.find((c) => c.id === category)?.label.toLowerCase()

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
      <ChoiceChips<CategoryFilter>
        label="Tipo de palabra"
        value={category}
        onChange={setCategory}
        options={[
          { value: 'all', label: 'Todas', count: allInLessons.length },
          ...WORD_CATEGORIES.map((c) => ({ value: c.id, label: c.label, count: byCategory(allInLessons, c.id).length })),
        ]}
      />
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
        {mode === 'quiz' && (
          <Select
            id="vocabulario-dificultad"
            label="Quiz"
            value={hard ? 'hard' : 'normal'}
            onChange={(v) => setHard(v === 'hard')}
            options={[
              { value: 'normal', label: 'normal' },
              { value: 'hard', label: 'difícil · opciones del mismo tipo' },
            ]}
          />
        )}
      </div>
      <div className={styles.row}>
        <Checkbox id="vocabulario-faltan" label="Solo las que me faltan" checked={onlyReview} onChange={setOnlyReview} />
        <Checkbox id="vocabulario-kanji" label="Mostrar todos los kanji" checked={allKanji} onChange={setAllKanji} />
      </div>
      <div className={styles.progress}>
        <div className={styles.row}>
          <p className={styles.stats}>
            Ya sabés <b>{knownCount}</b> de <b>{inLessons.length}</b> {category === 'all' ? 'palabras' : categoryName}
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
      footnote="Vocabulario basado en la 2.ª edición del libro principal. El botón 🔊 usa la voz japonesa de tu navegador, si la tiene. Las palabras sabidas se guardan en este navegador; la ronda del quiz y la tarjeta en la que vas, hasta que cierres la pestaña."
    >
      <div {...tabPanelProps(TABS_ID, mode)} className={styles.panel}>
        {lessons.length === 0 ? (
          <EmptyState>Elegí al menos una lección.</EmptyState>
        ) : inLessons.length === 0 ? (
          <EmptyState>No hay {categoryName} en estas lecciones. Elegí otro tipo de palabra o más lecciones.</EmptyState>
        ) : mode === 'cards' ? (
          <FlashcardDeck
            words={deckWords}
            resetKey={resetKey}
            direction={direction}
            showAllKanji={allKanji}
            known={known}
            onMark={markWord}
            emptyMessage={onlyReview ? '¡Ya marcaste todas como sabidas en estas lecciones! 🎉' : 'No hay palabras.'}
            storageKey={SESSION_KEYS.vocabDeck}
          />
        ) : mode === 'quiz' ? (
          <VocabQuiz
            key={`${resetKey}|${direction}|${hard}`}
            words={inLessons}
            direction={direction}
            showAllKanji={allKanji}
            hard={hard}
            fallback={data.words}
            storageKey={SESSION_KEYS.vocabQuiz}
          />
        ) : (
          <VocabList words={inLessons} showAllKanji={allKanji} known={known} />
        )}
      </div>
    </PageLayout>
  )
}
