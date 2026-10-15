import { useState } from 'react'
import { EmptyState } from '../../components/atoms/EmptyState'
import { SearchInput } from '../../components/atoms/SearchInput'
import { JumpNav } from '../../components/molecules/JumpNav'
import { GrammarLessonSection } from '../../components/organisms/GrammarLessonSection'
import { PageLayout } from '../../components/templates/PageLayout'
import grammar from '../../data/grammar.json'
import type { GrammarData, GrammarPoint } from '../../shared/types/content'
import { stripMarks } from '../../shared/utils/furigana'
import { lessonAnchor } from '../../shared/utils/lessons'
import styles from './GrammarPage.module.scss'

const data = grammar as GrammarData

const searchableText = (p: GrammarPoint) =>
  stripMarks([p.pattern, p.description, ...(p.examples ?? []).flatMap((e) => [e.ja, e.es]), ...(p.table?.rows.flat() ?? [])].join(' ')).toLowerCase()

export function GrammarPage() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const lessons = data.lessons
    .map((l) => ({ lesson: l, points: q ? l.points.filter((p) => searchableText(p).includes(q)) : l.points }))
    .filter((x) => x.points.length > 0)
  const total = lessons.reduce((n, x) => n + x.points.length, 0)

  return (
    <PageLayout
      header={{
        titleJa: '文法',
        titleReading: 'ぶんぽう',
        title: 'Gramática · lecciones 1–19',
        description: 'Los puntos de gramática de cada lección, con ejemplos. En los ejemplos, la parte resaltada es la estructura.',
      }}
      toolbarLabel="Buscar y navegar"
      toolbar={
        <>
          <SearchInput id="gramatica-buscar" label="Buscar en gramática" placeholder="Buscar: ている, permiso, より…" value={query} onChange={setQuery} />
          {q && (
            <p className={styles.count} aria-live="polite">
              {total} {total === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
          <span className={styles.label} id="gramatica-ir">
            Ir a la lección
          </span>
          <JumpNav
            label="Ir a la lección"
            items={data.lessons.map((l) => ({ targetId: lessonAnchor(l.lesson), text: String(l.lesson), label: `Lección ${l.lesson}: ${l.title}` }))}
            onJump={() => setQuery('')}
          />
        </>
      }
      footnote="Resumen basado en la 2.ª edición del libro principal. Los ejemplos usan solo kanji de las unidades 1–8."
    >
      <div className={styles.list}>
        {lessons.length === 0 && <EmptyState>No encontré nada con «{query}».</EmptyState>}
        {lessons.map(({ lesson, points }) => (
          <GrammarLessonSection key={lesson.lesson} lesson={lesson} points={points} />
        ))}
      </div>
    </PageLayout>
  )
}
