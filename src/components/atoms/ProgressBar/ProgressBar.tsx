import styles from './ProgressBar.module.scss'

export interface ProgressBarProps {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  return (
    <progress className={styles.bar} value={value} max={Math.max(max, 1)} aria-label={label}>
      {value} de {max}
    </progress>
  )
}
