import { cx } from '../../../shared/utils/classNames'
import { speakJapanese, speechText } from '../../../shared/utils/speech'
import styles from './SpeakButton.module.scss'

export interface SpeakButtonProps {
  /** Texto japonés a leer (puede tener marcas [[...]]). */
  text: string
  size?: 'sm' | 'md'
  className?: string
}

export function SpeakButton({ text, size = 'md', className }: SpeakButtonProps) {
  return (
    <button
      type="button"
      className={cx(styles.speak, styles[size], className)}
      aria-label={`Escuchar ${speechText(text)}`}
      onClick={(e) => {
        e.stopPropagation()
        speakJapanese(text)
      }}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  )
}
