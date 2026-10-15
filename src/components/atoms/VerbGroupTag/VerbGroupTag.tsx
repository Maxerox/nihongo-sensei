import type { VerbGroup } from '../../../shared/types/content'
import { VisuallyHidden } from '../VisuallyHidden'
import styles from './VerbGroupTag.module.scss'

const ROMAN: Record<VerbGroup, string> = { 1: 'I', 2: 'II', 3: 'III' }

export interface VerbGroupTagProps {
  group: VerbGroup
}

/** "(II)" junto a un verbo; los lectores de pantalla leen "verbo del grupo 2". */
export function VerbGroupTag({ group }: VerbGroupTagProps) {
  return (
    <span className={styles.tag} title={`Verbo del grupo ${ROMAN[group]}`}>
      <span aria-hidden="true">({ROMAN[group]})</span>
      <VisuallyHidden>, verbo del grupo {group}</VisuallyHidden>
    </span>
  )
}
