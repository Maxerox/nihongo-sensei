import { useState } from 'react'
import { JumpNav } from '../../components/molecules/JumpNav'
import { SegmentedTabs, tabPanelProps } from '../../components/molecules/SegmentedTabs'
import { ParticleCard } from '../../components/organisms/ParticleCard'
import { ParticlePairCard } from '../../components/organisms/ParticlePairCard'
import { ParticlePractice } from '../../components/organisms/ParticlePractice'
import { PageLayout } from '../../components/templates/PageLayout'
import particles from '../../data/particles.json'
import { useLocalStorage } from '../../shared/hooks/useLocalStorage'
import type { ParticlesData } from '../../shared/types/content'
import { lessonRange } from '../../shared/utils/lessons'
import { STORAGE_KEYS } from '../../shared/utils/storage'
import styles from './ParticlesPage.module.scss'

const data = particles as ParticlesData
type Tab = 'uses' | 'pairs' | 'practice'
const TABS_ID = 'particulas-vista'
const anchor = (romaji: string) => `particula-${romaji}`

export function ParticlesPage() {
  const [tab, setTab] = useState<Tab>('uses')
  const [lessons, setLessons] = useLocalStorage<number[]>(STORAGE_KEYS.particleLessons, lessonRange())

  return (
    <PageLayout
      header={{
        titleJa: '助詞',
        titleReading: 'じょし',
        title: 'Partículas · lecciones 1–19',
        description:
          'Para qué sirve cada partícula, cuáles se confunden entre sí, y práctica para completar oraciones. El número de lección dice dónde aparece cada uso.',
      }}
      toolbarLabel="Vista de partículas"
      toolbar={
        <>
          <SegmentedTabs
            idPrefix={TABS_ID}
            label="Vista"
            tabs={[
              { id: 'uses', label: 'Usos' },
              { id: 'pairs', label: 'Comparar' },
              { id: 'practice', label: 'Practicar' },
            ]}
            selected={tab}
            onSelect={setTab}
          />
          {tab === 'uses' && (
            <JumpNav
              label="Ir a la partícula"
              items={data.particles.map((p) => ({
                targetId: anchor(p.romaji),
                text: p.particle,
                jp: true,
                label: `Ir a ${p.particle} (${p.romaji}): ${p.role}`,
              }))}
            />
          )}
        </>
      }
    >
      <div {...tabPanelProps(TABS_ID, tab)} className={styles.panel}>
        {tab === 'uses' && (
          <div className={styles.grid}>
            {data.particles.map((p) => (
              <ParticleCard key={p.romaji} particle={p} anchorId={anchor(p.romaji)} />
            ))}
          </div>
        )}
        {tab === 'pairs' && (
          <div className={styles.list}>
            {data.pairs.map((p) => (
              <ParticlePairCard key={`${p.a}-${p.b}-${p.exampleA.ja}`} pair={p} />
            ))}
          </div>
        )}
        {tab === 'practice' && <ParticlePractice exercises={data.practice} lessons={lessons} onLessonsChange={setLessons} />}
      </div>
    </PageLayout>
  )
}
