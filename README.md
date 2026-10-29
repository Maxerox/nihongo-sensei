# Nihongo Sensei 日本語先生

App para estudiar *Minna no Nihongo* (lecciones 1–19): vocabulario, kanji, gramática, partículas, contadores y fechas.

**Publicada en:** https://maxerox.github.io/nihongo-sensei/

## Secciones

| Sección | Ruta | Qué tiene |
| --- | --- | --- |
| 単語 Vocabulario | `#/vocabulario` | Tarjetas, quiz y lista. Progreso guardado ("Lo sé" / "Repasar"). |
| 漢字 Kanji | `#/kanji` | Los 104 kanji de las unidades 1–10 del libro de kanji: tarjetas de lecturas y significados, dibujo con corrección del orden, la dirección y la forma de cada trazo, y lista. |
| 文法 Gramática | `#/gramatica` | Cheatsheet por lección con ejemplos, tablas de conjugación y buscador. |
| 数 Contadores y fechas | `#/contadores` | Contadores del 1 al 10 con las lecturas irregulares resaltadas, días del mes, meses y práctica. |
| 助詞 Partículas | `#/particulas` | Usos de cada partícula, comparaciones y práctica filtrada por lección. |

Todos los kanji llevan furigana, y fuera de la sección Kanji solo se usan los kanji de las unidades 1–8 del libro de kanji.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173/nihongo-sensei/
npm run lint       # oxlint con reglas de accesibilidad (jsx-a11y)
npm test           # vitest: furigana, kanji y validación del contenido
npm run build      # build de producción en dist/
```

Hecha con React, TypeScript, Vite, SCSS Modules y React Router.

## Cómo está organizada

- `src/components/` en capas de *atomic design*: `atoms`, `molecules`, `organisms`, `templates`. Cada componente tiene su carpeta con su `.module.scss`.
- `src/pages/` tiene una página por sección.
- `src/data/` tiene todo el contenido en JSON: `vocabulary`, `grammar`, `particles`, `counters`, `kanji`, `kanji-book` y `kanji-strokes`.
- `src/shared/` tiene las utils (furigana, kanji, voz, almacenamiento…), los hooks y los tipos.

Las reglas del proyecto están en **[CONVENTIONS.md](./CONVENTIONS.md)**.

## Créditos

Los datos de trazos (`src/data/kanji-strokes.json`) se generaron a partir de [KanjiVG](https://kanjivg.tagaini.net), © Ulrich Apel, con licencia [Creative Commons Attribution-ShareAlike 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Ese archivo se distribuye con la misma licencia.

## Deploy

Cada push a `main` corre lint, tests y build, y publica en GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`).
