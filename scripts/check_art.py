"""Offline archive integrity: rights, credits, local assets and generated page links."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
import subprocess
ROOT = Path(__file__).resolve().parents[1]
works = json.loads((ROOT / 'content/art-collection.json').read_text(encoding='utf-8'))
assert len(works) >= 100, 'Archive should contain at least 100 reviewed works'
assert len({w['id'] for w in works}) == len(works)
assert sorted(w['sequence'] for w in works) == list(range(len(works)))
assert len({w['sha256'] for w in works}) == len(works), 'Duplicate image files'
assert len({w['type'] for w in works}) == 7
page = (ROOT / 'art.html').read_text(encoding='utf-8')
class Elements(HTMLParser):
    def __init__(self):
        super().__init__(); self.cards = []; self.references = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if 'data-card' in values: self.cards.append(values['data-card'])
        for attr in ('src','href'):
            if attr in values: self.references.append(values[attr])
elements = Elements(); elements.feed(page)
assert elements.cards == [w['id'] for w in works], 'Rebuild art.html after editing the collection'
for ref in elements.references:
    if not ref.startswith(('https://','#')):
        assert (ROOT / ref.split('#')[0].split('?')[0]).is_file(), f'Broken local link: {ref}'
for w in works:
    assert all(w.get(k) for k in ('title','artist','date','medium','museum','credit','accession','topic','type','period','context','reflection','retrieved'))
    assert w['width'] >= 150 and w['height'] >= 150
    assert w['rights'] == 'CC0 1.0'
    assert w['rightsUrl'] == 'https://creativecommons.org/publicdomain/zero/1.0/'
    record = json.loads((ROOT / w['record']).read_text(encoding='utf-8'))
    if w['provider'] == 'met':
        assert record['isPublicDomain'] is True
        assert record['objectID'] == w['objectId']
        assert record['objectURL'] == w['source']
        assert record['primaryImageSmall'] == w['imageSource']
        assert record['creditLine'] == w['credit']
    elif w['provider'] == 'cma':
        assert record['share_license_status'] == 'CC0'
        assert record['id'] == w['objectId']
        assert record['url'] == w['source']
        assert record['creditline'] == w['credit']
        assert w['imageSource'] in [record['images'][k]['url'] for k in ('web','print') if record['images'].get(k)]
    else: raise AssertionError('Unknown rights provider')
    assert record['title'].strip() == w['title']
    for field, checksum in [('image','sha256'),('thumbnail','thumbnailSha256')]:
        path = (ROOT / w[field]).resolve()
        assert path.is_relative_to(ROOT.resolve())
        data = path.read_bytes()
        assert hashlib.sha256(data).hexdigest() == w[checksum], f'Corrupt image: {path}'
        assert (data[:3] == b'\xff\xd8\xff' and data[-2:] == b'\xff\xd9') if field == 'image' else (data[:4] == b'RIFF' and data[8:12] == b'WEBP')
assert 'href="art.html"' in (ROOT / 'index.html').read_text(encoding='utf-8')
for script in ('christian-art.js','scripture-search.js'):
    subprocess.run(['node','--check',str(ROOT/'assets'/script)],check=True)
subprocess.run(['node',str(ROOT/'scripts/test_art.js')],check=True)
print(f'Archive integrity passed: {len(works)} works; rights records, credits and every local image verified.')
