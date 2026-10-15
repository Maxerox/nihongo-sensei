# Nihongo Sensei

Antes de cualquier cambio, leé y seguí **[CONVENTIONS.md](./CONVENTIONS.md)**.

Lo más importante, en resumen:

- React + TypeScript + Vite. Atomic design (`atoms` → `molecules` → `organisms` → `templates` → `pages`).
- Cada componente en su carpeta con su propio `*.module.scss`. Colores y tipografías solo desde los tokens.
- Cada sección es una página con su propia ruta.
- Todo el contenido de estudio vive en `src/data/*.json`, nunca escrito dentro de los componentes.
- Funciones reutilizables en `src/shared/utils` (puras y con tests) y hooks en `src/shared/hooks`.
- Japonés: solo kanji de las unidades 1–8 (`kanji.json`), y **siempre con furigana** usando `JpText`.
- Accesibilidad obligatoria: ARIA correcto, foco visible, teclado, `lang="ja"`, `aria-live` en quizzes.
- Textos de la interfaz en español rioplatense ("vos").
- Secciones nuevas o cambios grandes: mostrar una vista previa antes de publicar.
- Antes de subir: `npm run lint && npm test && npm run build`.
