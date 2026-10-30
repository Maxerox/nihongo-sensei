import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '../../atoms/Button'
import { Panel } from '../../atoms/Panel'
import styles from './QuizDone.module.scss'

export interface QuizDoneProps {
  total: number
  firstTry: number
  /** Las que se fallaron alguna vez (ya formateadas), si hubo. */
  missed?: ReactNode
  onRestart: () => void
  /** Practicar solo las que se fallaron. */
  onRetryMissed?: () => void
}

/**
 * Fin de una ronda de quiz. Recibe el foco al aparecer, porque el botón
 * "Siguiente" que lo tenía desaparece.
 */
export function QuizDone({ total, firstTry, missed, onRestart, onRetryMissed }: QuizDoneProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => titleRef.current?.focus(), [])
  const perfect = firstTry === total

  return (
    <Panel centered>
      <span className={styles.big} aria-hidden="true">
        {perfect ? '🎉' : '🎌'}
      </span>
      <h2 ref={titleRef} tabIndex={-1} className={styles.title}>
        ¡Terminaste la ronda!
      </h2>
      <p className={styles.sub}>
        {firstTry} de {total} a la primera.{perfect && ' ¡Perfecto!'}
      </p>
      {missed && !perfect && (
        <div className={styles.missed}>
          <p className={styles.missedLabel}>Las que te costaron:</p>
          {missed}
        </div>
      )}
      <div className={styles.actions}>
        {onRetryMissed && !perfect && (
          <Button variant="primary" size="lg" onClick={onRetryMissed}>
            Practicar las que fallé
          </Button>
        )}
        <Button variant={perfect || !onRetryMissed ? 'primary' : 'default'} size="lg" onClick={onRestart}>
          Empezar de nuevo
        </Button>
      </div>
    </Panel>
  )
}
