/* Sviatoslav Pisarev, personal site. No build step, no dependencies. */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var LINKS = CFG.links || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function cacheGet(k) { try { var o = JSON.parse(sessionStorage.getItem(k)); return o && Date.now() - o.t < 30 * 60 * 1000 ? o.v : null; } catch (e) { return null; } }
  function cacheSet(k, v) { try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {} }
  function fmt(n) { return Number(n).toLocaleString("en-US"); }

  /* ---------- Year ---------- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  $("#theme-btn").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store("theme", next);
    document.dispatchEvent(new Event("themechange"));
  });

  /* ---------- Mobile menu ---------- */
  var nav = $("#nav"), menuBtn = $("#menu-btn");
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }); });

  /* ---------- Header border + active section ---------- */
  var bar = $("#bar");
  window.addEventListener("scroll", function () { bar.classList.toggle("scrolled", window.scrollY > 8); }, { passive: true });
  if ("IntersectionObserver" in window) {
    var navLinks = {};
    $$("#nav a").forEach(function (a) { navLinks[a.getAttribute("href").slice(1)] = a; });
    var secObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && navLinks[e.target.id]) {
          $$("#nav a").forEach(function (a) { a.classList.remove("active"); });
          navLinks[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("section.block").forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = (dec ? target.toFixed(dec) : fmt(target)) + suffix; return; }
    var t0 = null, dur = 1300;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = target * e;
      el.textContent = (dec ? v.toFixed(dec) : fmt(Math.round(v))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveal on scroll ---------- */
  function onReveal(el) {
    el.classList.add("in");
    $$("[data-count]", el).forEach(countUp);
    var fill = $("#share-fill", el); if (fill) fill.style.width = "87%";
  }
  if ("IntersectionObserver" in window && !reduce) {
    var rObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { onReveal(e.target); rObs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { rObs.observe(el); });
  } else {
    $$(".reveal").forEach(onReveal);
  }

  /* ---------- Links from config ---------- */
  function setLink(key, url) {
    $$('[data-link="' + key + '"]').forEach(function (a) {
      if (url) { a.href = url; a.hidden = false; } else if (key !== "linkedin" && key !== "lab" && key !== "gcProfile") a.hidden = true;
    });
  }
  ["linkedin", "lab", "gcProfile", "orcid", "scholar"].forEach(function (k) { if (k in LINKS) setLink(k, LINKS[k]); });
  if (LINKS.cv) { var cv = $("#cv-btn"); cv.href = LINKS.cv; cv.hidden = false; }

  /* ---------- Lab-site commit bars ---------- */
  (function () {
    var s = CFG.labSiteStats, svg = $("#lab-bars");
    if (!s || !svg) return;
    var NS = "http://www.w3.org/2000/svg";
    var d0 = new Date(s.start + "T12:00:00"), d1 = new Date(s.end + "T12:00:00");
    var days = Math.round((d1 - d0) / 864e5) + 1, max = 0, k;
    for (k in s.byDay) max = Math.max(max, s.byDay[k]);
    var W = 600, H = 90, gap = 3, bw = (W - gap * (days - 1)) / days;
    for (var i = 0; i < days; i++) {
      var d = new Date(d0.getTime() + i * 864e5), key = d.toISOString().slice(0, 10), n = s.byDay[key] || 0;
      var h = n ? Math.max(6, (n / max) * (H - 6)) : 3;
      var r = document.createElementNS(NS, "rect");
      r.setAttribute("x", (i * (bw + gap)).toFixed(2)); r.setAttribute("y", (H - h).toFixed(2));
      r.setAttribute("width", bw.toFixed(2)); r.setAttribute("height", h.toFixed(2)); r.setAttribute("rx", 2);
      if (!n) r.setAttribute("class", "zero");
      var tt = document.createElementNS(NS, "title");
      tt.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ": " + n + " commit" + (n === 1 ? "" : "s");
      r.appendChild(tt); svg.appendChild(r);
    }
  })();

  /* ---------- Poster viewer ---------- */
  (function () {
    var dlg = $("#poster-dialog"), scroll = $("#poster-scroll"), zoom = $("#poster-zoom"), big = $("#poster-big");
    $("#poster-open").addEventListener("click", function () {
      if (!big.src) big.src = "assets/img/poster-rereir2ge4.jpg";
      scroll.classList.remove("zoomed"); zoom.textContent = "Zoom in";
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
    $("#poster-close").addEventListener("click", function () { dlg.close(); });
    zoom.addEventListener("click", function () { var z = scroll.classList.toggle("zoomed"); zoom.textContent = z ? "Zoom out" : "Zoom in"; });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  })();

  /* ---------- GitHub links ---------- */
  var ghUser = ((CFG.github || {}).username || "").trim();
  if (ghUser) setLink("github", "https://github.com/" + encodeURIComponent(ghUser));

  /* ---------- Hero: research-journey animation (assets/js/journey.js) ---------- */
  var heroFig = $("#journey");
  if (heroFig && window.ResearchJourney) window.ResearchJourney.mount(heroFig, { cells: !!(CFG.hero && CFG.hero.cells) });
})();
