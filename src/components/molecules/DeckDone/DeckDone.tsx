import { Button } from '../../atoms/Button'
import { Panel } from '../../atoms/Panel'
import styles from './DeckDone.module.scss'

export interface DeckDoneProps {
  count: number
  onRestart: () => void
}

/** Pantalla de "terminaste el mazo". */
export function DeckDone({ count, onRestart }: DeckDoneProps) {
  return (
    <Panel centered>
      <span className={styles.big} aria-hidden="true">
        🎌
      </span>
      <h2 className={styles.title}>¡Terminaste el mazo!</h2>
      <p className={styles.sub}>{count} tarjetas repasadas.</p>
      <Button variant="primary" size="lg" onClick={onRestart}>
        Barajar y empezar de nuevo
      </Button>
    </Panel>
  )
}
