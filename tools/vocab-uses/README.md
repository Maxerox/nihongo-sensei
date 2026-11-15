# Conteo de "Más usadas"

`uses` en `src/data/vocabulary.json` dice cuántas veces aparece cada palabra en las
actividades del libro principal de Minna no Nihongo I, 2.ª edición (本冊): 文型, 例文, 会話,
練習 A/B/C, 問題 de las lecciones 1–25 y las respuestas y guiones de escucha del final.

El libro no está en el repo (tiene derechos de autor). Para regenerar el conteo hace falta
el PDF escaneado y Tesseract con el modelo `jpn` (tessdata_best):

```sh
python3 ocr_pages.py libro.pdf /ruta/a/tessdata ocr/        # páginas 34–246 y 271–326
python3 count_uses.py ocr/ ../../src/data/vocabulary.json uses.json
```

Después se copia `uses` de cada palabra a `vocabulary.json`.

Cómo cuenta (`count_uses.py`):

- Saca la furigana (texto chico) y las marcas de pista de audio ("CD05").
- Verbos y adjetivos cuentan con sus formas conjugadas (書きます, 書いて, 書かない, 書く,
  書いた, 書きたい · 大きい, 大きくて, 大きかった).
- Si la palabra tiene kanji, cuenta la forma en kanji; la forma en kana solo si tiene 3
  letras o más (した, ほん… chocarían con ました, にほん…).
- Un kanji suelto no cuenta dentro de otra palabra (本 en 日本, 山 en 山田).
- Las formas más largas van primero y lo encontrado se tacha (いきます no cuenta como きます).
- Contadores (―じ, ―まい…) solo detrás de un número. Partículas y sufijos con ～ (～から,
  ～さん…) no se cuentan.

Es un conteo aproximado (el OCR tiene errores), pero alcanza para ordenar las palabras.
