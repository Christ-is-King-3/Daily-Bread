"""Maintain one GitHub issue for stories that lack an authored biblical reflection.
GitHub Actions supplies GITHUB_TOKEN; no personal credentials or paid API.
"""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[1]
feed = json.loads((ROOT/'content/news.json').read_text(encoding='utf-8'))
pending = feed.get('pendingStories', [])
coverage = feed.get('coverage', {})
token = os.environ.get('GITHUB_TOKEN', '')
repo = os.environ.get('GITHUB_REPOSITORY', '')
title = 'Daily Bread: news stories awaiting biblical editorial review'
if not token or not repo:
    print(f"Coverage: {coverage}. Pending: {len(pending)}. No GitHub token; skipping issue update.")
    raise SystemExit(0)

def api(method, endpoint, payload=None):
    url = f'https://api.github.com/repos/{repo}/{endpoint}'
    body = json.dumps(payload).encode('utf8') if payload is not None else None
    req = Request(url, data=body, method=method,
                  headers={'Authorization': f'Bearer {token}',
                           'Accept': 'application/vnd.github+json',
                           'X-GitHub-Api-Version': '2022-11-28',
                           'User-Agent': 'DailyBreadEditorial/1.0',
                           'Content-Type': 'application/json'})
    with urlopen(req, timeout=20) as response:
        return json.load(response)

issues = api('GET', 'issues?state=all&per_page=100')
existing = next((issue for issue in issues if issue.get('title') == title and 'pull_request' not in issue), None)

if pending:
    lines = [
      'Automatically updated by the news refresh workflow.',
      '',
      '**These headlines are not published as biblical reflections because an adequate match is missing.**',
      'Do not generate a generic Scripture paragraph from an unfamiliar headline.',
      'Read the original source, check the event-specific facts, study relevant Scripture',
      'in context, write a concise distinct reflection, then add an editorial override',
      'to `content/editorial.json` keyed by the exact source URL.',
      '',
      f"- Feed updated: {feed.get('updated', 'unknown')}",
      f"- Stories with a commentary profile: {coverage.get('published', 'unknown')}",
      f"- Awaiting editorial review: {len(pending)}",
      f"- Individually reviewed story reflections: {coverage.get('individuallyReviewed', 0)}",
      '',
      '### Outstanding headlines',
    ]
    for i, story in enumerate(pending, 1):
        name = story['title'].replace('[', '(').replace(']', ')')
        lines.append(f"{i}. [{name}]({story['url']}) — {story.get('publisher','source unknown')}")
    body = '\n'.join(lines)
    if existing:
        api('PATCH', f"issues/{existing['number']}", {'body':body,'state':'open'})
        print(f"Updated editorial queue issue #{existing['number']} with {len(pending)} headlines.")
    else:
        issue = api('POST','issues',{'title':title,'body':body})
        print(f"Created editorial queue issue #{issue['number']} with {len(pending)} headlines.")
elif existing and existing['state'] == 'open':
    api('PATCH',f"issues/{existing['number']}",{'state':'closed',
        'body':f"All published headlines have a matching profile at {feed.get('updated', 'unknown')}. Continue verifying content quality independently."})
    print('Closed empty editorial queue issue.')
else:
    print('No unmatched news stories.')
