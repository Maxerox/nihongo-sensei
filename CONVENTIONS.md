# Normas del proyecto · Nihongo Sensei

Este archivo junta todas las decisiones del proyecto para no tener que repetirlas.
Cualquier cambio (hecho por una persona o por Claude) tiene que respetarlas. Si una
norma deja de servir, se cambia **acá** primero.

---

## 1. Qué es la app

App para estudiar *Minna no Nihongo* (lecciones 1–19) en español rioplatense.
Secciones actuales, cada una es una página:

| Ruta            | Página               | Contenido                                     |
| --------------- | -------------------- | --------------------------------------------- |
| `/vocabulario`  | `VocabularyPage`     | Tarjetas, quiz y lista de vocabulario         |
| `/kanji`        | `KanjiPage`          | Tarjetas, dibujo con corrección y lista de kanji (unidades 1–10) |
| `/gramatica`    | `GrammarPage`        | Cheatsheet de gramática por lección           |
| `/particulas`   | `ParticlesPage`      | Usos, comparaciones y práctica de partículas  |
| `/contadores`   | `CountersPage`       | Contadores, fechas y práctica                 |

## 2. Reglas de contenido japonés

1. **Kanji permitidos:** solo los kanji de las unidades 1–8 del libro *Minna no Nihongo – Kanji*.
   La lista está en `src/data/kanji.json` (`allowedKanji`). Una palabra se muestra en kanji
   solo si **todos** sus kanji están en esa lista; si no, va en kana.
   - Excepción: el vocabulario tiene la opción "Mostrar todos los kanji".
   - Excepción: la sección **Kanji** usa las unidades 1–10 (`kanji-book.json`), porque su
     objetivo es estudiar esos kanji.
   - Los textos nuevos (ejemplos, oraciones de práctica) se escriben solo con kanji permitidos.
     El test `src/shared/utils/__tests__/content.test.ts` lo controla.
2. **Furigana siempre:** todo kanji que se muestre lleva su lectura en hiragana encima
   (`<ruby>`). Se usa el átomo `JpText`, que lo hace solo. Nunca se escribe japonés con
   kanji en un `<span>` suelto.
   - Las lecturas salen de `furiganaDictionary` en `kanji.json` y de las reglas de contexto de
     `src/shared/utils/furigana.ts` (人, 来, 何, 日, 月). Si aparece un kanji nuevo, se agrega
     al diccionario y el test de contenido lo verifica.
   - Excepciones: cuando la lectura **es la respuesta** de una práctica (por ejemplo "8日"
     en la práctica de contadores, o el frente de una tarjeta de kanji), se muestra después
     de responder. En la sección Kanji, el kanji que se estudia va solo y grande, con sus
     lecturas on y kun al lado (`KanjiReadings`); los ejemplos sí llevan furigana.
   - Cuando ya se conoce la lectura de la palabra entera, se pasa a `JpText` con `reading`:
     `alignReading` la reparte para que la furigana quede solo sobre los kanji.
3. En los ejemplos, `[[...]]` marca la parte gramatical que se resalta.
4. Los números van en cifras arábigas, como en el libro (3人, 8日).
5. Todo texto japonés en el DOM lleva `lang="ja"`.

## 3. Textos de la interfaz

- Español rioplatense, con "vos" (tocá, elegí, practicá).
- Frases cortas y directas. Los botones dicen lo que hacen ("Siguiente", "Barajar").
- Los mensajes de error dicen qué pasó y qué hacer.

## 4. Arquitectura

```
src/
├── app/                  # App, rutas y layout raíz
├── pages/                # Una carpeta por página (sección)
├── components/
│   ├── atoms/            # Piezas mínimas: Button, Chip, JpText, SpeakButton…
│   ├── molecules/        # Combinan átomos: SegmentedTabs, ChipGroup, ExampleItem…
│   ├── organisms/        # Bloques con lógica: TopBar, NavDrawer, Flashcard, PracticeQuiz…
│   └── templates/        # Estructura de página: PageLayout
├── data/                 # Contenido en JSON (sin lógica)
├── shared/
│   ├── hooks/            # Hooks reutilizables (useLocalStorage, useSpeech…)
│   ├── types/            # Tipos del contenido JSON
│   └── utils/            # Funciones puras (furigana, kanji, shuffle, storage…)
└── styles/               # Tokens, mixins y estilos globales
```

### 4.1 Atomic design

- **Átomo:** no importa otros componentes del proyecto, salvo los átomos base `JpText` y `VisuallyHidden`.
- **Molécula:** combina átomos. Sin estado de negocio.
- **Organismo:** puede tener estado y lógica propia. Puede usar átomos y moléculas.
- **Template:** estructura de la página, sin contenido propio.
- **Página:** une template + organismos + datos. Es la única que importa JSON de `src/data`.
- Una capa nunca importa de una capa superior (un átomo no importa una molécula).

### 4.2 Estructura de cada componente

```
components/atoms/Button/
├── Button.tsx            # El componente (export nombrado)
├── Button.module.scss    # Sus estilos, y solo los suyos
└── index.ts              # export { Button } from './Button'
```

- Un componente por carpeta, en `PascalCase`.
- Estilos con **CSS Modules + SCSS** (`*.module.scss`). Nada de estilos de un componente
  en otro archivo. Los estilos globales son solo los de `src/styles/`.
- Los colores, tipografías, radios y espacios salen de los tokens (`var(--…)` de
  `src/styles/_tokens.scss`). No se escriben colores sueltos en los componentes.
- Las props se tipan con una `interface <Nombre>Props`.

### 4.3 Contenido en JSON

- Todo el contenido vive en `src/data/*.json`: `vocabulary`, `grammar`, `particles`,
  `counters`, `kanji` (lista de kanji permitidos y furigana), `kanji-book` (los 104 kanji de
  las unidades 1–10) y `kanji-strokes` (trazos). Los componentes no tienen textos de estudio
  escritos adentro.
- `kanji-strokes.json` se genera a partir de **KanjiVG** (© Ulrich Apel, licencia
  CC BY-SA 3.0): esos datos se comparten con la misma licencia y se cita la fuente en la
  página de Kanji y en el README. No se edita a mano: si hacen falta más kanji, se vuelve a
  generar desde KanjiVG.
- Los tipos de cada JSON están en `src/shared/types/content.ts`. Si se cambia la forma
  de un JSON, se actualiza el tipo.
- Los `id` del vocabulario (`"lección:índice:kana"`) no se cambian: el progreso guardado
  de cada persona depende de ellos.

### 4.4 Shared utils

- `shared/utils` tiene funciones **puras** y testeadas. Si una función se usa en más de un
  componente, va acá.
- `shared/hooks` tiene hooks que se reusan entre páginas. Por ejemplo, `useDeck` maneja
  cualquier mazo de tarjetas (barajar, avanzar, marcar y atajos de teclado).
- Las páginas se cargan por separado (`React.lazy` en `App.tsx`), así lo pesado (como los
  trazos de kanji) se descarga solo al abrir esa página.

### 4.5 Estado guardado

Se usa `localStorage` mediante `useLocalStorage`, siempre dentro de `try/catch`. Claves
actuales (no se renombran, para no perder el progreso):

| Clave          | Qué guarda                                   |
| -------------- | -------------------------------------------- |
| `mn_known`     | IDs de palabras marcadas como sabidas        |
| `mn_lessons`   | Lecciones elegidas en vocabulario            |
| `mn_dir`       | Dirección de las tarjetas (`jp` / `es`)      |
| `mn_allk`      | Mostrar todos los kanji                      |
| `mn_plessons`  | Lecciones elegidas para practicar partículas |
| `mn_kanji_units` | Unidades elegidas en Kanji                 |
| `mn_kanji_known` | Kanji marcados como sabidos                |
| `mn_kanji_dir`   | Dirección de las tarjetas de kanji (`kanji` / `meaning`) |

## 5. Accesibilidad (obligatorio)

- Cada página tiene un único `<h1>` y vive dentro de `<main id="contenido">`.
- Hay un link "Saltar al contenido" al principio.
- Todo lo que se toca es un `<button>` o un `<a>` reales, con texto o `aria-label`.
- Botones de tipo interruptor (chips de lección, filtros): `aria-pressed`.
- Pestañas: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`,
  `role="tabpanel"`, y navegación con flechas, Inicio y Fin.
- El menú lateral es un `<dialog>` nativo abierto con `showModal()`: el navegador atrapa el
  foco y deja inerte el resto de la página. Se cierra con Escape o tocando afuera, y el foco
  vuelve al botón ☰.
- Se prefieren elementos nativos a roles ARIA: `<dialog>`, `<progress>`, `<fieldset>` + `<legend>`
  para grupos de opciones, `<nav>`, `<table>` con `<caption>`.
- El link de la página actual lleva `aria-current="page"`.
- Resultados de quiz y práctica se anuncian con una región `aria-live="polite"`.
- Las caras ocultas de las tarjetas llevan `aria-hidden`.
- Foco visible siempre (`:focus-visible`), nunca `outline: none` sin reemplazo.
- Se respeta `prefers-reduced-motion`.
- Contraste mínimo AA en los dos temas (claro y oscuro).
- El linter (`oxlint` con el plugin `jsx-a11y`) tiene que pasar sin errores.

## 6. Estilo visual

- Paleta: azul índigo (藍, `--ai`), verde matcha (`--matcha`) para "bien", rojo
  (`--beni`) para "mal" o "irregular", sobre gris azulado claro (`--paper`).
- Tipografías: **Klee One** para japonés (estilo de libro de texto) y **Figtree** para la
  interfaz.
- Tema claro y oscuro con los mismos tokens.
- Tiene que funcionar a 400 px de ancho, con margen lateral de 16 px y sin scroll horizontal.

## 7. Flujo de trabajo

1. **Secciones o cambios grandes nuevos:** primero se muestra una vista previa en el chat y se
   publica solo cuando se aprueba.
2. Cambios chicos o pedidos explícitos ("agregalo"): se publican directo.
3. Antes de subir: `npm run lint`, `npm test` y `npm run build` tienen que pasar.
4. Ramas: `main` es lo publicado. Los cambios grandes van en una rama y se integran con PR.
5. El deploy a GitHub Pages es automático al hacer push a `main` (GitHub Actions).
6. Mensajes de commit en español, en imperativo ("Agrega…", "Corrige…").

## 8. Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor local
npm run lint       # oxlint (incluye jsx-a11y)
npm test           # vitest
npm run build      # chequeo de tipos + build de producción en dist/
```
