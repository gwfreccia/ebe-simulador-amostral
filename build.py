"""Build the portable Pages entry point using only repository-owned files."""
from pathlib import Path
import base64
import json
import re

ROOT=Path(__file__).resolve().parent
def inline_asset(name,mime):
    return 'data:'+mime+';base64,'+base64.b64encode((ROOT/'assets'/name).read_bytes()).decode()

css=(ROOT/'src/style.css').read_text()
for name in re.findall(r"url\('assets/([^']+)'\)",css):
    css=css.replace('assets/'+name,inline_asset(name,'font/woff2'))
study=json.loads((ROOT/'src/cases/attarieh-2026.json').read_text())
page=(ROOT/'src/page.template').read_text()
parts={
    '__CSS__':css,
    '__LOGO__':inline_asset('ebe.png','image/png'),
    '__CASE_DATA__':json.dumps(study,ensure_ascii=False).replace('<','\\u003c'),
    '__CONCEPTS__':(ROOT/'src/concepts.json').read_text(),
    '__STATS__':(ROOT/'src/stats.js').read_text(),
    '__PLANNING__':(ROOT/'src/planning.js').read_text(),
    '__APP__':(ROOT/'src/app.js').read_text(),
}
for marker,value in parts.items():
    assert page.count(marker)==1,marker
    page=page.replace(marker,value)
assert not re.search(r'__[A-Z0-9_]+__',page),'Unbuilt template marker'
assert '/Users/' not in page and 'file://' not in page,'Local path in public HTML'
assert not re.search(r'<script[^>]*src=',page),'External script in portable HTML'
(ROOT/'index.html').write_text(page)
print('index.html pronto:',len(page.encode()),'bytes')
