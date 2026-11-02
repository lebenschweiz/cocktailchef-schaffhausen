#!/usr/bin/env python3
"""Baut die englische und russische Version aus den deutschen Seiten.

Deutsch ist die Grundsprache. Nach jeder Änderung an den deutschen Seiten:
    python3 i18n/extract.py   # aktualisiert i18n/_segments.json
    python3 i18n/build.py     # schreibt en/*.html und ru/*.html
Übersetzungen stehen in i18n/en.json und i18n/ru.json (deutscher Text -> Übersetzung).
Neue, noch nicht übersetzte Texte werden aufgelistet und bleiben deutsch.
"""
import html, json, os, re, sys
from urllib.parse import quote, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
PAGES = ['index.html', 'behandlungen.html', 'vorher-nachher.html', 'galerie.html', 'kontakt.html', 'datenschutz.html', 'impressum.html']
LANGS = {'en': ('English', 'en_GB', 0), 'ru': ('Русский', 'ru_RU', 1)}
BASE = 'https://lebenschweiz.github.io/erikas-beautyloft/'
ATTRS = ['alt', 'aria-label', 'title', 'placeholder']
META_CONTENT = re.compile(r'<meta\s+(?:name="description"|property="og:(?:title|description|site_name)")')

segments = json.load(open('i18n/_segments.json', encoding='utf-8'))
ui = json.load(open('i18n/ui-src.json', encoding='utf-8'))


def load(lang):
    d = json.load(open(f'i18n/{lang}.json', encoding='utf-8'))
    m = dict(d)  # Schlüssel = deutscher Originaltext
    for de, tr in ui.items():
        m.setdefault(de, tr[LANGS[lang][2]])
    return m


def norm(s):
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def switcher(page, cur):
    """Sprachumschalter; Links relativ zur aktuellen Sprache."""
    out = []
    for code in ['de', 'en', 'ru']:
        if code == cur:
            href = page
        elif cur == 'de':
            href = f'{code}/{page}'
        elif code == 'de':
            href = f'../{page}'
        else:
            href = f'../{code}/{page}'
        attrs = ' aria-current="true"' if code == cur else ''
        out.append(f'<a href="{href}" hreflang="{code}" lang="{code}"{attrs}>{code.upper()}</a>')
    return '<div class="lang-switch" aria-label="Sprache">' + ''.join(out) + '</div>'


def add_switcher(s, page, cur):
    s = re.sub(r'<div class="lang-switch".*?</div>', '', s)
    s = re.sub(r'<link rel="alternate" hreflang=[^>]*>\n?', '', s)
    sw = switcher(page, cur)
    s = s.replace('<a class="btn" href="https://wa.me/', sw + '\n    <a class="btn" href="https://wa.me/', 1)
    s = re.sub(r'(<nav class="mobile-nav">.*?)(</nav>)', lambda m: m.group(1) + sw + m.group(2), s, count=1, flags=re.S)
    alts = ''.join(f'<link rel="alternate" hreflang="{c}" href="{BASE}{"" if c == "de" else c + "/"}{"" if page == "index.html" else page}">\n'
                   for c in ['de', 'en', 'ru'])
    alts += f'<link rel="alternate" hreflang="x-default" href="{BASE}{"" if page == "index.html" else page}">\n'
    return s.replace('</head>', alts + '</head>', 1)


def fix_path(v):
    if re.match(r'(https?:|mailto:|tel:|#|data:|\.\./|/)', v) or v.endswith('.html') or '.html#' in v or '.html?' in v:
        return v
    return '../' + v


def translate_wa(url, m, missing):
    def rep(mt):
        txt = unquote(mt.group(1))
        key = txt if txt.endswith('.') else txt + '.'
        tr = m.get(key) or m.get(txt)
        if not tr:
            missing.add(txt)
            return mt.group(0)
        return '?text=' + quote(tr.rstrip('.') if not txt.endswith('.') else tr, safe='')
    return re.sub(r'\?text=([^"&]*)', rep, url)


def build(page, lang, m, missing):
    s = open(page, encoding='utf-8').read()
    s = add_switcher(s, page, 'de')
    open(page, 'w', encoding='utf-8').write(s)  # DE bekommt den Umschalter auch

    s = add_switcher(s, page, lang)
    s = s.replace('<html lang="de">', f'<html lang="{lang}">', 1)
    s = s.replace('content="de_CH"', f'content="{LANGS[lang][1]}"')
    s = s.replace(f'content="{BASE}"', f'content="{BASE}{lang}/"')
    s = s.replace('aria-label="Sprache"', 'aria-label="Language"' if lang == 'en' else 'aria-label="Язык"')

    parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->|<[^>]+>)', s, flags=re.S)
    out = []
    for p in parts:
        if not p:
            continue
        if p.startswith('<script') or p.startswith('<style') or p.startswith('<!--'):
            if p.startswith('<script src="'):
                p = re.sub(r'src="([^"]+)"', lambda mt: f'src="{fix_path(mt.group(1))}"', p)
            out.append(p)
        elif p.startswith('<'):
            def attr(mt):
                name, val = mt.group(1), mt.group(2)
                if name in ('href', 'src', 'poster', 'srcset'):
                    if 'wa.me/' in val:
                        return f'{name}="{translate_wa(val, m, missing)}"'
                    return f'{name}="{fix_path(val)}"'
                if name in ATTRS or (name == 'content' and META_CONTENT.match(p)):
                    k = norm(val)
                    if k in m:
                        return f'{name}="{html.escape(m[k], quote=True)}"'
                return mt.group(0)
            p = re.sub(r'\b([a-zA-Z-]+)="([^"]*)"', attr, p)
            p = re.sub(r'url\((?!["\']?(?:https?:|data:|\.\./|#))(["\']?)', r'url(\1../', p)
            out.append(p)
        else:
            k = norm(p)
            if k and re.search('[A-Za-zÄÖÜäöü]', k):
                if k in m:
                    lead = re.match(r'\s*', p).group(0)
                    trail = re.search(r'\s*$', p).group(0)
                    p = lead + html.escape(m[k], quote=False) + trail
                elif k in segments:
                    missing.add(k)
            out.append(p)
    s = ''.join(out)
    s = s.replace(f'<script src="../script.js', f'<script src="../i18n/ui-{lang}.js"></script>\n<script src="../script.js', 1)
    os.makedirs(lang, exist_ok=True)
    open(f'{lang}/{page}', 'w', encoding='utf-8').write(s)


for lang in LANGS:
    m = load(lang)
    js = {de: tr[LANGS[lang][2]] for de, tr in ui.items()}
    open(f'i18n/ui-{lang}.js', 'w', encoding='utf-8').write('window.I18N_UI = ' + json.dumps(js, ensure_ascii=False) + ';\n')
    missing = set()
    for page in PAGES:
        build(page, lang, m, missing)
    ignore = {s for s in missing if not re.search('[a-zäöü]{3}', s) or s in m.values()}
    real = sorted(missing - ignore)
    print(f'{lang}: {len(PAGES)} Seiten gebaut' + (f', {len(real)} Texte ohne Übersetzung:' if real else ''))
    for t in real:
        print('   -', t[:90])
