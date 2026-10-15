import { useState } from 'react'
import { Checkbox } from '../../components/atoms/Checkbox'
import { JpText } from '../../components/atoms/JpText'
import { JumpNav } from '../../components/molecules/JumpNav'
import { SegmentedTabs, tabPanelProps } from '../../components/molecules/SegmentedTabs'
import { CounterPractice } from '../../components/organisms/CounterPractice'
import { ReadingGridCard } from '../../components/organisms/ReadingGridCard'
import { PageLayout } from '../../components/templates/PageLayout'
import counters from '../../data/counters.json'
import type { CountersData } from '../../shared/types/content'
import { counterDisplay, counterLabelReading, isIrregular, naiveDay, naiveMonth, naiveReading } from '../../shared/utils/counters'
import styles from './CountersPage.module.scss'

const data = counters as CountersData
type Tab = 'counters' | 'dates' | 'practice'
const TABS_ID = 'contadores-vista'
const anchor = (id: string) => `contador-${id}`

export function CountersPage() {
  const [tab, setTab] = useState<Tab>('counters')
  const [showReadings, setShowReadings] = useState(true)
  const base = data.numberBase

  return (
    <PageLayout
      header={{
        titleJa: '数え方',
        titleReading: 'かぞえかた',
        title: 'Contadores y fechas · lecciones 1–19',
        description: 'Cómo se lee cada número con su contador, los días del mes y los meses. Tocá una lectura para escucharla.',
      }}
      toolbarLabel="Vista de contadores"
      toolbar={
        <>
          <SegmentedTabs
            idPrefix={TABS_ID}
            label="Vista"
            tabs={[
              { id: 'counters', label: 'Contadores' },
              { id: 'dates', label: 'Fechas' },
              { id: 'practice', label: 'Practicar' },
            ]}
            selected={tab}
            onSelect={setTab}
          />
          {tab !== 'practice' && (
            <div className={styles.tools}>
              <Checkbox id="contadores-lecturas" label="Mostrar lecturas" checked={showReadings} onChange={setShowReadings} />
              <span className={styles.note}>Si las ocultás, tocá cada casilla para ver la lectura.</span>
            </div>
          )}
          {tab === 'counters' && (
            <JumpNav
              label="Ir al contador"
              items={data.counters.map((c) => ({
                targetId: anchor(c.id),
                text: c.label,
                jp: true,
                reading: /[一-鿿]/.test(c.label) ? (counterLabelReading(c) ?? undefined) : undefined,
                label: `Ir a ${c.label}: ${c.meaning}`,
              }))}
            />
          )}
        </>
      }
    >
      <div {...tabPanelProps(TABS_ID, tab)} className={styles.panel}>
        {tab === 'counters' && (
          <>
            <p className={styles.tip}>
              <b>Regla general.</b> Con 1, 6, 8 y 10, un contador que empieza con k, s, t o p suele duplicar la consonante:{' '}
              <span lang="ja">いっかい, ろっぷん, はっさい, じゅっかい</span>. Con h, además, la h pasa a p:{' '}
              <span lang="ja">いっぷん</span>. Las lecturas resaltadas son las que no siguen la forma «número ＋ contador».
            </p>
            {data.counters.map((c) => (
              <ReadingGridCard
                key={`${c.id}-${showReadings}`}
                id={anchor(c.id)}
                glyph={<JpText text={c.label} reading={/[一-鿿]/.test(c.label) ? (counterLabelReading(c) ?? undefined) : undefined} />}
                title={`${c.meaning} ${c.emoji}`}
                lesson={c.lesson}
                question={c.question}
                note={c.note}
                showReadings={showReadings}
                items={c.readings.map((r, i) => ({
                  key: String(i + 1),
                  label: counterDisplay(c, i + 1),
                  reading: r,
                  irregular: c.reading !== null && isIrregular(r, naiveReading(base, i + 1, c.reading)),
                }))}
              />
            ))}
          </>
        )}
        {tab === 'dates' && (
          <>
            <ReadingGridCard
              key={`dias-${showReadings}`}
              glyph={<JpText text="日" reading="にち" />}
              title="Días del mes"
              lesson={5}
              question="なんにち"
              note="Del 1 al 10, el 14, el 20 y el 24 tienen lectura propia. El resto es «número ＋ にち»; los que terminan en 7 y 9 usan しち y く (17日 = じゅうしちにち)."
              showReadings={showReadings}
              items={data.days.map((r, i) => ({ key: String(i + 1), label: String(i + 1), reading: r, irregular: isIrregular(r, naiveDay(base, i + 1)) }))}
            />
            <ReadingGridCard
              key={`meses-${showReadings}`}
              glyph={<JpText text="月" reading="がつ" />}
              title="Meses"
              lesson={5}
              question="なんがつ"
              note="Los meses se nombran con número: 4月 es abril. Ojo con 4, 7 y 9: しがつ, しちがつ, くがつ."
              showReadings={showReadings}
              items={data.months.map((r, i) => ({ key: String(i + 1), label: `${i + 1}月`, reading: r, irregular: isIrregular(r, naiveMonth(base, i + 1)) }))}
            />
            <ReadingGridCard
              key={`semana-${showReadings}`}
              glyph="よう"
              title="Días de la semana"
              lesson={4}
              question="なんようび"
              showReadings={showReadings}
              wide
              items={data.weekdays.map((w) => ({ key: w.kanji, label: `${w.kanji} · ${w.es}`, reading: w.reading }))}
            />
          </>
        )}
        {tab === 'practice' && <CounterPractice data={data} />}
      </div>
    </PageLayout>
  )
}
