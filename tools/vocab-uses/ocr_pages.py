# OCR de las páginas de actividades, sin furigana (texto chico), una línea por renglón.
import sys,os,subprocess,json,statistics,concurrent.futures as cf
import pytesseract
from PIL import Image
pdf,td,outdir=sys.argv[1],sys.argv[2],sys.argv[3]
pages=list(range(34,247))+list(range(271,327))
os.makedirs(outdir,exist_ok=True)
def run(p):
    out=f'{outdir}/p{p:03d}.json'
    if os.path.exists(out): return p
    img=f'{outdir}/p{p:03d}'
    subprocess.run(['pdftoppm','-r','300','-gray','-png','-f',str(p),'-l',str(p),'-singlefile',pdf,img],check=True)
    im=Image.open(img+'.png')
    d=pytesseract.image_to_data(im,lang='jpn',config=f'--tessdata-dir {td} --psm 6',output_type=pytesseract.Output.DICT)
    toks=[(d['block_num'][i],d['par_num'][i],d['line_num'][i],d['left'][i],d['height'][i],t) for i,t in enumerate(d['text']) if t.strip()]
    hs=[h for *_,h,t in toks if len(t)>=1]
    med=statistics.median(hs) if hs else 0
    lines={}
    for b,pa,l,x,h,t in toks:
        if med and h<0.6*med: continue  # furigana
        lines.setdefault((b,pa,l),[]).append((x,t))
    text=[''.join(t for _,t in sorted(v)) for k,v in sorted(lines.items())]
    json.dump({'page':p,'lines':text},open(out,'w'),ensure_ascii=False)
    os.remove(img+'.png')
    return p
with cf.ThreadPoolExecutor(8) as ex:
    done=list(ex.map(run,pages))
print('listo',len(done))
