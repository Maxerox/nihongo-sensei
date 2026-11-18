import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../atoms/Button'
import styles from './WriteAnswer.module.scss'

export interface WriteAnswerProps {
  id: string
  label: string
  onSubmit: (text: string) => void
  /** Ya se respondió: el campo queda de solo lectura. */
  locked: boolean
  /** La respuesta estuvo mal (marca el campo). */
  invalid?: boolean
  /** Poner el foco en el campo al aparecer: solo al pasar de pregunta, cuando ya se está escribiendo. */
  focusOnMount?: boolean
}

/**
 * Campo para escribir una respuesta y comprobarla (Enter o el botón).
 * Cada pregunta nueva usa un WriteAnswer nuevo (con `key`), así arranca vacío.
 */
export function WriteAnswer({ id, label, onSubmit, locked, invalid, focusOnMount }: WriteAnswerProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus()
  }, [focusOnMount])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!locked && text.trim()) onSubmit(text)
  }
  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.row}>
        <input
          ref={inputRef}
          id={id}
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={locked}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={invalid || undefined}
        />
        <Button type="submit" variant="primary" disabled={locked || !text.trim()}>
          Comprobar
        </Button>
      </div>
    </form>
  )
}
