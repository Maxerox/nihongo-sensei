import { JpText } from '../../atoms/JpText'
import { LessonTag } from '../../atoms/LessonTag'
import type { VerbFormsData } from '../../../shared/types/content'
import styles from './VerbRules.module.scss'

export interface VerbRulesProps {
  data: VerbFormsData
}

/** Cheatsheet: los tres grupos y cómo se arma cada forma, con ejemplos. */
export function VerbRules({ data }: VerbRulesProps) {
  return (
    <div className={styles.rules}>
      <section className={styles.card} aria-labelledby="verbos-grupos">
        <h2 id="verbos-grupos" className={styles.title}>
          Los tres grupos
        </h2>
        <dl className={styles.groups}>
          {data.groups.map((g) => (
            <div key={g.group} className={styles.group}>
              <dt>Grupo {g.group}</dt>
              <dd>
                <JpText text={g.description} mixed />
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {data.forms.map((f) => (
        <section key={f.id} className={styles.card} aria-labelledby={`verbos-${f.id}`}>
          <div className={styles.head}>
            <h2 id={`verbos-${f.id}`} className={styles.title}>
              {f.name} <span lang="ja">（{f.ja}）</span>
            </h2>
            <LessonTag lesson={f.lesson} />
          </div>
          <p className={styles.description}>
            <JpText text={f.description} mixed />
          </p>
          <ul className={styles.ruleList} aria-label={`Cómo se arma la ${f.name.toLowerCase()}`}>
            {f.rules.map((rule, i) => (
              <li key={i} className={styles.rule}>
                <p className={styles.change}>
                  <span className={styles.groupTag}>{rule.group === 'todos' ? 'Todos' : `Grupo ${rule.group}`}</span>{' '}
                  <JpText text={rule.change} mixed />
                </p>
                <ul className={styles.examples}>
                  {rule.examples.map((ex) => (
                    <li key={ex} lang="ja">
                      {ex}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className={styles.example}>
            <JpText text={f.example.ja} /> <span className={styles.es}>{f.example.es}</span>
          </p>
        </section>
      ))}
    </div>
  )
}
