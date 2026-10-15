import { useEffect } from 'react'
import toastyImage from '../../../assets/toasty.webp'
import { playToasty } from '../../../shared/utils/sound'
import styles from './ToastyPopup.module.scss'

export interface ToastyPopupProps {
  onDone: () => void
}

// Como en Mortal Kombat: entra rápido, se queda casi dos segundos y se va.
const DURATION_MS = 2400

/** Easter egg: una cara asoma por la esquina con "Toasty!", como en Mortal Kombat. */
export function ToastyPopup({ onDone }: ToastyPopupProps) {
  useEffect(() => {
    playToasty()
    const t = window.setTimeout(onDone, DURATION_MS)
    return () => window.clearTimeout(t)
  }, [onDone])

  return (
    <div className={styles.popup} aria-hidden="true">
      <img src={toastyImage} alt="" className={styles.face} />
    </div>
  )
}
