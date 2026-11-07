# Browser smoke tests

Run `npm ci`, `npx playwright install chromium`, then `npm run test:browser`.
Playwright starts the included Node static server automatically. Python is required only for the existing content integrity checks.
The GitHub Actions browser workflow also runs the existing Python and Node content checks.

The suite uses Chromium at 1440 × 1000 and 390 × 844, with no retries. News and
editorial responses are fixed local fixtures; no publisher or live RSS request
is required. The date is fixed to 6 November 2026 so daily art rotation cannot
change the passage used by the navigation test. Bible, posts, artwork and scripts
are the actual repository files. Browser exceptions, console errors, failed
requests and same-origin HTTP failures fail the tests. Navigation cancellations
are excluded because browsers may cancel images from the page being left.

Coverage includes the verse/quiz homepage and dedicated section pages; anxiety, grief, strength and
confidence searches; exact references; saved verses; headline reflection focus
and scrolling; both response pathways; Church report navigation; an incoming
passage after asynchronous journal/news layout changes; journal expansion;
dark-mode persistence; artwork loading, details and credit links; gallery
pagination and empty search; artwork date controls; and horizontal overflow.

`BASE_URL=https://christ-is-king-3.github.io/Daily-Bread/ npm run test:browser`
checks a deployed copy with the same deterministic news fixtures. This does not
verify freshness or factual accuracy of live reporting. Separately inspect the
live news feed during release QA. Responsive Chromium testing does not replace
testing Safari, Firefox or a physical phone.

The workflow uploads `browser-evidence` for 14 days: an HTML report, screenshots,
and traces for failures. Tests retain a dark gallery screenshot even on success.
Do not commit `node_modules`, `test-results` or `playwright-report`.

Version 4 adds crossword and reading-quiz tests in `quizzes.spec.js`, including a simulated UK midnight in BST while the browser uses America/Los_Angeles. Screenshot evidence is retained for the homepage, crossword and passage quiz in both viewports. The crossword archive tests fix the clock to 8 November 2026 and revisit its first archived day.

Release validation on 7 November 2026: all 16 Chromium desktop/mobile checks passed; the full content audit and 1,098 crossword checks passed. Live deployment is checked separately from these local results.
