"""Static integrity checks for Daily Bread deployment assets."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
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
bible = root / "content/bible.json"
if bible.exists():
    books = json.loads(bible.read_text(encoding="utf-8"))
    assert len(books) == 66, "Expected 66 Bible books"
    count = sum(len(chapter) for book in books for chapter in book["chapters"])
    assert count > 30000, f"Bible unexpectedly short: {count}"
print("Daily Bread static checks passed.")
