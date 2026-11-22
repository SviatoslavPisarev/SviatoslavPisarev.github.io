# Sviatoslav Pisarev, personal website

Static personal portfolio (HTML, CSS, JavaScript). No build step.

## Publish on GitHub Pages

1. Create a public repository named **`<your-username>.github.io`** (replace with your GitHub username).
2. Upload **the contents** of this folder (`index.html`, `assets/`, `404.html`, `.nojekyll`, …) to the root of the repository, not the folder itself.
   - On github.com: *Add file → Upload files*, drag everything in, commit.
   - `.nojekyll` is a hidden file; if your file browser hides it, it is optional.
3. Go to *Settings → Pages* and set **Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
4. After a minute the site is live at `https://<your-username>.github.io`.

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

To add a CV: put the PDF in `assets/` and set `cv: "assets/your-cv.pdf"` in `config.js`.
