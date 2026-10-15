import styles from './SkipLink.module.scss'

export interface SkipLinkProps {
  targetId: string
}

/** Primer elemento enfocable: salta el menú y va directo al contenido. */
export function SkipLink({ targetId }: SkipLinkProps) {
  return (
    <a
      className={styles.skip}
      href={`#${targetId}`}
      onClick={(e) => {
        // Con HashRouter, el ancla cambiaría la ruta: se maneja a mano.
        e.preventDefault()
        document.getElementById(targetId)?.focus()
      }}
    >
      Saltar al contenido
    </a>
  )
}
