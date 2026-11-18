import { useMemo } from 'react'
import { Select } from '../../components/atoms/Select'
import { LessonPicker } from '../../components/molecules/LessonPicker'
import { SegmentedTabs, tabPanelProps } from '../../components/molecules/SegmentedTabs'
import { ToggleChips } from '../../components/molecules/ToggleChips'
import { VerbPractice, type VerbPracticeMode } from '../../components/organisms/VerbPractice'
import { VerbRules } from '../../components/organisms/VerbRules'
import { VerbTable } from '../../components/organisms/VerbTable'
import { PageLayout } from '../../components/templates/PageLayout'
import verbForms from '../../data/verb-forms.json'
import vocabulary from '../../data/vocabulary.json'
import { useLocalStorage, useSessionStorage } from '../../shared/hooks/useLocalStorage'
import type { VerbFormKey, VerbFormsData, VocabularyData } from '../../shared/types/content'
import { SESSION_KEYS, STORAGE_KEYS } from '../../shared/utils/storage'
import { practiceVerbs } from '../../shared/utils/verbs'
import styles from './VerbsPage.module.scss'

const forms = verbForms as VerbFormsData
const ALL_VERBS = practiceVerbs((vocabulary as VocabularyData).words)
const VERB_LESSONS = [...new Set(ALL_VERBS.map((v) => v.lesson))].sort((a, b) => a - b)
type Tab = 'practice' | 'rules' | 'table'
type GroupKey = '1' | '2' | '3'
const TABS_ID = 'verbos-vista'
const DEFAULT_FORMS: VerbFormKey[] = ['te', 'nai', 'jisho', 'ta']

export function VerbsPage() {
  const [tab, setTab] = useSessionStorage<Tab>(SESSION_KEYS.verbsTab, 'practice')
  const [lessons, setLessons] = useLocalStorage<number[]>(STORAGE_KEYS.verbLessons, VERB_LESSONS)
  const [formIds, setFormIds] = useLocalStorage<VerbFormKey[]>(STORAGE_KEYS.verbForms, DEFAULT_FORMS)
  const [groups, setGroups] = useLocalStorage<GroupKey[]>(STORAGE_KEYS.verbGroups, ['1', '2', '3'])
  const [mode, setMode] = useLocalStorage<VerbPracticeMode>(STORAGE_KEYS.verbMode, 'choose')

  const verbs = useMemo(
    () => ALL_VERBS.filter((v) => lessons.includes(v.lesson) && groups.includes(String(v.verbGroup) as GroupKey)),
    [lessons, groups],
  )
  const selectedForms = forms.forms.filter((f) => formIds.includes(f.id))

  return (
    <PageLayout
      header={{
        titleJa: '動詞',
        titleReading: 'どうし',
        title: 'Verbos · formas',
        description: 'Practicá las formas de los verbos del vocabulario: ません, ました, て, ない, る (diccionario) y た.',
      }}
      toolbarLabel="Opciones de verbos"
      toolbar={
        <>
          <SegmentedTabs
            idPrefix={TABS_ID}
            label="Vista"
            tabs={[
              { id: 'practice', label: 'Practicar' },
              { id: 'rules', label: 'Reglas' },
              { id: 'table', label: 'Tabla' },
            ]}
            selected={tab}
            onSelect={setTab}
          />
          {tab !== 'rules' && (
            <>
              <ToggleChips
                label="Formas"
                options={forms.forms.map((f) => ({ value: f.id, label: f.short, jp: true, description: `${f.name} (lección ${f.lesson})` }))}
                selected={formIds}
                onChange={setFormIds}
              />
              <div className={styles.row}>
                <ToggleChips
                  label="Grupos"
                  options={[
                    { value: '1', label: 'I', description: 'Grupo I' },
                    { value: '2', label: 'II', description: 'Grupo II' },
                    { value: '3', label: 'III', description: 'Grupo III' },
                  ]}
                  selected={groups}
                  onChange={setGroups}
                />
                {tab === 'practice' && (
                  <Select
                    id="verbos-modo"
                    label="Responder"
                    value={mode}
                    onChange={(v) => setMode(v as VerbPracticeMode)}
                    options={[
                      { value: 'choose', label: 'eligiendo una opción' },
                      { value: 'write', label: 'escribiendo (hiragana o romaji)' },
                    ]}
                  />
                )}
              </div>
              <LessonPicker
                label="Verbos de las lecciones"
                lessons={VERB_LESSONS}
                selected={lessons}
                onChange={setLessons}
                describe={(l) => `Lección ${l} · ${ALL_VERBS.filter((v) => v.lesson === l).length} verbos`}
                summary={`${verbs.length} verbos · ${selectedForms.length} ${selectedForms.length === 1 ? 'forma' : 'formas'}`}
              />
            </>
          )}
        </>
      }
      footnote="Los verbos son los del vocabulario (lecciones 1–19); cada uno aparece una sola vez aunque esté en varias lecciones. La etiqueta de la lección en cada forma dice dónde se ve en el libro."
    >
      <div {...tabPanelProps(TABS_ID, tab)} className={styles.panel}>
        {tab === 'practice' && (
          <VerbPractice
            key={`${mode}|${lessons.join(',')}|${groups.join('')}|${formIds.join(',')}`}
            verbs={verbs}
            forms={selectedForms}
            mode={mode}
            storageKey={SESSION_KEYS.verbsQuiz}
          />
        )}
        {tab === 'rules' && <VerbRules data={forms} />}
        {tab === 'table' && <VerbTable verbs={verbs} forms={selectedForms} />}
      </div>
    </PageLayout>
  )
}
