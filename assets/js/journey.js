/* Research-journey hero animation (one stage that morphs).
   1. RERE'Ir2Ge4 (LaTmIr2Ge4-type) crystal, viewed down the short axis as on the poster
   2. PEG threading through a ZIF-8-like framework (new random path every time)
   3. Iron oxide nanocages in an alternating magnetic field breaking up a collagen mesh;
      with { cells: true } MDA-MB-231 cells take up nanocages and die once the field is on. */
(function () {
  "use strict";
  var SQ3 = Math.sqrt(3);

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hex(c) { c = (c || "").trim(); if (c[0] !== "#") return null; if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mixC(a, b, t) { var A = hex(a), B = hex(b); if (!A || !B) return t < 0.5 ? a : b; return "rgb(" + Math.round(lerp(A[0], B[0], t)) + "," + Math.round(lerp(A[1], B[1], t)) + "," + Math.round(lerp(A[2], B[2], t)) + ")"; }

  /* ---- RERE'Ir2Ge4 cell (CeHoIr2Ge4-type view), fractional (u, v) read off the reference image.
     "2" = two atoms stacked along the viewing axis (depths 0.25 and 0.75); "1" = one atom at mid-depth. ---- */
  var MOTIF = (function () {
    var L = {
      re:  [[0, .21, 2], [0, .77, 2], [1, .21, 2], [1, .77, 2], [.5, .27, 1], [.5, .74, 1]],
      re2: [[.2, .03, 2], [.78, .03, 2], [.2, .98, 2], [.78, .98, 2], [.3, .5, 1], [.705, .5, 1]],
      ir:  [[.155, .25, 1], [.345, .25, 2], [.645, .25, 2], [.845, .25, 1], [.155, .75, 1], [.345, .75, 2], [.645, .75, 2], [.845, .75, 1]],
      ge:  []
    };
    [0, .5, 1].forEach(function (v) { L.ge.push([.087, v, 1], [.42, v, 2], [.57, v, 2], [.91, v, 1]); });
    L.ge.push([.3, .157, 1], [.7, .157, 1], [.3, .85, 1], [.7, .85, 1], [.2, .36, 2], [.8, .36, 2], [.2, .65, 2], [.8, .65, 2]);
    var atoms = [];
    Object.keys(L).forEach(function (kind) {
      L[kind].forEach(function (a) {
        (a[2] === 2 ? [.25, .75] : [.5]).forEach(function (z) {
          atoms.push({ kind: kind, p: [(a[0] - .5) * 2.4, (a[1] - .5) * 1.33, (z - .5) * 0.42] });
        });
      });
    });
    return { atoms: atoms, bonds: [] };
  })();
  var N = MOTIF.atoms.length;

  function Journey(canvas, opt) {
    opt = opt || {};
    var withCells = !!opt.cells;
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var W = 0, H = 0, dpr = 1, C = {}, running = false, last = 0, clock = 0, frame = 0, offset = 0;
    var LEN = [8000, 8500, withCells ? 11000 : 10000], T = 1900, CYC = LEN[0] + LEN[1] + LEN[2];
    var START = [0, LEN[0], LEN[0] + LEN[1]];
    var font = getComputedStyle(document.documentElement).getPropertyValue("--display").trim() || "Arial, sans-serif";

    function readColors() {
      var s = getComputedStyle(canvas);
      function g(n, f) { var v = s.getPropertyValue(n).trim(); return v || f; }
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      C.accent = g("--accent", "#3A47D5"); C.cell = g("--cell", "#B8336A"); C.muted = g("--muted", "#56627A");
      C.ink = g("--ink", "#0F1830"); C.rule = g("--rule", "#D3D9E4"); C.card = g("--card", "#FFFFFF");
      // poster colours: RE green, RE' purple, Ir grey, Ge red
      C.re = dark ? "#3FAE4A" : "#1E7D2A"; C.re2 = dark ? "#B05BC4" : "#7E2391"; C.ir = dark ? "#C9CDD3" : "#B4B8BE"; C.ge = dark ? "#F0524B" : "#E0302B";
      C.zn = C.accent; C.oxy = "#E0302B";
      C.collagen = dark ? "#E6B8C9" : "#C97A97";
      C.cageHi = dark ? "#CDBBFF" : "#B39AF0"; C.cageMid = dark ? "#8C63E6" : "#6A3CC0"; C.cageLo = dark ? "#5A33B5" : "#45208A";
      C.dead = dark ? "#7C8494" : "#9AA1AD";
    }

    /* ================= Scene 1: crystal ================= */
    var crystal = (function () {
      var atoms = MOTIF.atoms;
      var order = atoms.map(function (a, i) { return i; }).sort(function (a, b) { return atoms[a].p[0] - atoms[b].p[0] || atoms[a].p[1] - atoms[b].p[1]; });
      var RAD = { re: 0.15, re2: 0.075, ir: 0.095, ge: 0.085 };
      function proj(p, r, t) {
        var a = 0.3 + Math.sin(t * 0.00026) * 0.2, b = -0.3 + Math.sin(t * 0.00019 + 1) * 0.08;
        var ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
        var x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca, y = p[1] * cb - z * sb; z = p[1] * sb + z * cb;
        var s = Math.min(r.w * 0.6 / 2.4, r.h * 0.62 / 1.35), f = 4.5 / (4.5 - z);
        return { x: r.x + r.w / 2 + x * s * f, y: r.y + r.h / 2 + y * s * f, z: z, s: s * f };
      }
      var BOX = [];
      [-1.2, 1.2].forEach(function (x) { [-.675, .675].forEach(function (y) { [-.21, .21].forEach(function (z) { BOX.push([x, y, z]); }); }); });
      return {
        particles: function (r, t) {
          var out = new Array(N);
          for (var n = 0; n < N; n++) { var at = atoms[order[n]], q = proj(at.p, r, t); out[n] = { x: q.x, y: q.y, z: q.z, r: RAD[at.kind] * q.s, col: C[at.kind] }; }
          return out;
        },
        back: function (r, t, al) {
          if (al <= 0) return;
          var cs = BOX.map(function (p) { return proj(p, r, t); });
          ctx.save(); ctx.globalAlpha = al * 0.55; ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8;
          [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(function (e) {
            ctx.beginPath(); ctx.moveTo(cs[e[0]].x, cs[e[0]].y); ctx.lineTo(cs[e[1]].x, cs[e[1]].y); ctx.stroke();
          });
          ctx.restore();
        },
        front: function () {},
        drawP: function (p, al) { sphere(p.x, p.y, p.r, p.col, al); }
      };
    })();

    /* ================= Scene 2: MOF + PEG ================= */
    var mof = (function () {
      var cache = null, chain = null, chainSeed = 1;
      function build(r) {
        var key = [r.x, r.y, r.w, r.h].join(",");
        if (cache && cache.key === key) return cache;
        var a = Math.min(r.w * 0.055, r.h * 0.1), cx = r.x + r.w / 2, cy = r.y + r.h / 2, verts = [], idx = {}, hexes = [];
        for (var col = -14; col <= 14; col++) for (var row = -8; row <= 8; row++) {
          var hx = cx + 1.5 * a * col, hy = cy + SQ3 * a * (row + 0.5 * (col & 1)), vs = [];
          for (var k = 0; k < 6; k++) {
            var vx = hx + a * Math.cos(k * Math.PI / 3), vy = hy + a * Math.sin(k * Math.PI / 3), id = Math.round(vx * 2) + ":" + Math.round(vy * 2);
            if (!(id in idx)) { idx[id] = verts.length; verts.push({ x: vx, y: vy }); }
            vs.push(idx[id]);
          }
          hexes.push({ x: hx, y: hy, col: col, vs: vs });
        }
        var inset = a * 0.6, inside = [];
        verts.forEach(function (v, i) { if (v.x > r.x + inset && v.x < r.x + r.w - inset && v.y > r.y + inset && v.y < r.y + r.h - inset) inside.push(i); });
        inside.sort(function (p, q) { var A = verts[p], B = verts[q]; return Math.hypot((A.x - cx) / r.w, (A.y - cy) / r.h) - Math.hypot((B.x - cx) / r.w, (B.y - cy) / r.h); });
        var inSet = {}; inside.forEach(function (i, n) { inSet[i] = n; });
        var nodes = inside.map(function (i) { return verts[i]; });
        var order = nodes.slice(0, N).map(function (v, i) { return i; }).sort(function (p, q) { return nodes[p].x - nodes[q].x || nodes[p].y - nodes[q].y; });
        var edges = [];
        for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) if (Math.abs(Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) - a) < a * 0.08) edges.push([i, j]);
        var pores = hexes.filter(function (h) { return h.vs.every(function (v) { return v in inSet; }); });
        cache = { key: key, a: a, nodes: nodes, order: order, edges: edges, pores: pores, r: r };
        chain = null;
        return cache;
      }
      // a fresh, random threading path through the pores
      function makeChain(m) {
        var R = rng(chainSeed), r = m.r, a = m.a, cols = {}, keys;
        m.pores.forEach(function (p) { (cols[p.col] = cols[p.col] || []).push(p); });
        keys = Object.keys(cols).map(Number).sort(function (p, q) { return p - q; });
        var fromRight = R() < 0.4; if (fromRight) keys.reverse();
        var first = cols[keys[0]], y = first[Math.floor(R() * first.length)].y, path = [];
        keys.forEach(function (k) {
          var opts = cols[k].filter(function (p) { return Math.abs(p.y - y) < SQ3 * a * 1.05; });
          if (!opts.length) opts = cols[k];
          var pick = R() < 0.55 ? opts.sort(function (p, q) { return Math.abs(p.y - y) - Math.abs(q.y - y); })[0] : opts[Math.floor(R() * opts.length)];
          path.push({ x: pick.x, y: pick.y }); y = pick.y;
        });
        var edgeX = fromRight ? r.x + r.w + a * 1.5 : r.x - a * 1.5;
        path.unshift({ x: edgeX, y: path[0].y + (R() - 0.5) * a });
        var lens = [0]; for (var i = 1; i < path.length; i++) lens.push(lens[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
        return { path: path, lens: lens, amp: a * (0.08 + R() * 0.12), freq: 0.55 + R() * 0.6, speed: 0.62 + R() * 0.25, jig: R() * 6, reach: 0.72 + R() * 0.26 };
      }
      function at(c, s) {
        var L = c.lens, P = c.path, i = 1;
        while (i < L.length - 1 && L[i] < s) i++;
        var t = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1), dx = P[i].x - P[i - 1].x, dy = P[i].y - P[i - 1].y, dl = Math.hypot(dx, dy) || 1;
        return { x: lerp(P[i - 1].x, P[i].x, t), y: lerp(P[i - 1].y, P[i].y, t), nx: -dy / dl, ny: dx / dl };
      }
      function nodePos(m, n, t) { var v = m.nodes[n]; return { x: v.x + Math.sin(t * 0.002 + n) * 0.6, y: v.y + Math.cos(t * 0.0017 + n * 1.3) * 0.6 }; }
      function diamond(x, y, rr) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-rr, -rr, rr * 2, rr * 2); ctx.restore(); }
      return {
        reseed: function () { chainSeed = (Math.random() * 1e9) | 0; chain = null; },
        particles: function (r, t) {
          var m = build(r), out = new Array(N);
          for (var n = 0; n < N; n++) { var q = nodePos(m, m.order[n], t); out[n] = { x: q.x, y: q.y, z: 0, r: m.a * 0.17, col: C.zn }; }
          return out;
        },
        back: function (r, t, al) {
          if (al <= 0) return;
          var m = build(r);
          ctx.save(); ctx.lineWidth = Math.max(1.5, m.a * 0.07); ctx.strokeStyle = C.muted; ctx.fillStyle = C.muted;
          m.edges.forEach(function (e) {
            var p = nodePos(m, e[0], t), q = nodePos(m, e[1], t);
            ctx.globalAlpha = al * 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            ctx.globalAlpha = al * 0.75; ctx.beginPath(); ctx.arc((p.x + q.x) / 2, (p.y + q.y) / 2, m.a * 0.06, 0, 7); ctx.fill();
          });
          ctx.globalAlpha = al; ctx.fillStyle = C.zn;
          for (var n = N; n < m.nodes.length; n++) { var q = nodePos(m, n, t); diamond(q.x, q.y, m.a * 0.17); }
          ctx.restore();
        },
        front: function (r, t, al, prog) {
          if (al <= 0) return;
          var m = build(r); if (!chain) chain = makeChain(m);
          var c = chain, total = c.lens[c.lens.length - 1], sp = m.a * 0.26, pts = [];
          // reptation: steady advance with small random back-and-forth
          var p = Math.min(1, prog / c.speed) * c.reach + Math.sin(t * 0.0021 + c.jig) * 0.012 + Math.sin(t * 0.0047 + c.jig * 2) * 0.006;
          var head = total * Math.max(0, Math.min(1, p));
          for (var k = 0; head - k * sp > 0; k++) {
            var q = at(c, head - k * sp), w = Math.sin(k * c.freq - t * 0.004 + c.jig) * c.amp + Math.sin(k * 0.31 + c.jig) * c.amp * 0.6;
            pts.push({ x: q.x + q.nx * w, y: q.y + q.ny * w, o: k % 3 === 2 });
          }
          if (!pts.length) return;
          ctx.save(); ctx.globalAlpha = al * 0.85; ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.2, m.a * 0.06); ctx.lineJoin = "round";
          ctx.beginPath(); pts.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke();
          pts.forEach(function (q, i) { ctx.globalAlpha = al; ctx.fillStyle = q.o ? C.oxy : C.ink; ctx.beginPath(); ctx.arc(q.x, q.y, m.a * (i === 0 ? 0.13 : q.o ? 0.1 : 0.075), 0, 7); ctx.fill(); });
          ctx.restore();
        },
        drawP: function (p, al) { ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = p.col; diamond(p.x, p.y, p.r); ctx.restore(); }
      };
    })();

    /* ================= Scene 3: nanocages in an AMF ================= */
    var amf = (function () {
      var R = rng(11), i;
      // collagen mesh: long, gently curved fibres, loosely aligned; each splits into pieces under the field
      var fibers = [];
      for (i = 0; i < 14; i++) {
        var pieces = 3 + Math.floor(R() * 2), cuts = [0];
        for (var k = 1; k < pieces; k++) cuts.push(k / pieces + (R() - 0.5) * 0.12);
        cuts.push(1);
        var rot = [], drift = [];
        for (k = 0; k < pieces; k++) { rot.push((R() < 0.5 ? -1 : 1) * (0.25 + R() * 0.45)); drift.push((R() - 0.5) * 0.05); }
        fibers.push({ u: 0.05 + R() * 0.9, v: 0.1 + (i / 13) * 0.8 + (R() - 0.5) * 0.08, len: 0.6 + R() * 0.45, th: 0.12 + (R() - 0.5) * 1.15, bend: (R() < 0.5 ? -1 : 1) * (0.03 + R() * 0.06), ph: R() * 6, w: 2.6 + R() * 2, cuts: cuts, rot: rot, drift: drift });
      }
      // cancer cells (option C)
      var cells = withCells ? [
        { u: 0.24, v: 0.45, A: 1.15, B: 0.34, ang: -0.4, ph: 0.3 },
        { u: 0.55, v: 0.62, A: 1.25, B: 0.32, ang: 0.28, ph: 2.1 },
        { u: 0.8, v: 0.38, A: 1.1, B: 0.36, ang: -0.18, ph: 4.2 }
      ] : [];
      cells.forEach(function (c) { c.bodies = []; for (var b = 0; b < 6; b++) c.bodies.push({ a: R() * 6.28, d: 0.6 + R() * 0.8, r: 0.08 + R() * 0.07, t0: 0.35 + R() * 0.4 }); });
      // nanocages: some taken up by cells, the rest free between fibres
      var NC = withCells ? 12 : 10, cages = [];
      for (i = 0; i < NC; i++) {
        var bound = withCells && i < 9 ? cells[i % 3] : null;
        cages.push({ cell: bound, ca: (i / 3) * 2.1 + R() * 0.9, cd: 0.3 + R() * 0.45,
          u: 0.12 + 0.76 * ((i % 5) + 0.5 + (R() - 0.5) * 0.35) / 5, v: 0.24 + 0.52 * (Math.floor(i / 5) % 2 + 0.5 + (R() - 0.5) * 0.3) / 2,
          ax: R() * 6, ay: R() * 6, wx: 0.6 + R(), wy: 0.6 + R(), f1: 0.5 + R(), f2: 0.5 + R(), p: R() * 6, s: 0.85 + R() * 0.3 });
      }
      // particles that don't become cages fly into the collagen mesh and dissolve there
      var anchors = [];
      for (i = 0; i < N - NC; i++) anchors.push({ f: i % fibers.length, s: ((i * 0.37) % 1) });
      var homes = cages.map(function (c, ci) { return { kind: "c", i: ci, u: c.cell ? c.cell.u : c.u }; })
        .concat(anchors.map(function (a, ai) { return { kind: "a", i: ai, u: fibers[a.f].u }; }));
      var order = homes.map(function (h, k) { return k; }).sort(function (p, q) { return homes[p].u - homes[q].u; });

      var st = { on: 0, dis: 0, death: 0, t: 0 };
      function field(t) { return st.on * Math.sin(t * Math.PI * 2 / 1100); }
      function cellGeo(r, c) {
        var sc = Math.min(r.w * 0.075, r.h * 0.2), d = st.death;
        var round = smooth(0, 0.45, d), shrink = 1 - 0.22 * smooth(0.1, 0.8, d);
        return { x: r.x + c.u * r.w, y: r.y + c.v * r.h, A: sc * lerp(c.A * 1.9, 1.05, round) * shrink, B: sc * lerp(c.B * 1.9, 0.95, round) * shrink, ang: c.ang, sc: sc };
      }
      function fiberPiece(r, f, k) {
        var d = st.dis, L = f.len * r.w, a0 = f.cuts[k], a1 = f.cuts[k + 1], mid = (a0 + a1) / 2;
        var shrink = 1 - 0.32 * d, s0 = mid + (a0 - mid) * shrink, s1 = mid + (a1 - mid) * shrink;
        var cx = r.x + f.u * r.w, cy = r.y + f.v * r.h, c = Math.cos(f.th), s = Math.sin(f.th);
        function base(u) { var x = (u - 0.5) * L, bend = Math.sin(u * 3.1 + f.ph + st.t * 0.0004) * f.bend * r.h + (u - 0.5) * (u - 0.5) * f.bend * r.h * 4; return { x: cx + c * x - s * bend, y: cy + s * x + c * bend }; }
        var pm = base(mid), th = f.rot[k] * d, ct = Math.cos(th), sth = Math.sin(th), dr = f.drift[k] * d * r.h * 3, pts = [];
        for (var j = 0; j <= 10; j++) {
          var q = base(lerp(s0, s1, j / 10)), dx = q.x - pm.x, dy = q.y - pm.y;
          pts.push({ x: pm.x + dx * ct - dy * sth - s * dr, y: pm.y + dx * sth + dy * ct + c * dr });
        }
        return pts;
      }
      function drawCell(r, c) {
        var g = cellGeo(r, c), d = st.death, n = 64, k, tt;
        var col = mixC(C.cell, C.dead, smooth(0.25, 0.95, d)), alpha = 1 - 0.45 * smooth(0.7, 1, d);
        var bleb = smooth(0.25, 0.7, d) * (1 - 0.5 * smooth(0.85, 1, d));
        ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.ang);
        ctx.beginPath();
        for (k = 0; k <= n; k++) {
          tt = k / n * Math.PI * 2;
          var wob = 1 + 0.05 * Math.sin(3 * tt + c.ph + st.t * 0.0009) + 0.04 * Math.sin(5 * tt - c.ph + st.t * 0.0013)
            + bleb * (0.12 * Math.max(0, Math.sin(9 * tt + c.ph)) + 0.08 * Math.max(0, Math.sin(13 * tt - c.ph * 2 + st.t * 0.002)));
          var taper = lerp(0.55 + 0.45 * Math.abs(Math.sin(tt)), 1, smooth(0, 0.45, d));
          var px = Math.cos(tt) * g.A * wob, py = Math.sin(tt) * g.B * wob * (0.7 + 0.3 * taper) * (Math.abs(Math.cos(tt)) > 0.9 ? taper : 1);
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = col; ctx.globalAlpha = 0.16 * alpha * c.al; ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.9 * alpha * c.al;
        if (d > 0.8) ctx.setLineDash([6, 3 + 6 * smooth(0.8, 1, d)]);
        ctx.stroke(); ctx.setLineDash([]);
        // nucleus: condenses, then breaks into fragments
        var frag = smooth(0.55, 0.85, d), nr = g.sc * lerp(0.42, 0.26, smooth(0.2, 0.6, d));
        ctx.fillStyle = col; ctx.globalAlpha = lerp(0.45, 0.8, smooth(0.2, 0.6, d)) * alpha * c.al;
        if (frag < 0.05) { ctx.beginPath(); ctx.ellipse(g.A * 0.08, 0, nr * 1.25, nr * 0.9, 0, 0, 7); ctx.fill(); }
        else for (k = 0; k < 4; k++) { var fa = k * 1.57 + c.ph; ctx.beginPath(); ctx.arc(Math.cos(fa) * nr * frag * 0.9, Math.sin(fa) * nr * frag * 0.7, nr * lerp(0.9, 0.42, frag), 0, 7); ctx.fill(); }
        ctx.restore();
        // apoptotic bodies pinch off and drift away
        c.bodies.forEach(function (b) {
          var e = smooth(b.t0, b.t0 + 0.3, d); if (e <= 0) return;
          var dist = lerp(1.0, 1.0 + b.d, e), ca = Math.cos(b.a), sa = Math.sin(b.a), ce = Math.cos(g.ang), se = Math.sin(g.ang);
          var lx = ca * g.A * dist, ly = sa * g.B * dist * 1.3, bx = g.x + lx * ce - ly * se, by = g.y + lx * se + ly * ce;
          ctx.save(); ctx.globalAlpha = 0.6 * e * alpha * c.al; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(bx, by, b.r * g.sc * (0.6 + e * 0.4), 0, 7); ctx.globalAlpha *= 0.35; ctx.fill(); ctx.globalAlpha /= 0.35; ctx.stroke(); ctx.restore();
        });
      }
      function cagePos(r, c, t) {
        var F = Math.abs(field(t)), cr = Math.min(r.w * 0.019, r.h * 0.046) * c.s;
        if (c.cell) {
          var g = cellGeo(r, c.cell), lx = Math.cos(c.ca) * g.A * c.cd, ly = Math.sin(c.ca) * g.B * c.cd, ce = Math.cos(g.ang), se = Math.sin(g.ang);
          var j = cr * 0.25 * (0.3 + F);
          return { x: g.x + lx * ce - ly * se + Math.sin(t * 0.004 * c.f1 + c.p) * j, y: g.y + lx * se + ly * ce + Math.cos(t * 0.0035 * c.f2 + c.p) * j, r: cr * 0.8 };
        }
        var amp = cr * (0.25 + 0.9 * F);
        return { x: r.x + c.u * r.w + Math.sin(t * 0.0013 * c.f1 + c.p) * amp, y: r.y + c.v * r.h + Math.cos(t * 0.0011 * c.f2 + c.p) * amp, r: cr };
      }
      return {
        set: function (lt, len, t) {
          st.t = t;
          var onAt = len * 0.17;
          st.on = smooth(onAt, onAt + 500, lt);
          st.dis = smooth(onAt + 400, len * 0.82, lt);
          st.death = withCells ? smooth(onAt + 700, len * 0.88, lt) : 0;
        },
        particles: function (r, t) {
          var out = new Array(N);
          for (var n = 0; n < N; n++) {
            var h = homes[order[n]];
            if (h.kind === "c") { var c = cages[h.i], q = cagePos(r, c, t); out[n] = { x: q.x, y: q.y, z: 0, r: q.r, col: C.cageLo, cage: c }; }
            else {
              var a = anchors[h.i], f = fibers[a.f], pts = fiberPiece(r, f, Math.min(f.cuts.length - 2, Math.floor(a.s * (f.cuts.length - 1)))), pp = pts[Math.floor(a.s * 10) % 11];
              out[n] = { x: pp.x, y: pp.y, z: 0, r: 2, col: C.collagen, ghost: true };
            }
          }
          return out;
        },
        back: function (r, t, al) {
          if (al <= 0) return;
          var f = field(t), on = st.on;
          ctx.save();
          // collagen mesh
          ctx.lineCap = "round"; ctx.lineJoin = "round";
          fibers.forEach(function (fb) {
            for (var k = 0; k < fb.cuts.length - 1; k++) {
              var pts = fiberPiece(r, fb, k);
              ctx.strokeStyle = C.collagen; ctx.lineWidth = fb.w * Math.max(1, r.h / 320); ctx.globalAlpha = al * 0.62;
              ctx.beginPath(); pts.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke();
              ctx.lineWidth = Math.max(0.7, fb.w * 0.28); ctx.globalAlpha = al * 0.45; ctx.strokeStyle = C.card; ctx.setLineDash([9, 5]);
              ctx.stroke(); ctx.setLineDash([]);
            }
          });
          // field arrows (top and bottom) and coil cross-sections (left and right)
          if (on > 0.01) {
            ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5;
            [0.06, 0.94].forEach(function (yy, row) {
              var y = r.y + r.h * yy, n = Math.max(6, Math.round(r.w / 46)), dir = f >= 0 ? 1 : -1;
              for (var k = 0; k < n; k++) {
                var x = r.x + (k + 0.5) * r.w / n, sz = 4 + 3 * Math.abs(f);
                if (row === 0 && x < r.x + 130) continue;
                ctx.globalAlpha = al * on * (0.15 + 0.6 * Math.abs(f));
                ctx.beginPath(); ctx.moveTo(x - dir * sz, y - sz); ctx.lineTo(x + dir * sz * 0.4, y); ctx.lineTo(x - dir * sz, y + sz); ctx.stroke();
              }
            });
          }
          [r.x + 10, r.x + r.w - 10].forEach(function (x, side) {
            for (var k = 0; k < 5; k++) {
              var y = r.y + r.h * (0.22 + k * 0.14), dot = (f >= 0) !== (side === 1);
              ctx.globalAlpha = al * 0.7; ctx.strokeStyle = C.muted; ctx.lineWidth = 1.3;
              ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.stroke();
              if (on > 0.5) {
                ctx.fillStyle = C.muted;
                if (dot) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); }
                else { ctx.beginPath(); ctx.moveTo(x - 2.6, y - 2.6); ctx.lineTo(x + 2.6, y + 2.6); ctx.moveTo(x + 2.6, y - 2.6); ctx.lineTo(x - 2.6, y + 2.6); ctx.stroke(); }
              }
            }
          });
          ctx.restore();
          cells.forEach(function (c) { c.al = al; drawCell(r, c); });
        },
        front: function (r, t, al) {
          if (al <= 0.05) return;
          // AMF status chip
          var on = st.on > 0.5, x = r.x + 24, y = r.y + r.h * 0.06 - 12, label = on ? "AMF on" : "AMF off";
          ctx.save(); ctx.globalAlpha = al; ctx.font = "600 12px " + font; ctx.textBaseline = "middle";
          var w = ctx.measureText(label).width + 30;
          roundRect(x, y, w, 24, 12); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = on ? C.accent : C.rule; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = on ? C.accent : C.muted; ctx.beginPath(); ctx.arc(x + 12, y + 12, on ? 3.5 + Math.abs(field(t)) * 1.5 : 3.5, 0, 7); ctx.fill();
          ctx.fillStyle = C.ink; ctx.fillText(label, x + 21, y + 12.5);
          ctx.restore();
        },
        step: function (dt, t) {
          var F = Math.abs(field(t));
          cages.forEach(function (c) { c.ax += 0.004 * c.wx * (0.25 + 3 * F) * dt; c.ay += 0.0035 * c.wy * (0.25 + 3 * F) * dt; });
        },
        drawP: function (p, al) { if (p.cage) drawCage({ x: p.x, y: p.y, r: p.r, ax: p.cage.ax, ay: p.cage.ay }, al); }
      };
    })();

    var scenes = [crystal, mof, amf];

    /* ---------------- drawing helpers ---------------- */
    function sphere(x, y, r, col, al) {
      if (r <= 0.2 || al <= 0) return;
      ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.6)"); g.addColorStop(0.55, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }
    // Hollow nanocage in the style of the Matsui Lab logo: a cube with concave faces and pointed
    // corners, a large round window in each face, flat three-tone purple shading.
    var FACES = [];
    (function () { var E = [[1,0,0],[0,1,0],[0,0,1]]; for (var a = 0; a < 3; a++) for (var s = -1; s <= 1; s += 2) FACES.push({ c: E[a].map(function (x) { return x * s; }), u: E[(a + 1) % 3], v: E[(a + 2) % 3] }); })();
    var LIGHT = (function () { var l = [-0.2, -0.95, 0.25], m = Math.hypot(l[0], l[1], l[2]); return l.map(function (x) { return x / m; }); })();
    function drawCage(g, al) {
      if (al <= 0 || g.r <= 0.5) return;
      var ca = Math.cos(g.ax), sa = Math.sin(g.ax), cb = Math.cos(g.ay), sb = Math.sin(g.ay), k = g.r * 0.78, i, j;
      function rot(v) { var x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca; return [x1, v[1] * cb - z1 * sb, v[1] * sb + z1 * cb]; }
      var faces = FACES.map(function (f) { return { c: rot(f.c), u: rot(f.u), v: rot(f.v) }; }).filter(function (f) { return f.c[2] > 0.02; });
      ctx.save();
      var sg = [[1,1],[-1,1],[-1,-1],[1,-1]];
      for (i = 0; i < faces.length; i++) {
        var f = faces[i], Cc = [g.x + f.c[0] * k, g.y + f.c[1] * k], P = [];
        for (j = 0; j < 4; j++) P.push([g.x + (f.c[0] + sg[j][0] * f.u[0] + sg[j][1] * f.v[0]) * k, g.y + (f.c[1] + sg[j][0] * f.u[1] + sg[j][1] * f.v[1]) * k]);
        ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
        for (j = 0; j < 4; j++) { var A = P[j], B = P[(j + 1) % 4], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2; ctx.quadraticCurveTo(mx + (Cc[0] - mx) * 0.42, my + (Cc[1] - my) * 0.42, B[0], B[1]); }
        ctx.closePath();
        for (j = 0; j <= 32; j++) { var t = j / 32 * Math.PI * 2, cs = Math.cos(t) * 0.5, sn = Math.sin(t) * 0.5, hx = Cc[0] + (cs * f.u[0] + sn * f.v[0]) * k, hy = Cc[1] + (cs * f.u[1] + sn * f.v[1]) * k; if (j === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy); }
        ctx.closePath();
        var lit = f.c[0] * LIGHT[0] + f.c[1] * LIGHT[1] + f.c[2] * LIGHT[2];
        ctx.fillStyle = lit > 0.25 ? mixC(C.cageMid, C.cageHi, smooth(0.25, 0.75, lit)) : mixC(C.cageLo, C.cageMid, smooth(-0.6, 0.25, lit));
        ctx.globalAlpha = al; ctx.fill("evenodd");
      }
      ctx.restore();
    }
    function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    /* ---------------- timeline ---------------- */
    var state = { step: 0, prog: 0 }, lastChapter = -1;
    function where(t) {
      var local = ((t + offset) % CYC + CYC) % CYC, i = local < START[1] ? 0 : local < START[2] ? 1 : 2;
      return { i: i, lt: local - START[i] };
    }
    function prep(i, lt, t) { if (i === 2) amf.set(lt, LEN[2], t); }
    function threadProg(lt) { return Math.min(1, lt / (LEN[1] * 0.85)); }
    function drawScene(i, r, t, lt, al) {
      var sc = scenes[i]; prep(i, lt, t);
      sc.back(r, t, al);
      var ps = sc.particles(r, t);
      if (i === 0) ps = ps.slice().sort(function (p, q) { return p.z - q.z; });
      ps.forEach(function (p) { sc.drawP(p, al); });
      if (i === 1) mof.front(r, t, al, threadProg(lt));
      if (i === 2) amf.front(r, t, al);
    }
    function render(t) {
      var w = where(t), i = w.i, lt = w.lt, len = LEN[i], j = (i + 1) % 3, r = { x: 0, y: 0, w: W, h: H };
      if (i !== lastChapter) { if (i === 1 || lastChapter === -1) mof.reseed(); lastChapter = i; }
      state.step = i; state.prog = lt / len;
      if (lt < len - T) { drawScene(i, r, t, lt, 1); return; }
      var e = ease((lt - (len - T)) / T), A = scenes[i], B = scenes[j];
      prep(i, lt, t); A.back(r, t, 1 - e); var pa = A.particles(r, t);
      if (i === 1) mof.front(r, t, 1 - e, threadProg(lt));
      if (i === 2) amf.front(r, t, 1 - e);
      prep(j, 0, t); B.back(r, t, e); var pb = B.particles(r, t);
      var mixed = pa.map(function (p, n) { var q = pb[n]; return { a: p, b: q, x: lerp(p.x, q.x, e), y: lerp(p.y, q.y, e), z: lerp(p.z, q.z, e), r: lerp(p.r, q.r, e) }; });
      mixed.sort(function (p, q) { return p.z - q.z; });
      var mid = Math.sin(e * Math.PI);
      mixed.forEach(function (m) {
        var ghostEnd = (m.b.ghost && e > 0.5) || (m.a.ghost && e < 0.5), dotA = ghostEnd ? mid : mid * 0.9;
        if (dotA > 0.05) { ctx.save(); ctx.globalAlpha = dotA; ctx.fillStyle = mixC(m.a.col, m.b.col, e); ctx.beginPath(); ctx.arc(m.x, m.y, Math.max(1.5, m.r * 0.6), 0, 7); ctx.fill(); ctx.restore(); }
        A.drawP(Object.assign({}, m.a, { x: m.x, y: m.y, r: m.r }), (1 - e) * (1 - mid * 0.6));
        B.drawP(Object.assign({}, m.b, { x: m.x, y: m.y, r: m.r }), e * (1 - mid * 0.6));
      });
    }

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      render(t);
      if (opt.onStep) opt.onStep(state.step, state.prog);
    }
    function loop(now) {
      if (!running) return;
      var dt = Math.min(3, (now - last) / 16.7 || 1); last = now; clock += dt * 16.7;
      if ((frame++ % 90) === 0) readColors();
      amf.step(dt, clock); draw(clock);
      requestAnimationFrame(loop);
    }
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      W = w; H = h; readColors(); if (!running) draw(clock);
    }
    readColors();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas); else window.addEventListener("resize", resize);
    resize();
    if (reduce) { clock = LEN[0] * 0.45; draw(clock); }
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (vis && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); } else if (!vis) running = false;
      }).observe(canvas);
    } else { running = true; requestAnimationFrame(loop); }

    return {
      goTo: function (i) {
        var local = ((clock + offset) % CYC + CYC) % CYC, target = START[i] + (reduce ? LEN[i] * 0.55 : 1);
        offset += target - local;
        if (!running) draw(clock);
      },
      renderAt: function (t) { running = false; clock = t; amf.step(1, t); draw(t); },
      redraw: function () { readColors(); if (!running) draw(clock); }
    };
  }

  /* Wire a canvas and its .journey-steps buttons together */
  Journey.mount = function (fig, opts) {
    var canvas = fig.querySelector("canvas"), btns = Array.prototype.slice.call(fig.querySelectorAll(".journey-steps button")), lastStep = -1;
    opts = opts || {};
    opts.onStep = function (step, prog) {
      if (step !== lastStep) {
        btns.forEach(function (b, i) { b.classList.toggle("on", i === step); b.classList.toggle("done", i < step); b.setAttribute("aria-current", i === step ? "step" : "false"); var t = b.querySelector(".track i"); if (t) t.style.width = ""; });
        lastStep = step;
      }
      var bar = btns[step] && btns[step].querySelector(".track i");
      if (bar) bar.style.width = (prog * 100).toFixed(1) + "%";
    };
    var j = Journey(canvas, opts);
    btns.forEach(function (b, i) { b.addEventListener("click", function () { j.goTo(i); }); });
    document.addEventListener("themechange", function () { j.redraw(); });
    return j;
  };
  window.ResearchJourney = Journey;
})();
