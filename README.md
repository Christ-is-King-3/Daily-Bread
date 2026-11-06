# Daily Bread — Website Version 2

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
- Headlines in `Christian world` are **unclassified** by default. To show an article under `Hope & Good News` or `Persecution & Hardship`, manually set `editorialCategory` to `hope` or `hardship` on the relevant item after reviewing the underlying source. Scheduled refreshes overwrite manually edited news entries, so for persistent editorial selections, build a separate curated file in a future version.
- The Comfort & Peace and Truth & Action pathways currently display **general**, fixed Bible-based reflections, not event-specific AI-generated commentary. Selecting a story gives context, but does not assert facts about that event.
- Avoid collective blame, unverified allegations, incitement, and treating contested political opinions as biblical certainties.

## Scripture and artwork

- The King James Version is public domain. ESV text is **not bundled**; each verse links to ESV.org. Full ESV display would require appropriate permissions/licensing.
- Historical artworks are searched dynamically from **Wikimedia Commons**, and each successful image includes a link to its file page and licensing information. The browser needs internet access. If unavailable, the section uses a typographic fallback. Search results should be reviewed before a public launch because an automatic search may choose an imperfect match or an image with specific reuse conditions. For production, select and credit individual verified public-domain paintings.

## Cost and limitations

GitHub Pages hosting is free for eligible public repositories. RSS feed and Wikimedia services are external and may change. There is no server-side AI, paid API, subscriber account system or private editor dashboard. Scheduled workflows may be paused or delayed. The website does not refresh itself in an already-open tab at midnight; a page reload shows the next verse.
