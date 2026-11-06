"""Fetch a public-domain KJV Bible and source-linked news headlines.
Does not generate AI interpretations or automatically allege persecution.
"""
import json, urllib.request, urllib.parse, xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]/'content'
HEADERS={'User-Agent':'DailyBreadEditorial/1.0 (static site; contact repository owner)'}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=22) as r: return r.read()
# KJV public-domain text: upstream dataset format is books[{name,chapters:[[verse,...],...]}]
p=ROOT/'bible.json'
if not p.exists():
    try:
        raw=json.loads(get('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'))
        books=[]
        for b in raw:
            if isinstance(b.get('chapters'),list): books.append({'name':b['name'],'chapters':b['chapters']})
        if len(books)==66:
            p.write_text(json.dumps(books,ensure_ascii=False,separators=(',',':')),encoding='utf8')
            print('Saved',sum(len(c) for b in books for c in b['chapters']),'KJV verses')
        else: print('Unexpected Bible dataset; keeping fallback')
    except Exception as e: print('Bible fetch failed:',e)
queries=[('UK','UK breaking news'),('World','world humanitarian crisis'),('Christian world','Christian church charity faith community'),('Christian world','Christian persecution religious freedom')]
items=[]; seen=set()
for section,q in queries:
    try:
        u='https://news.google.com/rss/search?q='+urllib.parse.quote(q)+'&hl=en-GB&gl=GB&ceid=GB:en'
        tree=ET.fromstring(get(u))
        for x in tree.findall('./channel/item')[:9]:
            title=(x.findtext('title') or '').strip(); link=(x.findtext('link') or '').strip()
            source=x.find('source'); publisher=source.text if source is not None else 'News publisher'
            if not title or not link or title in seen or not link.startswith('https://'):continue
            seen.add(title)
            items.append({'title':title,'url':link,'publisher':publisher,'date':x.findtext('pubDate') or '', 'section':section})
    except Exception as e: print('Feed error',q,e)
if items:
    (ROOT/'news.json').write_text(json.dumps({'updated':datetime.now(timezone.utc).isoformat(),'items':items},ensure_ascii=False,indent=2),encoding='utf8')
    print('Saved',len(items),'headlines')
else: print('No feeds available; preserving prior data')
