# Sviatoslav Pisarev, personal website

Static personal portfolio (HTML, CSS, JavaScript). No build step.

## GitHub stats

The "Things I've built" section shows a live GitHub panel (contribution calendar, repositories,
languages, stars). It reads your username from the web address automatically when the site is at
`https://<username>.github.io`. If you host it elsewhere, set `github.username` in
`assets/js/config.js`. When no username is known, the panel stays hidden.

## Editing

| What | Where |
|---|---|
| Text, sections, research, presentations | `index.html` |
| Hero animation: option A or C (`hero.cells`) | `assets/js/config.js` |
| LinkedIn, ORCID, Google Scholar, CV link, GitHub username | `assets/js/config.js` |
| Matsui Lab site commit stats | `assets/js/config.js` → `labSiteStats` |
| Colors, fonts, layout | `assets/css/style.css` (tokens at the top) |
| Photo / poster | `assets/img/` (keep the same file names) |
