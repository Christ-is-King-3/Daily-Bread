"""Four UK-working-hours site checks daily, with bounded recovery and GitHub issue tracking.

Runs in GitHub Actions. Checks every public HTML page, first-party assets, and
news/Bible datasets. Temporary network failures are retried. Persistent page
failures request a GitHub Pages rebuild; stale news triggers its refresh job.
Never asserts recovery until a subsequent HTTP check succeeds.
"""
from __future__ import annotations
import json
import os
import sys
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://christ-is-king-3.github.io/Daily-Bread/'
TITLE = 'Daily Bread: automatic site recovery needed'
TIMES = {9, 11, 13, 15}
MAX_AGE_HOURS = 12
TOKEN = os.environ.get('GITHUB_TOKEN', '')
REPO = os.environ.get('GITHUB_REPOSITORY', '')
MANUAL = os.environ.get('GITHUB_EVENT_NAME') == 'workflow_dispatch'

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.local = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for attr in ('href', 'src'):
            value = a.get(attr, '')
            if not value or value.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:')):
                continue
            parts = urlparse(urljoin(BASE, value))
            if parts.netloc == urlparse(BASE).netloc and parts.path.startswith('/Daily-Bread/'):
                self.local.add(unquote(parts.path.split('/Daily-Bread/', 1)[1]))

def request(url, method='GET', payload=None, retries=3, timeout=22):
    body = json.dumps(payload).encode('utf-8') if payload is not None else None
    headers = {'User-Agent': 'DailyBreadHealth/1.0', 'Accept': '*/*'}
    if 'api.github.com' in url:
        headers.update({'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json'})
    last = None
    for attempt in range(retries):
        try:
            req = Request(url, data=body, method=method, headers=headers)
            with urlopen(req, timeout=timeout) as response:
                data = response.read()
                if response.status not in (200, 201, 202, 204):
                    raise ValueError(f'Unexpected HTTP {response.status}')
                return data
        except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
            last = str(exc)
            if attempt + 1 < retries:
                time.sleep(2 ** attempt)
    raise RuntimeError(f'{url}: {last}')

def github(method, endpoint, payload=None):
    if not TOKEN or not REPO:
        raise RuntimeError('GitHub Actions token or repository is unavailable')
    data = request(f'https://api.github.com/repos/{REPO}/{endpoint}',
                   method=method, payload=payload, retries=2)
    return json.loads(data) if data else {}

def issue_report(problems, actions):
    if not TOKEN or not REPO:
        print('No GitHub API credentials; cannot create recovery issue.')
        return
    try:
        all_issues = github('GET', 'issues?state=all&per_page=100')
        existing = next((i for i in all_issues
                         if i.get('title') == TITLE and 'pull_request' not in i), None)
        if problems:
            lines = ['Automated UK-hours health check. Failed checks were retried.',
                     'Recovery actions are attempts, **not proof that the fault is fixed**.',
                     '', '### Problems'] + [f'- {p}' for p in problems]
            lines += ['', '### Recovery attempts'] + ([f'- {a}' for a in actions] or ['- No safe recovery available'])
            body = '\n'.join(lines)
            if existing:
                github('PATCH', f"issues/{existing['number']}", {'state':'open', 'body':body})
            else:
                github('POST', 'issues', {'title':TITLE, 'body':body})
        elif existing and existing['state'] == 'open':
            github('PATCH', f"issues/{existing['number']}",
                   {'state':'closed', 'body':'All automated checks passed on '
                    +datetime.now(timezone.utc).isoformat()+'.'})
    except Exception as exc:
        print('Could not update health issue:', exc)

def main():
    now = datetime.now(ZoneInfo('Europe/London'))
    if not MANUAL and (now.hour not in TIMES or now.minute > 55):
        print('Skipped: scheduled health checks run at 09:00, 11:00, 13:00 and 15:00 UK time. Current UK time:', now.isoformat())
        return 0
    problems, actions = [], []
    pages = sorted(p.name for p in ROOT.glob('*.html'))
    if not pages:
        problems.append('No HTML pages found in repository')
    print(f"Checking {len(pages)} public pages at {now.strftime('%Y-%m-%d %H:%M %Z')}")

    failed_pages = []
    for page in pages:
        try:
            html = request(urljoin(BASE, page)).decode('utf-8', 'replace')
            if '<html' not in html.lower() or '</html>' not in html.lower():
                raise ValueError('Invalid or incomplete HTML page')
            references = References()
            references.feed(html)
            missing = sorted(p for p in references.local if p and not (ROOT / p).is_file())
            if missing:
                raise ValueError('Missing linked assets: ' + ', '.join(missing[:10]))
            print('PASS', page)
        except Exception as exc:
            failed_pages.append(page)
            problems.append(f'{page}: {exc}')
            print('FAIL', page, exc)

    for endpoint in ('assets/site.js', 'assets/news.js', 'assets/scripture-search.js', 'assets/site.css'):
        try:
            data = request(urljoin(BASE, endpoint))
            if len(data) < 50:
                raise ValueError('Unexpectedly empty asset')
        except Exception as exc:
            problems.append(f'{endpoint}: {exc}')

    try:
        feed = json.loads(request(urljoin(BASE, 'content/news.json')))
        stamp = datetime.fromisoformat(feed['updated'].replace('Z', '+00:00'))
        age = (datetime.now(timezone.utc) - stamp).total_seconds() / 3600
        if age > MAX_AGE_HOURS:
            problems.append(f'News feed is {age:.1f} hours old (limit {MAX_AGE_HOURS})')
            if TOKEN and REPO:
                try:
                    github('POST', 'actions/workflows/update.yml/dispatches', {'ref':'main'})
                    actions.append('Requested the news refresh GitHub Actions workflow')
                except Exception as exc:
                    actions.append(f'News refresh request failed: {exc}')
        if not feed.get('items'):
            problems.append('News feed is empty')
    except Exception as exc:
        problems.append(f'News dataset check: {exc}')

    try:
        bible = json.loads(request(urljoin(BASE, 'content/bible.json'), timeout=40))
        books = len(bible)
        count = sum(len(chapter) for book in bible for chapter in book.get('chapters', []))
        if books != 66 or count != 31102:
            problems.append(f'Bible structure invalid: {books} books, {count} verses')
    except Exception as exc:
        problems.append(f'Bible dataset check: {exc}')

    if failed_pages and TOKEN and REPO:
        try:
            github('POST','pages/builds',{})
            actions.append('Requested a fresh GitHub Pages build')
            time.sleep(10)
            for page in failed_pages:
                try:
                    request(urljoin(BASE,page), retries=2)
                    problems = [p for p in problems if not p.startswith(page+':')]
                    actions.append(f'{page}: now responding to HTTP requests; verify functionality separately')
                except Exception:
                    pass
        except Exception as exc:
            actions.append('Pages rebuild API unavailable; human review required: '+str(exc))

    issue_report(problems, actions)
    if problems:
        print('UNRESOLVED HEALTH PROBLEMS:')
        for p in problems: print('-', p)
        for a in actions: print('RECOVERY:', a)
        return 1
    print('PASS: all public pages, key assets, news freshness and KJV structure.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
