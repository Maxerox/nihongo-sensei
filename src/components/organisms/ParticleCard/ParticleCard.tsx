import { Glyph } from '../../atoms/Glyph'
import { JpText } from '../../atoms/JpText'
import { LessonTag } from '../../atoms/LessonTag'
import { ExampleItem } from '../../molecules/ExampleItem'
import type { Particle } from '../../../shared/types/content'
import styles from './ParticleCard.module.scss'

export interface ParticleCardProps {
  particle: Particle
  anchorId: string
}

/** Ficha de una partícula con sus usos numerados. */
export function ParticleCard({ particle, anchorId }: ParticleCardProps) {
  const titleId = `${anchorId}-titulo`
  return (
    <article id={anchorId} className={styles.card} aria-labelledby={titleId}>
      <div className={styles.head}>
        <Glyph>{particle.particle}</Glyph>
        <h2 id={titleId} className={styles.title}>
          <span className={styles.srOnly} lang="ja">
            {particle.particle}:{' '}
          </span>
          {particle.role}
          <small>se lee «{particle.romaji}»</small>
        </h2>
      </div>
      {particle.note && <JpText text={particle.note} mixed as="p" className={styles.note} />}
      <ol className={styles.uses}>
        {particle.uses.map((u) => (
          <li key={u.example.ja}>
            <p className={styles.use}>
              <JpText text={u.description} mixed /> <LessonTag lesson={u.lesson} />
            </p>
            <ExampleItem example={u.example} as="div" />
          </li>
        ))}
      </ol>
    </article>
  )
}
