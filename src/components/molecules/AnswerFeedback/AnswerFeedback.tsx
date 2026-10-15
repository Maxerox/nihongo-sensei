import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '../../atoms/Button'
import styles from './AnswerFeedback.module.scss'

export interface AnswerFeedbackProps {
  /** null mientras no se respondió. */
  correct: boolean | null
  message?: ReactNode
  onNext: () => void
  nextLabel?: string
}

/**
 * Resultado de una respuesta. La región aria-live existe siempre,
 * así el lector de pantalla anuncia el resultado apenas aparece.
 */
export function AnswerFeedback({ correct, message, onNext, nextLabel = 'Siguiente' }: AnswerFeedbackProps) {
  const nextRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (correct !== null) nextRef.current?.focus()
  }, [correct])

  return (
    <div className={styles.row}>
      <p className={styles.message} aria-live="polite">
        {correct !== null && (
          <>
            <strong className={correct ? styles.ok : styles.bad}>{correct ? '✓ ¡Bien!' : '✗ No.'}</strong> {message}
          </>
        )}
      </p>
      {correct !== null && (
        <Button ref={nextRef} variant="primary" size="lg" onClick={onNext}>
          {nextLabel} →
        </Button>
      )}
    </div>
  )
}
