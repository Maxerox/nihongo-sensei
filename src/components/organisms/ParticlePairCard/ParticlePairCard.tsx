import { Glyph } from '../../atoms/Glyph'
import { JpText } from '../../atoms/JpText'
import type { ParticlePair } from '../../../shared/types/content'
import styles from './ParticlePairCard.module.scss'

export interface ParticlePairCardProps {
  pair: ParticlePair
}

/** Dos partículas que se confunden, con un ejemplo de cada una. */
export function ParticlePairCard({ pair }: ParticlePairCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>
        <Glyph size="sm">{pair.a}</Glyph>
        <span className={styles.vs}>vs</span>
        <Glyph size="sm" tone="matcha">
          {pair.b}
        </Glyph>
      </h2>
      <JpText text={pair.description} mixed as="p" className={styles.description} />
      <div className={styles.columns}>
        <div className={styles.col}>
          <JpText text={pair.exampleA.ja} marked as="p" className={styles.ja} />
          <p className={styles.es}>{pair.exampleA.es}</p>
        </div>
        <div className={`${styles.col} ${styles.alt}`}>
          <JpText text={pair.exampleB.ja} marked as="p" className={styles.ja} />
          <p className={styles.es}>{pair.exampleB.es}</p>
        </div>
      </div>
    </article>
  )
}
