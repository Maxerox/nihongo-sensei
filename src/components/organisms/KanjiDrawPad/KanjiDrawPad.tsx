import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../atoms/Button'
import { Checkbox } from '../../atoms/Checkbox'
import type { KanjiStrokeData } from '../../../shared/types/content'
import { cx } from '../../../shared/utils/classNames'
import { checkDrawing, describeResult, VIEWBOX, type DrawingResult, type Point, type Stroke } from '../../../shared/utils/strokes'
import styles from './KanjiDrawPad.module.scss'

export interface KanjiDrawPadProps {
  kanji: string
  data: KanjiStrokeData
  /** Se llama cada vez que se corrige un dibujo. */
  onChecked?: (result: DrawingResult) => void
}

const toPath = (s: Stroke) => (s.length === 1 ? `M${s[0][0]} ${s[0][1]}l0.1 0` : 'M' + s.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L'))

/**
 * Cuadro para dibujar un kanji con el dedo, un lápiz o el mouse, y corregirlo trazo por trazo.
 * Dibujar necesita un puntero; "Ver orden de trazos" muestra lo mismo sin dibujar.
 */
export function KanjiDrawPad({ kanji, data, onChecked }: KanjiDrawPadProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const helpId = useId()
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [current, setCurrent] = useState<Stroke | null>(null)
  const [result, setResult] = useState<DrawingResult | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [replay, setReplay] = useState(0)

  // Dibujo con eventos de puntero (dedo, lápiz o mouse).
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let active: Stroke | null = null
    const toPoint = (e: PointerEvent): Point => {
      const r = svg.getBoundingClientRect()
      return [((e.clientX - r.left) / r.width) * VIEWBOX, ((e.clientY - r.top) / r.height) * VIEWBOX]
    }
    const down = (e: PointerEvent) => {
      e.preventDefault()
      svg.setPointerCapture(e.pointerId)
      active = [toPoint(e)]
      setResult(null)
      setReplay(0)
      setCurrent(active)
    }
    const move = (e: PointerEvent) => {
      if (!active) return
      const p = toPoint(e)
      const last = active[active.length - 1]
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.8) return
      active = [...active, p]
      setCurrent(active)
    }
    const up = () => {
      if (!active) return
      const done = active
      active = null
      setCurrent(null)
      setStrokes((s) => [...s, done])
    }
    svg.addEventListener('pointerdown', down)
    svg.addEventListener('pointermove', move)
    svg.addEventListener('pointerup', up)
    svg.addEventListener('pointercancel', up)
    return () => {
      svg.removeEventListener('pointerdown', down)
      svg.removeEventListener('pointermove', move)
      svg.removeEventListener('pointerup', up)
      svg.removeEventListener('pointercancel', up)
    }
  }, [])

  const check = () => {
    const r = checkDrawing(strokes, data.points)
    setResult(r)
    onChecked?.(r)
  }
  const clear = () => {
    setStrokes([])
    setResult(null)
  }

  const statusOf = (i: number) => result?.strokes[i]?.status
  const messages = result ? describeResult(result) : []

  return (
    <div className={styles.pad}>
      <div className={styles.board}>
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          aria-label={`Cuadro para dibujar. ${strokes.length} ${strokes.length === 1 ? 'trazo dibujado' : 'trazos dibujados'}.`}
          aria-describedby={helpId}
        >
          <line x1="54.5" y1="0" x2="54.5" y2="109" className={styles.grid} />
          <line x1="0" y1="54.5" x2="109" y2="54.5" className={styles.grid} />
          {showGuide && (
            <g className={styles.guide}>
              {data.strokes.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          )}
          {replay > 0 && (
            <g key={replay} className={styles.replay}>
              {data.strokes.map((d, i) => (
                <g key={i} style={{ animationDelay: `${i * 0.7}s` }} className={styles.replayStroke}>
                  <path d={d} pathLength={1} style={{ animationDelay: `${i * 0.7}s` }} />
                  <text x={data.numbers[i][0]} y={data.numbers[i][1]} style={{ animationDelay: `${i * 0.7}s` }}>
                    {i + 1}
                  </text>
                </g>
              ))}
            </g>
          )}
          <g className={styles.ink}>
            {strokes.map((s, i) => (
              <path
                key={i}
                d={toPath(s)}
                className={cx(statusOf(i) === 'ok' && styles.ok, statusOf(i) && statusOf(i) !== 'ok' && styles.bad)}
              />
            ))}
            {current && <path d={toPath(current)} />}
          </g>
          {result && (
            <g className={styles.labels}>
              {strokes.map((s, i) => (
                <text key={i} x={s[0][0] - 4} y={s[0][1] - 3} className={cx(statusOf(i) === 'ok' ? styles.okText : styles.badText)}>
                  {i + 1}
                </text>
              ))}
            </g>
          )}
        </svg>
      </div>
      <p id={helpId} className={styles.help}>
        Dibujá {kanji ? 'el kanji' : ''} trazo por trazo con el dedo, un lápiz o el mouse, en el orden correcto. Tiene {data.strokes.length}{' '}
        trazos.
      </p>

      <div className={styles.actions}>
        <Button onClick={() => setStrokes((s) => s.slice(0, -1))} disabled={strokes.length === 0}>
          Deshacer
        </Button>
        <Button onClick={clear} disabled={strokes.length === 0}>
          Borrar
        </Button>
        <Button onClick={() => setReplay((n) => n + 1)}>Ver orden de trazos</Button>
        <Button variant="primary" onClick={check} disabled={strokes.length === 0}>
          Comprobar
        </Button>
      </div>
      <Checkbox id={`guia-${kanji}`} label="Mostrar guía" checked={showGuide} onChange={setShowGuide} />

      <div className={styles.feedback} aria-live="polite">
        {result && (
          <ul className={cx(styles.messages, result.correct ? styles.good : styles.wrong)}>
            {messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
