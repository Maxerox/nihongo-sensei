import { useId, type ReactNode } from 'react'
import { VisuallyHidden } from '../../atoms/VisuallyHidden'
import { cx } from '../../../shared/utils/classNames'
import styles from './FlipCard.module.scss'

export interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  /** Arriba a la derecha (lección, posición en el mazo). */
  meta?: ReactNode
  /** Texto del sello de "ya lo sé" (si corresponde). */
  knownLabel?: string
  flipped: boolean
  onFlip: () => void
  /** Botón extra en la esquina inferior derecha (por ejemplo, escuchar). */
  corner?: ReactNode
}

/**
 * Tarjeta de estudio (単語カード) que se da vuelta.
 * La cara oculta queda fuera del árbol de accesibilidad.
 */
export function FlipCard({ front, back, meta, knownLabel, flipped, onFlip, corner }: FlipCardProps) {
  const hintId = useId()
  const face = (content: ReactNode, side: 'front' | 'back', hidden: boolean) => (
    <span className={cx(styles.face, styles[side])} aria-hidden={hidden}>
      {meta && <span className={styles.meta}>{meta}</span>}
      {content}
      {knownLabel && <span className={styles.known}>{knownLabel}</span>}
    </span>
  )
  return (
    <div className={styles.stage}>
      <button type="button" className={cx(styles.card, flipped && styles.flipped)} onClick={onFlip} aria-describedby={hintId}>
        {face(front, 'front', flipped)}
        {face(back, 'back', !flipped)}
      </button>
      <VisuallyHidden id={hintId}>
        {flipped ? 'Mostrando la respuesta. Tocá para volver.' : 'Tocá para ver la respuesta.'}
      </VisuallyHidden>
      {corner && <span className={styles.corner}>{corner}</span>}
    </div>
  )
}
