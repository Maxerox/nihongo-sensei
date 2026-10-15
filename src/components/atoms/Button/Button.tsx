import type { ComponentProps } from 'react'
import { cx } from '../../../shared/utils/classNames'
import styles from './Button.module.scss'

export type ButtonVariant = 'default' | 'primary' | 'success' | 'danger' | 'ghost'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'default', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx(styles.button, styles[variant], styles[size], className)} {...rest} />
}
