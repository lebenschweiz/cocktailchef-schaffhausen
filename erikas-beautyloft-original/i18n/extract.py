import json,glob,re
from bs4 import BeautifulSoup, NavigableString, Comment
PAGES=['index.html','behandlungen.html','vorher-nachher.html','galerie.html','kontakt.html','datenschutz.html']
ATTRS=['alt','aria-label','title','placeholder','content']
def segs(path):
    soup=BeautifulSoup(open(path,encoding='utf-8').read(),'lxml')
    out=[]
    for t in soup.find_all(string=True):
        if isinstance(t,Comment): continue
        if t.parent.name in ('script','style','svg','path','title') and t.parent.name!='title': continue
        if t.find_parent(['script','style','svg']) : 
            if not (t.parent.name=='script' and 'ld+json' in str(t.parent.get('type'))): continue
            continue
        s=t.strip()
        if s and re.search('[A-Za-zÄÖÜäöü]',s): out.append(s)
    for tag in soup.find_all(True):
        for a in ATTRS:
            v=tag.get(a)
            if a=='content' and tag.name=='meta' and not (tag.get('name') in ('description',) or (tag.get('property') or '') in ('og:title','og:description','og:site_name')): continue
            if isinstance(v,str) and re.search('[A-Za-zÄÖÜäöü]',v) and not v.startswith('http'): out.append(v.strip())
    return out
if __name__=='__main__':
    seen=[]
    for p in PAGES:
        for s in segs(p):
            if s not in seen: seen.append(s)
    json.dump(seen,open('i18n/_segments.json','w'),ensure_ascii=False,indent=0)
    print(len(seen), sum(len(s) for s in seen))
