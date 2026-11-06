# Daily Bread — Website Version 3

## Release history

- **Version 3 — 6 November 2026:** Scripture-first editorial voice throughout the homepage, news commentary, journal and art reflections; stronger homepage section boundaries; direct headline-to-reflection navigation; Scripture search by prayer need, feeling, topic, words or chapter reference. Added Bible search tests and preserved the 218-work open-access art collection.
- **Version 2:** Full 66-book KJV, news feed and guidance pathways, journal, original five public-domain paintings and extended 218-work Christian art gallery.

## Editorial identity

Daily Bread exists to proclaim Jesus Christ as Lord and to encourage faithful discipleship under the authority of Scripture. The voice is unapologetically Christian: plain-speaking, serious about truth, repentance, personal responsibility, family, courage, stewardship, Christian ministry and love of neighbour. Conviction is grounded in the Bible rather than loyalty to a political party. The site distinguishes original Christian reflection from linked third-party reporting and does not present uncertain claims as fact. It respects the dignity and freedom of people of other beliefs while affirming the Christian conviction that salvation comes through Jesus Christ.

The homepage uses six numbered, visually distinct sections. Selecting a news headline automatically opens the Truth & Action response and scrolls to its prominently framed reflection. Visitors can switch to Comfort & Peace or return directly to the headlines. The response depends on the report subject; the site does not claim independent full-article verification.

## Scripture search by need

The complete 66-book public-domain KJV is available for literal text and direct reference search. The Scripture search also accepts questions or short descriptions of how a visitor feels, including anxiety, courage, confidence, strength, grief, prayer, faith, loneliness, duty and repentance. The matching engine uses **locally curated topic patterns and hand-selected biblical passages** rather than an AI model; it presents suggestions before other literal matches, with a clear disclaimer. Saved favourites still work, and direct references from the Christian Art gallery (including verse ranges and `Psalm` / `Psalms` aliases) are preserved.

Run `node scripts/test_scripture.js` to check that all 31,102 verses are unique and nonempty, curated references exist, and topical, literal, chapter and artwork links resolve. `python scripts/check_site.py` runs these tests automatically in GitHub Actions. A structural Bible audit does not verify the accuracy of every word of a published translation.


A responsive static Christian website with a daily Scripture passage, two user-selected guidance paths, source-linked news, a global Church news section, and an editor/guest journal.

## Publish on GitHub Pages

1. Create a **public** GitHub repository (for example `daily-bread`).
2. Upload the **contents** of this folder, keeping `index.html`, `content/`, `scripts/` and `.github/` at the repository root.
3. In **Settings → Pages**, select **Deploy from a branch**, `main`, `/ (root)`, then save.
4. Under **Actions**, enable workflows. In **Settings → Actions → General**, grant **Read and write permissions** to the `GITHUB_TOKEN` if required for automated commits. You may need to adjust branch protection to permit workflow commits.
5. Open **Actions → Update Bible and news content → Run workflow** once. This downloads the public-domain KJV dataset and retrieves source-linked news headlines. The workflow then runs every six hours (GitHub's scheduler is best-effort and may be delayed or paused on inactive public repositories).
6. Refresh your Pages site after the workflow commits. Allow a few minutes for Pages to redeploy.

**Without the first workflow run**, the daily Scripture uses a 12-verse starter set, and the news areas show an honest empty state. With `content/bible.json` installed, daily selection cycles deterministically through over 30,000 KJV verses before repeating. The passage changes according to each visitor's local date; after the cycle completes, verses repeat. This is not a guarantee of uninterrupted service forever.

## Publish a journal post

Open `content/posts.json` in your GitHub repository, click the pencil icon, and add a new object to the JSON array, using the existing post as a template. Each article has `id`, `title`, `author`, `role`, `date`, `category`, `excerpt`, `body` (array of paragraphs), and optional `scripture`. Commit the change; GitHub Pages will publish it. No daily posting requirement. Guest authors can submit copy to you for approval. **There is no private web publishing dashboard in this version.** GitHub access is required to edit the file.

## News and editorial standards

- `content/news.json` is updated from Google News RSS search results. It contains headlines, source links and publisher names; this is **not independently verified reporting** and should be checked against the source. Google News coverage is not exhaustive and may include irrelevant stories.
- Christian-world stories remain unclassified unless an editor adds a reviewed entry in `content/editorial.json` with the exact source URL and `editorialCategory: hope` or `hardship`. The classification applies if any retained source on a grouped story matches that URL and survives automatic refreshes. Guidance subjects are separate from these editorial classifications.
- Comfort & Peace and Truth & Action now change the Scripture, reflection, practical steps and prayer according to the selected report’s specific issue. `assets/news.js` contains authored responses for subjects such as emergency-worker attacks, aviation threats, interest-rate pressure, infectious illness, donation coercion, charity scrutiny and different humanitarian situations. These are headline-grounded Christian responses, **not full-article analysis or independently verified reporting**. Unknown subjects explicitly receive reading questions instead of a fabricated specific reflection. Editors can provide a complete `guidance.peace` / `guidance.action` override on a reviewed source entry, with `question`, `ref`, `body`, `steps` and `prayer`.
- The same grouping engine runs during refresh and in the browser. It combines canonical URL matches, normalized near-identical headlines and conservative event-specific aliases with date, place and report-edition safeguards. A story appears once, with other coverage retained under “more sources.” Shared words such as “church” or “Sudan” alone do not merge stories. This is deterministic grouping and authored guidance, not a paid or hidden AI service; unusually different paraphrases can still need editorial refinement.
- Avoid collective blame, unverified allegations, incitement, and treating contested political opinions as biblical certainties.

## Scripture and artwork

- The King James Version is public domain. ESV text is **not bundled**; each verse links to ESV.org. Full ESV display would require appropriate permissions/licensing.
- Five individually selected historical paintings are bundled in `assets/art/`, so no third-party image service or browser search is needed. The Metropolitan Museum of Art marks each work public domain and releases its Open Access images under CC0. See `artwork-credits.html` for artist, title, date, museum credit, provenance links and rights information. `content/artworks.json` records download URLs, retrieval date and SHA-256 checksums; `content/artwork-sources/` preserves the museum API records. Replace images only after checking the individual museum rights record and updating the manifest and credits.
- The bundled Protestant KJV dataset contains **66 books, 1,189 chapters and 31,102 verses**. See `BIBLE-AUDIT.md` for all book totals. `content/bible-structure.json` records expected verse counts for every chapter. The validator rejects missing files, empty verses, changed chapter lengths, duplicate books and incorrect ordering. This checks structural completeness, not word-for-word textual accuracy.

## Validation

Run `python scripts/check_site.py` with Python 3 and Node.js installed. This checks Bible structure, content integrity, bundled artwork checksums and saved public-domain records, attribution links, and JavaScript syntax. The same command runs in GitHub Actions. Browser verification is still needed for visual layout and interaction behavior.

## Christian Art collection

`art.html` is the dedicated Christian Art tab, with **218 reviewed historical works** from five collections: The Metropolitan Museum of Art (17), Cleveland Museum of Art (114), National Gallery of Art, Washington (31), Walters Art Museum (51) and J. Paul Getty Museum (5). The archive includes Ethiopian, Armenian, Byzantine and European Christian imagery. All 218 works have individually written reflections grounded in their subjects and visible details. The seven art forms include paintings and icons, drawings, prints and Bible illustrations, manuscripts and books, stained glass, sacred textiles and sculpture. The exact source image and museum reuse terms are preserved for every work. National Gallery images are identified as public domain under NGA Open Access; the other four collections release the included images under CC0. Collection-source credits are separate from reuse rights. Saved metadata, full credits, image checksums, editorial introductions and reflection prompts are in `content/art-collection.json` and `content/art-archive-sources/`.

The daily feature follows the visitor's local date and cycles through the collection without repetition for 218 days while the collection is unchanged. Date controls allow browsing other days; an open tab updates after midnight or when it wakes. This needs no scheduled download or paid service. The archive supports combined search, subject, art-form, period and collection-source filters, plus an accessible enlarged view with detail zoom and Scripture links. All images are served locally, with small WebP thumbnails and larger manuscript copies. The static archive and museum links remain usable without JavaScript.

To add a work, first verify the **exact digital image's** reuse designation on its museum record. Save that record, the permitted image and a thumbnail; add the complete credit, source, rights, dimensions, checksums and a unique appended `sequence` to the manifest. Preserve qualified attributions such as “after” or “attributed to.” Historical context and Daily Bread reflections are separate fields; only add a Bible link when it has been checked. Rebuild the static archive using `python scripts/build_art_gallery.py`, then run `python scripts/check_site.py`. Changing the collection size changes the date-to-work rotation; adding images is an editorial release, not an automatic search.

The quality gate checks every archive image, thumbnail, credit and rights record, all local page links, the complete rotation, calendar boundaries, combined filters and Bible passage links. Keep `art.html` and its manifest together in a commit. Existing artwork sections and their five original files are retained.

## Cost and limitations

GitHub Pages hosting is free for eligible public repositories. RSS feeds and external publisher links may change. There is no server-side AI, paid API, subscriber account system or private editor dashboard. Scheduled workflows may be paused or delayed. The website does not refresh itself in an already-open tab at midnight; a page reload shows the next verse.
