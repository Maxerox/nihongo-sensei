import styles from './ScoreLine.module.scss'

export interface ScoreItem {
  label: string
  value: string | number
}

export function ScoreLine({ items }: { items: ScoreItem[] }) {
  return (
    <div className={styles.line}>
      {items.map((it) => (
        <span key={it.label} className={styles.item}>
          {it.label} <b>{it.value}</b>
        </span>
      ))}
    </div>
  )
}
