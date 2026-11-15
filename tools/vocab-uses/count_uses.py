# Cuenta cuántas veces aparece cada palabra del vocabulario en el texto de las actividades
# (OCR del libro principal). Reconoce conjugaciones de verbos y adjetivos.
import json, re, sys, glob, collections

ocr_dir, vocab_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
vocab = json.load(open(vocab_path, encoding='utf-8'))['words']

pages = []
for f in sorted(glob.glob(ocr_dir + '/p*.json')):
    d = json.load(open(f, encoding='utf-8'))
    text = '\n'.join(re.sub(r'\s+', '', l) for l in d['lines'])
    # Arreglos típicos del OCR
    text = text.replace('〜', '～').replace('<', 'く').replace('リ', 'り')
    # Marcas de pista de audio del libro ("CD05", "CD1-23"): no son la palabra CD.
    text = re.sub(r'C\s*D\s*[0-9O０-９]+(?:\s*[-‐]\s*[0-9]+)?', '', text)
    pages.append(text)
corpus = '\n'.join(pages)

ROW = {  # fila i → (u, a, te, ta)
    'い': ('う', 'わ', 'って', 'った'), 'ち': ('つ', 'た', 'って', 'った'), 'り': ('る', 'ら', 'って', 'った'),
    'み': ('む', 'ま', 'んで', 'んだ'), 'び': ('ぶ', 'ば', 'んで', 'んだ'), 'に': ('ぬ', 'な', 'んで', 'んだ'),
    'き': ('く', 'か', 'いて', 'いた'), 'ぎ': ('ぐ', 'が', 'いで', 'いだ'), 'し': ('す', 'さ', 'して', 'した'),
}
NUM = r'(?:[0-9０-９]+|[一二三四五六七八九十百千万何]+|なん|いく)'


def clean(s):
    """Saca aclaraciones ［…］, la parte opcional y los ～."""
    if not s:
        return []
    out = []
    for part in s.split('／'):
        part = re.sub(r'（[^）]*）', '', part)
        full = re.sub(r'[［\[]([^］\]]*)[］\]]', r'\1', part)       # con lo opcional
        short = re.sub(r'[［\[][^］\]]*[］\]]', '', part)           # sin lo opcional
        for x in {full, short}:
            x = re.sub(r'[～〜―…。、？！\s]', '', x)
            if x:
                out.append(x)
    return out


def verb_forms(base, group):
    if not base.endswith('ます'):
        return [re.escape(base)]
    stem = base[:-2]
    if not stem:
        return []
    if group == 2:
        return [re.escape(stem) + '(?=[まてたなるらよれ])']
    if group == 3:
        if stem.endswith('し'):
            noun = stem[:-1]
            forms = [re.escape(noun) + '(?:し[まてたな]|する|しよ|すれ|さ[せれ])'] if noun else ['(?:し[まてたな]|する|しよう)']
            if len(noun) >= 2:
                forms.append(re.escape(noun))  # 勉強, 散歩… solos también son la misma palabra
            return forms
        # きます (来ます) y compuestos: 持って来ます, 帰って来ます
        head = stem[:-1]
        return [re.escape(head) + '(?:来[まてたなるれ]|き[まてた]|くる|こな)'] if head else ['来[まてたなるれ]']
    # Grupo I
    last = stem[-1]
    if last not in ROW:
        return [re.escape(stem) + 'ま']
    u, a, te, ta = ROW[last]
    head = stem[:-1]
    if base in ('いきます', '行きます'):
        te, ta = 'って', 'った'
    forms = [re.escape(stem) + '(?:ま|たい|たく|なが)', re.escape(head + u), re.escape(head + a) + 'な',
             re.escape(head + te), re.escape(head + ta)]
    return forms


def adj_i_forms(base):
    if base in ('いい', 'よい'):
        return ['いい', 'よ(?:く|かった)', '良[いくか]']
    if not base.endswith('い'):
        return [re.escape(base)]
    stem = base[:-1]
    return [re.escape(stem) + '(?:い|く|かった|そう)']


patterns = collections.defaultdict(set)  # regex → ids
skipped = []
for w in vocab:
    cat = w['category']
    kana, kanji = clean(w['kana']), clean(w.get('kanji', ''))
    if cat == 'other' and re.match(r'^[～―]', w['kana']):
        # Contadores (―じ, ―まい…): solo detrás de un número (3まい, 何人…).
        # Partículas y sufijos con ～ (～から, ～さん…) no se cuentan: son gramática, no vocabulario.
        if w['kana'].startswith('～') or re.search(r'[～―]$', w['kana']):
            skipped.append(w['id'])
            continue
        for f in set(kana + kanji):
            patterns[NUM + re.escape(f)].add(w['id'])
        continue
    # Si la palabra tiene kanji, el libro la escribe con kanji: las formas en kana cortas
    # (した, ほん, かみ…) chocarían con otras cosas (ました, …), así que solo se cuentan si son largas.
    surfaces = kanji + ([k for k in kana if len(k) >= 3] if kanji else kana)
    forms = []
    for s in surfaces:
        if cat == 'verb':
            forms += verb_forms(s, w.get('verbGroup'))
        elif cat == 'adj-i':
            forms += adj_i_forms(s)
        elif cat == 'adj-na':
            forms.append(re.escape(s.replace('な', '') if s.endswith('な') else s))
        else:
            if re.fullmatch(r'[\u4e00-\u9fff々]+', s):
                # Kanji solo: no cuenta dentro de otra palabra (本 en 日本, 山 en 山田).
                forms.append(r'(?<![\u4e00-\u9fff])' + re.escape(s) + r'(?![\u4e00-\u9fff々])')
            else:
                forms.append(re.escape(s))
    if w['kana'] == 'じゃ':
        forms = ['じゃ(?!あ|ない)']  # "entonces", no じゃありません
    for f in forms:
        if re.fullmatch(r'[0-9０-９]+', f.replace('\\', '')):
            continue  # 10 (とお), 1つ…: los números sueltos no dicen qué palabra es
        literal = re.sub(r'\\|\(\?<?[:=!][^)]*\)|\[[^\]]*\]', '', f)
        # Palabras de 1 sola kana sin kanji: imposibles de distinguir en el texto.
        if len(literal) <= 1 and not re.search(r'[\u4e00-\u9fff]', literal):
            continue
        patterns[f].add(w['id'])

# Primero las formas más largas, y lo encontrado se tacha: así いきます no cuenta también きます.
def weight(p):
    return len(re.sub(r'\\|\(\?<?[:=!][^)]*\)|\[[^\]]*\]', '', p))

counts = collections.Counter()
text = corpus
for p in sorted(patterns, key=weight, reverse=True):
    rx = re.compile(p)
    found = rx.findall(text)
    if found:
        text = rx.sub(lambda m: '□' * len(m.group(0)), text)
        for i in patterns[p]:
            counts[i] += len(found)

res = {w['id']: counts.get(w['id'], 0) for w in vocab if w['id'] not in skipped}
json.dump({'uses': res, 'skipped': skipped}, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
top = sorted(((c, w['kana'], w['lesson']) for w in vocab for c in [res.get(w['id'], -1)]), reverse=True)
print('páginas:', len(pages), 'caracteres:', len(corpus))
print('sin contar (partículas/sufijos):', len(skipped))
print('con 0 usos:', sum(1 for v in res.values() if v == 0))
print('top 40:', ' '.join(f'{k}({c})' for c, k, l in top[:40]))
