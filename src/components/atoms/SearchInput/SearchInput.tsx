import { VisuallyHidden } from '../VisuallyHidden'
import styles from './SearchInput.module.scss'

export interface SearchInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ id, label, value, onChange, placeholder }: SearchInputProps) {
  return (
    <>
      <VisuallyHidden as="label" htmlFor={id}>
        {label}
      </VisuallyHidden>
      <input
        id={id}
        className={styles.search}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  )
}
