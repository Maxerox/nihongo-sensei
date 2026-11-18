import { EmptyState } from '../../atoms/EmptyState'
import { JpText } from '../../atoms/JpText'
import { LessonTag } from '../../atoms/LessonTag'
import { VerbGroupTag } from '../../atoms/VerbGroupTag'
import type { VerbFormInfo, VocabWord } from '../../../shared/types/content'
import { formDisplay, masuDisplay } from '../../../shared/utils/verbs'
import styles from './VerbTable.module.scss'

export interface VerbTableProps {
  verbs: VocabWord[]
  forms: VerbFormInfo[]
}

/** Todos los verbos elegidos con sus formas: una tarjeta por verbo, con las formas en grilla. */
export function VerbTable({ verbs, forms }: VerbTableProps) {
  if (verbs.length === 0) return <EmptyState>Elegí al menos una lección y un grupo.</EmptyState>
  return (
    <div className={styles.wrap}>
      <p className={styles.count}>{verbs.length} verbos</p>
      <ul className={styles.list}>
        {verbs.map((v) => {
          const m = masuDisplay(v)
          return (
            <li key={v.id} className={styles.item}>
              <div className={styles.head}>
                <span className={styles.verb}>
                  <JpText text={m.main} reading={m.reading || undefined} /> <VerbGroupTag group={v.verbGroup!} />
                </span>
                <span className={styles.meaning}>{v.es}</span>
                <LessonTag lesson={v.lesson} />
              </div>
              <dl className={styles.forms}>
                {forms.map((f) => {
                  const d = formDisplay(v, f.id)
                  return (
                    <div key={f.id} className={styles.form}>
                      <dt>
                        <span lang="ja">{f.short}</span>
                        <span className={styles.srOnly}> ({f.name})</span>
                      </dt>
                      <dd>{d && <JpText text={d.main} reading={d.reading || undefined} />}</dd>
                    </div>
                  )
                })}
              </dl>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
