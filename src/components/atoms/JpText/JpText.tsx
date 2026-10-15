import { useMemo, type ReactNode } from 'react'
import { toFurigana, toMarkedFurigana, type FuriganaSegment } from '../../../shared/utils/furigana'
import { cx } from '../../../shared/utils/classNames'
import styles from './JpText.module.scss'

export interface JpTextProps {
  /** Texto en japonés. Con `marked`, `[[...]]` se resalta. */
  text: string
  /** Lectura de la palabra entera (si ya se conoce, por ejemplo en el vocabulario). */
  reading?: string
  marked?: boolean
  /**
   * Texto en español con palabras en japonés adentro (explicaciones).
   * No usa la tipografía japonesa en todo el texto y marca solo el japonés con lang="ja".
   */
  mixed?: boolean
  as?: 'span' | 'div' | 'p'
  className?: string
}

function renderSegments(segments: FuriganaSegment[], mixed = false) {
  const out: ReactNode[] = []
  let buffer: ReactNode[] = []
  let bufferMark = false
  const flush = (key: number) => {
    if (!buffer.length) return
    out.push(bufferMark ? <mark key={`m${key}`} className={styles.mark}>{buffer}</mark> : buffer)
    buffer = []
  }
  segments.forEach((s, i) => {
    const mark = Boolean(s.mark)
    if (mark !== bufferMark) {
      flush(i)
      bufferMark = mark
    }
    buffer.push(
      s.reading ? (
        <ruby key={i} lang={mixed ? 'ja' : undefined}>
          {s.text}
          <rt>{s.reading}</rt>
        </ruby>
      ) : (
        <span key={i}>{s.text}</span>
      ),
    )
  })
  flush(segments.length)
  return out
}

/**
 * Texto japonés con furigana automática (CONVENTIONS.md §2.2).
 * Todo japonés con kanji de la app pasa por este componente.
 */
export function JpText({ text, reading, marked, mixed, as: Tag = 'span', className }: JpTextProps) {
  const content = useMemo(() => {
    if (reading) {
      return (
        <ruby>
          {text}
          <rt>{reading}</rt>
        </ruby>
      )
    }
    return renderSegments(marked ? toMarkedFurigana(text) : toFurigana(text), mixed)
  }, [text, reading, marked, mixed])

  return (
    <Tag lang={mixed ? undefined : 'ja'} className={cx(!mixed && styles.jp, mixed && styles.mixed, className)}>
      {content}
    </Tag>
  )
}
