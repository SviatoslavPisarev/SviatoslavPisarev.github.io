/*
  Site settings. Edit these values, then re-upload this file.

  github.username
    Leave it empty ("") and the site reads your username from the web address
    when it is hosted at https://<username>.github.io. Type it in only if the
    site lives somewhere else (a custom domain, for example).
*/
window.SITE_CONFIG = {
  hero: {
    // false = option A (nanocages break up the collagen mesh)
    // true  = option C (same, plus MDA-MB-231 cells that die when the field turns on)
    cells: true
  },

  github: {
    username: "SviatoslavPisarev",
    // How many of your public repositories to show as cards
    repoCards: 6
  },

  links: {
    linkedin: "https://www.linkedin.com/in/sviatoslav-pisarev/",
    lab: "https://thematsuilab.github.io/",
    labProfile: "https://thematsuilab.github.io/members/sviatoslav-pisarev.html",
    gcProfile: "https://www.gc.cuny.edu/people/sviatoslav-pisarev",
    // Optional: paste full URLs to show these buttons; leave "" to hide them
    orcid: "",
    scholar: "",
    cv: ""          // e.g. "assets/Sviatoslav_Pisarev_CV.pdf"
  },

  /* Commit history of the Matsui Lab website (TheMatsuiLab/TheMatsuiLab.github.io),
     counted from the repository's git log on Nov 22, 2026. */
  labSiteStats: {
    repo: "https://github.com/TheMatsuiLab/TheMatsuiLab.github.io",
    commits: 67,
    totalCommits: 77,
    added: 7261,
    removed: 4983,
    pages: 21,
    byDay: {
      "2026-10-23": 24, "2026-10-24": 6, "2026-11-11": 13,
      "2026-11-16": 2, "2026-11-17": 10, "2026-11-19": 12
    },
    start: "2026-10-20",
    end: "2026-11-22"
  }
};
