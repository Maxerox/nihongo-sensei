import { cx } from '../../../shared/utils/classNames'
import styles from './KanjiReadings.module.scss'

export interface KanjiReadingsProps {
  on: string[]
  kun: string[]
  compact?: boolean
}

/** Kun con la okurigana más clara: た.べる → た + べる. */
function Kun({ reading }: { reading: string }) {
  const [stem, okurigana] = reading.split('.')
  return (
    <span lang="ja" className={styles.reading}>
      {stem}
      {okurigana && <span className={styles.okurigana}>{okurigana}</span>}
    </span>
  )
}

/** Lecturas on (katakana) y kun (hiragana) de un kanji. */
export function KanjiReadings({ on, kun, compact }: KanjiReadingsProps) {
  return (
    <dl className={cx(styles.readings, compact && styles.compact)}>
      {on.length > 0 && (
        <div className={styles.row}>
          <dt>On</dt>
          <dd>
            {on.map((r, i) => (
              <span key={r}>
                {i > 0 && '、'}
                <span lang="ja" className={styles.reading}>
                  {r}
                </span>
              </span>
            ))}
          </dd>
        </div>
      )}
      {kun.length > 0 && (
        <div className={styles.row}>
          <dt>Kun</dt>
          <dd>
            {kun.map((r, i) => (
              <span key={r}>
                {i > 0 && '、'}
                <Kun reading={r} />
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  )
}
