// A network that grows by preferential attachment (rich get richer): hubs emerge. Click to add nodes.
(() => {
  const root = document.documentElement;
  const cv = document.getElementById('net'), ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const B = document.body.dataset;
  const N = +B.n || 70, M = 2;
  const [FX, FY] = (B.center || '.6,.5').split(',').map(Number);
  const WANT = (B.colors || '1,2,4,5,8').split(',').map(Number);
  let W, H, pal = [], ink = '#000', nodes = [], edges = [], hover = null;

  function colors() {
    const s = getComputedStyle(root);
    pal = WANT.map(i => s.getPropertyValue('--c' + i).trim());
    ink = s.getPropertyValue('--ink').trim();
    nodes.forEach(n => n.c = pal[n.k]);
  }
  function resize() {
    const d = devicePixelRatio || 1; W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  const radius = n => 3 + Math.sqrt(n.deg) * 2.2;
  function add() {
    const n = {x: W/2 + (Math.random()-.5)*200, y: H/2 + (Math.random()-.5)*200, vx: 0, vy: 0, deg: 0};
    if (nodes.length) {
      const pool = []; nodes.forEach(t => { for (let k = 0; k <= t.deg; k++) pool.push(t); });
      const picks = new Set();
      while (picks.size < Math.min(M, nodes.length)) picks.add(pool[Math.floor(Math.random() * pool.length)]);
      const first = [...picks][0];
      n.k = Math.random() < .2 ? Math.floor(Math.random() * pal.length) : first.k;
      n.x = first.x + (Math.random()-.5)*30; n.y = first.y + (Math.random()-.5)*30;
      picks.forEach(t => { edges.push([n, t]); t.deg++; n.deg++; });
    } else n.k = 0;
    n.c = pal[n.k]; nodes.push(n);
  }
  function build() {
    nodes = []; edges = [];
    while (nodes.length < N) add();
    for (let i = 0; i < 400; i++) step();
  }
  function remove(n) {
    edges = edges.filter(([a, b]) => {
      if (a === n || b === n) { (a === n ? b : a).deg--; return false; }
      return true;
    });
    nodes = nodes.filter(m => m !== n); hover = null;
  }
  function step() {
    const cx = W > 760 ? W * FX : W / 2, cy = H * FY;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]; let dx = a.x - b.x, dy = a.y - b.y, d2 = dx*dx + dy*dy + 30;
        if (d2 > 90000) continue;
        const f = 900 / d2, d = Math.sqrt(d2); dx = dx / d * f; dy = dy / d * f;
        a.vx += dx; a.vy += dy; b.vx -= dx; b.vy -= dy;
      }
      a.vx += (cx - a.x) * .0006; a.vy += (cy - a.y) * .0006;
    }
    for (const [a, b] of edges) {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - 70) * .01;
      a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
    }
    for (const n of nodes) { n.vx *= .85; n.vy *= .85; n.x += n.vx; n.y += n.vy; }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1; ctx.strokeStyle = ink; ctx.globalAlpha = .18;
    ctx.beginPath(); for (const [a, b] of edges) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } ctx.stroke();
    ctx.globalAlpha = .9;
    for (const n of nodes) { ctx.fillStyle = n.c; ctx.beginPath(); ctx.arc(n.x, n.y, radius(n), 0, 7); ctx.fill(); }
    if (hover) {
      ctx.globalAlpha = 1; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath();
      ctx.arc(hover.x, hover.y, radius(hover) + 4, 0, 7); ctx.stroke();
    }
  }
  function pick(x, y) {
    let best = null, bd = 1e9;
    for (const n of nodes) { const d = Math.hypot(n.x - x, n.y - y); if (d < radius(n) + 10 && d < bd) { best = n; bd = d; } }
    return best;
  }
  const ignore = e => e.target.closest('a,button,.bar,.about,.item');
  addEventListener('mousemove', e => {
    hover = ignore(e) ? null : pick(e.clientX, e.clientY);
    cv.style.cursor = document.body.style.cursor = hover ? 'pointer' : '';
    if (still) draw();
  });
  addEventListener('click', e => {
    if (ignore(e)) return;
    const n = pick(e.clientX, e.clientY); if (n) { remove(n); if (still) draw(); }
  });
  const reset = document.getElementById('reset');
  if (reset) reset.onclick = () => { build(); if (still) draw(); };
  addEventListener('themechange', colors);
  addEventListener('resize', () => { resize(); if (still) draw(); });
  resize(); colors(); build();
  (function loop() { if (!still) { step(); requestAnimationFrame(loop); } draw(); })();
})();
