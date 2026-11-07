"""Static integrity checks for Daily Bread deployment assets."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
html = "\n".join((root / name).read_text(encoding="utf-8") for name in ["index.html", "news.html", "church.html", "journal.html", "scripture.html"]) + (root / "assets/site.js").read_text(encoding="utf-8")
required = ["id=\"verse-text\"", "id=\"headlines\"", "id=\"church-news\"", "id=\"posts\"", "id=\"results\"", "id=\"peace\"", "id=\"action\"", "content/bible.json", "content/news.json", "content/posts.json"]
for token in required:
    assert token in html, f"Missing required UI or data reference: {token}"
posts = json.loads((root / "content/posts.json").read_text(encoding="utf-8"))
assert isinstance(posts, list)
for post in posts:
    assert all(post.get(k) for k in ("title", "author", "date", "body")), "Incomplete journal post"
news = json.loads((root / "content/news.json").read_text(encoding="utf-8"))
assert isinstance(news.get("items"), list)
for item in news["items"]:
    assert item.get("url", "").startswith("https://"), "Invalid news URL"
    assert item.get("title") and item.get("publisher"), "Incomplete news item"
books = json.loads((root / "content/bible.json").read_text(encoding="utf-8"))
structure = json.loads((root / "content/bible-structure.json").read_text(encoding="utf-8"))
assert len(books) == len(structure) == 66, "Expected 66 Bible books"
assert len({b['name'] for b in books}) == 66, "Duplicate Bible book"
assert sum(len(b['chapters']) for b in books) == 1189
assert sum(len(c) for b in books for c in b['chapters']) == 31102
for book, expected in zip(books, structure):
    assert book['name'] == expected['name'], "Incorrect Bible book order"
    assert list(map(len, book['chapters'])) == expected['versesPerChapter'], book['name']
    assert all(isinstance(v, str) and v.strip() for c in book['chapters'] for v in c), book['name']
print("Bible verified: 66 books, 1,189 chapters, 31,102 nonempty verses.")
import hashlib
artworks = json.loads((root / 'content/artworks.json').read_text(encoding='utf-8-sig'))
assert len(artworks) == 5
assert 'commons.wikimedia.org/w/api.php' not in html
credits = (root / 'artwork-credits.html').read_text(encoding='utf-8')
for art in artworks:
    image = (root / art['image']).read_bytes()
    assert image.startswith(b'\xff\xd8\xff') and image.endswith(b'\xff\xd9'), 'Invalid JPEG'
    assert hashlib.sha256(image).hexdigest() == art['sha256'], 'Changed image; reverify rights'
    record = json.loads((root / f"content/artwork-sources/{art['id']}.json").read_text(encoding='utf-8-sig'))
    assert record['isPublicDomain'] is True and record['objectID'] == art['id']
    assert record['primaryImageSmall'] == art['imageSource']
    assert art['rights'] == 'CC0 1.0'
    assert f'src="{art["image"]}"' in html and art['source'] in html
    assert art['credit'] in credits and art['rightsUrl'] in credits
editorial = json.loads((root / "content/editorial.json").read_text(encoding="utf-8"))
assert isinstance(editorial.get("reviewedStories"), list)
for item in editorial["reviewedStories"]:
    assert item.get("url", "").startswith("https://")
    assert item.get("editorialCategory") in ("hope", "hardship")
# Validate the inline browser JavaScript without running network-dependent code.
import subprocess, tempfile
script = (root / "assets/site.js").read_text(encoding="utf-8")
assert script.strip(), "Missing application JavaScript"
with tempfile.TemporaryDirectory() as directory:
    js = Path(directory) / 'app.js'
    js.write_text(script, encoding='utf-8')
    subprocess.run(["node", "--check", str(js)], check=True)
print("Daily Bread static checks passed.")
subprocess.run([__import__('sys').executable, str(root / 'scripts/check_art.py')], check=True)
subprocess.run(['node', '--check', str(root / 'assets/news.js')], check=True)
subprocess.run(['node', '--check', str(root / 'assets/scripture-search.js')], check=True)
subprocess.run(['node', '--check', str(root / 'assets/christian-art.js')], check=True)
subprocess.run(['node', str(root / 'scripts/test_news.js')], check=True)
subprocess.run(['node', str(root / 'scripts/test_scripture.js')], check=True)
assert 'data-topic-query="anxiety"' in html, 'Missing topic search suggestions'
assert 'id="search-help"' in html, 'Missing guided-search description'
assert 'id="latest-headlines"' in html and 'tabindex="-1"' in html, 'Missing news reflection navigation'

subprocess.run(["node", str(root / "scripts/test_quizzes.js")], check=True)

for name in ["crossword.js", "reading-quiz.js", "site.js"]:
    subprocess.run(["node", "--check", str(root / "assets" / name)], check=True)
