import { Button } from '../../atoms/Button'
import { Kbd } from '../../atoms/Kbd'
import styles from './DeckControls.module.scss'

export interface DeckControlsProps {
  onPrev: () => void
  prevDisabled: boolean
  onReview: () => void
  onKnow: () => void
  onShuffle: () => void
}

/** Botones del mazo (anterior, repasar, lo sé, barajar) y la ayuda de teclado. */
export function DeckControls({ onPrev, prevDisabled, onReview, onKnow, onShuffle }: DeckControlsProps) {
  return (
    <>
      <div className={styles.controls}>
        <Button size="lg" className={styles.nav} onClick={onPrev} disabled={prevDisabled} aria-label="Tarjeta anterior">
          <span aria-hidden="true">←</span>
        </Button>
        <Button size="lg" variant="danger" onClick={onReview}>
          Repasar
        </Button>
        <Button size="lg" variant="success" onClick={onKnow}>
          Lo sé ✓
        </Button>
        <Button size="lg" className={styles.nav} onClick={onShuffle} aria-label="Barajar el mazo">
          <span aria-hidden="true">⤮</span>
        </Button>
      </div>
      <p className={styles.keys}>
        <Kbd>espacio</Kbd> dar vuelta · <Kbd>←</Kbd>
        <Kbd>→</Kbd> moverse · <Kbd>1</Kbd> repasar · <Kbd>2</Kbd> lo sé
      </p>
    </>
  )
}
