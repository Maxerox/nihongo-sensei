import type { ComponentProps } from 'react'
import { cx } from '../../../shared/utils/classNames'
import styles from './Chip.module.scss'

export interface ChipProps extends ComponentProps<'button'> {
  /** Si se pasa, el chip es un interruptor y expone aria-pressed. */
  pressed?: boolean
  /** Contenido en japonés (usa la tipografía japonesa). */
  jp?: boolean
}

export function Chip({ pressed, jp, className, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      lang={jp ? 'ja' : undefined}
      className={cx(styles.chip, jp && styles.jp, className)}
      {...rest}
    />
  )
}
