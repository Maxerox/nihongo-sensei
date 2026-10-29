// Corrección de kanji dibujados a mano, trazo por trazo, contra los datos de KanjiVG.
// Todo en coordenadas del viewBox de KanjiVG (0–109).

export type Point = [number, number]
export type Stroke = Point[]

export const VIEWBOX = 109
const SAMPLES = 24
/** Distancia media máxima (en unidades de 109) para aceptar un trazo. */
const TOLERANCE = 15
/** El inicio y el final de cada trazo tienen que quedar a menos de esto de los del modelo. */
const END_TOLERANCE = 18
/** En el modelo, dos trazos "se tocan" si quedan a menos de esto… */
const TOUCH = 4
/** …y "están separados" si quedan a más de esto. */
const APART = 14
/** En el dibujo: si deberían tocarse y quedan más lejos que esto, está mal. */
const DRAWN_GAP = 16
/** En el dibujo: si deberían estar separados y quedan más cerca que esto, está mal. */
const DRAWN_TOUCH = 3

export type StrokeStatus = 'ok' | 'direction' | 'order' | 'shape' | 'touch' | 'apart'

export interface StrokeFeedback {
  /** Número de trazo dibujado (1, 2, 3…). */
  index: number
  status: StrokeStatus
  /** Con 'order': el número de trazo que parece ser. */
  looksLike?: number
  /** Con 'touch' (debería tocarlo) o 'apart' (no debería tocarlo): el otro trazo. */
  other?: number
}

export interface DrawingResult {
  correct: boolean
  expected: number
  drawn: number
  strokes: StrokeFeedback[]
  /** Trazos bien hechos sobre el total esperado (0–1). */
  score: number
}

const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])

/** Reparte `n` puntos a la misma distancia a lo largo del trazo. */
export function resample(stroke: Stroke, n = SAMPLES): Stroke {
  if (stroke.length === 0) return []
  if (stroke.length === 1) return Array.from({ length: n }, () => stroke[0])
  const lengths = [0]
  for (let i = 1; i < stroke.length; i++) lengths.push(lengths[i - 1] + dist(stroke[i - 1], stroke[i]))
  const total = lengths[lengths.length - 1]
  if (total === 0) return Array.from({ length: n }, () => stroke[0])
  const out: Stroke = []
  let j = 1
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1)
    while (j < stroke.length - 1 && lengths[j] < target) j++
    const segment = lengths[j] - lengths[j - 1] || 1
    const t = Math.min(1, Math.max(0, (target - lengths[j - 1]) / segment))
    const [a, b] = [stroke[j - 1], stroke[j]]
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  return out
}

function bbox(strokes: Stroke[]) {
  const pts = strokes.flat()
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(...xs) - minX
  const h = Math.max(...ys) - minY
  return { cx: minX + w / 2, cy: minY + h / 2, size: Math.max(w, h, 1) }
}

/**
 * Acomoda el dibujo al tamaño y la posición del kanji de referencia,
 * así no importa si se dibujó más chico o corrido.
 */
export function fitToReference(drawn: Stroke[], reference: Stroke[]): Stroke[] {
  if (drawn.length === 0) return drawn
  const a = bbox(drawn)
  const b = bbox(reference)
  const s = b.size / a.size
  return drawn.map((st) => st.map(([x, y]) => [(x - a.cx) * s + b.cx, (y - a.cy) * s + b.cy] as Point))
}

/** Distancia más corta entre dos trazos. */
function minDistance(a: Stroke, b: Stroke): number {
  let best = Infinity
  for (const p of a) for (const q of b) best = Math.min(best, dist(p, q))
  return best
}

/** El trazo coincide con el modelo: forma parecida y empieza y termina donde corresponde. */
function matches(user: Stroke, target: Stroke): boolean {
  return (
    meanDistance(user, target) <= TOLERANCE &&
    dist(user[0], target[0]) <= END_TOLERANCE &&
    dist(user[user.length - 1], target[target.length - 1]) <= END_TOLERANCE
  )
}

const meanDistance = (a: Stroke, b: Stroke) => a.reduce((sum, p, i) => sum + dist(p, b[i]), 0) / a.length

/** Compara un dibujo con los trazos de referencia (puntos de muestra de KanjiVG). */
export function checkDrawing(drawn: Stroke[], reference: Stroke[]): DrawingResult {
  const ref = reference.map((s) => resample(s))
  const fitted = fitToReference(drawn, reference).map((s) => resample(s))

  const strokes: StrokeFeedback[] = fitted.map((user, i) => {
    const target = ref[i]
    if (target) {
      if (matches(user, target)) return { index: i + 1, status: 'ok' }
      if (matches(user, [...target].reverse())) return { index: i + 1, status: 'direction' }
    }
    // ¿Coincide con otro trazo? Entonces el orden está mal.
    const other = ref.findIndex((r, j) => j !== i && matches(user, r))
    if (other >= 0) return { index: i + 1, status: 'order', looksLike: other + 1 }
    return { index: i + 1, status: 'shape' }
  })

  // Cómo se tocan los trazos entre sí (distingue, por ejemplo, 入 de 八).
  if (drawn.length === reference.length) {
    const dense = (s: Stroke) => resample(s, 48)
    const refD = reference.map(dense)
    const userD = fitToReference(drawn, reference).map(dense)
    for (let j = 1; j < strokes.length; j++) {
      if (strokes[j].status !== 'ok') continue
      for (let i = 0; i < j; i++) {
        if (strokes[i].status !== 'ok') continue
        const model = minDistance(refD[i], refD[j])
        const user = minDistance(userD[i], userD[j])
        if (model < TOUCH && user > DRAWN_GAP) {
          strokes[j] = { index: j + 1, status: 'touch', other: i + 1 }
          break
        }
        if (model > APART && user < DRAWN_TOUCH) {
          strokes[j] = { index: j + 1, status: 'apart', other: i + 1 }
          break
        }
      }
    }
  }

  const ok = strokes.filter((s) => s.status === 'ok').length
  return {
    correct: drawn.length === reference.length && ok === reference.length,
    expected: reference.length,
    drawn: drawn.length,
    strokes,
    score: reference.length ? ok / reference.length : 0,
  }
}

/** Mensajes para mostrar después de corregir. */
export function describeResult(r: DrawingResult): string[] {
  if (r.correct) return [`¡Muy bien! Los ${r.expected} trazos están bien.`]
  const out: string[] = []
  const missing = r.expected - r.drawn
  if (missing > 0) out.push(missing === 1 ? `Falta 1 trazo: tiene ${r.expected}.` : `Faltan ${missing} trazos: tiene ${r.expected}.`)
  if (missing < 0) out.push(missing === -1 ? `Sobra 1 trazo: tiene ${r.expected}.` : `Sobran ${-missing} trazos: tiene ${r.expected}.`)
  for (const s of r.strokes) {
    if (s.status === 'direction') out.push(`Trazo ${s.index}: va en la dirección contraria.`)
    else if (s.status === 'order') out.push(`Trazo ${s.index}: parece el trazo ${s.looksLike}. Revisá el orden.`)
    else if (s.status === 'shape' && s.index <= r.expected) out.push(`Trazo ${s.index}: la forma o la posición no coinciden.`)
    else if (s.status === 'touch') out.push(`Trazo ${s.index}: tiene que tocar el trazo ${s.other}.`)
    else if (s.status === 'apart') out.push(`Trazo ${s.index}: no tiene que tocar el trazo ${s.other}.`)
  }
  return out
}
