import { JpText } from '../../atoms/JpText'
import { SpeakButton } from '../../atoms/SpeakButton'
import type { Example } from '../../../shared/types/content'
import styles from './ExampleItem.module.scss'

export interface ExampleItemProps {
  example: Example
  as?: 'li' | 'div'
}

/** Ejemplo en japonés (con la parte gramatical resaltada), traducción y botón para escuchar. */
export function ExampleItem({ example, as: Tag = 'li' }: ExampleItemProps) {
  return (
    <Tag className={styles.item}>
      <JpText text={example.ja} marked className={styles.ja} />
      <span className={styles.es}>{example.es}</span>
      <SpeakButton text={example.ja} size="sm" className={styles.speak} />
    </Tag>
  )
}
