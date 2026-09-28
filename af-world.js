'use strict';
// The page AF walks across. The film strip is the timeline: AF walks on its top edge, and every
// commit is one frame that gets exposed as AF passes. Ahead of AF the strip is only a faint guide.

const LANG = (window.FILM_LANG || new URLSearchParams(location.search).get('lang')) === 'zh' ? 'zh' : 'en';
const L10N = v => typeof v === 'string' ? v : v[LANG];
const QT2 = t => Math.floor(t * 12 + 1e-6) / 12, QT1 = t => Math.floor(t * 24 + 1e-6) / 24;
const lin = x => x;
const STRIP = {top: 760, h: 112, pitch: 84, fw: 70, fh: 50};
const AF_S = 1;
const INKC = {paper: '#f1efea', base: '#1b1a1d', rim: '#2b2a2e', hole: '#f1efea', grey: '#8d8a86', light: '#d9d6d0', line: '#121015'};

// ---------- the roll: one frame per commit, laid out day by day ----------
// Real daily counts from af-data.js. The pitch shrinks in busy eras so the film keeps moving; empty days
// still take room, so a quiet winter reads as blank leader. A seam gap opens at each material change.
const LOOKS = ['pencil', 'ink', 'chalk', 'glass', 'color'];
const REGIONS = [['2025-06-05', 84, 70, 0], ['2025-06-10', 20, 10, 4], ['2025-10-26', 34, 12, 6], ['2025-11-12', 9, 6, 4], ['2026-01-01', 13, 8, 2], ['2026-06-01', 12, 8, 3], ['2026-07-29', 22, 12, 6], ['2026-09-08', 40, 20, 10]];
const SEAM_AFTER = [42, 281, 630, 828], SEAM_GAP = 250, ROLL_X0 = 300;
const FRAMES = [], DAY_AT = {}, DAY_LIST = [], SEAMS = [];
{
  const region = d => { let r = REGIONS[0]; for (const R of REGIONS) if (d >= R[0]) r = R; return r; };
  let x = ROLL_X0, n = 0, prev = null;
  for (const [d, k] of ROLL_DAYS) {
    const [, pitch, gap, empty] = region(d);
    if (prev) x += gap + Math.max(0, (Date.parse(d) - Date.parse(prev)) / 864e5 - 1) * empty;
    DAY_AT[d] = {x, first: n, count: k}; DAY_LIST.push(d);
    for (let i = 0; i < k; i++) {
      FRAMES.push({x, w: pitch, day: d, n, seed: 7 + (n + 1) * 13}); x += pitch;
      if (SEAM_AFTER.includes(n)) { SEAMS.push(x + SEAM_GAP / 2); x += SEAM_GAP; }
      n++;
    }
    DAY_AT[d].end = x; DAY_AT[d].total = n; prev = d;
  }
  var ROLL_END = x;
}
const SEAM = SEAMS[0];
const xOf = n => FRAMES[n].x + FRAMES[n].w / 2;
const lookOfX = x => LOOKS[SEAMS.filter(s => x > s).length];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = d => { const [, m, dd] = d.split('-').map(Number); return LANG === 'zh' ? `${m}月${dd}日` : `${MONTHS[m - 1]} ${dd}`; };
const fullDate = d => { const [y, m, dd] = d.split('-').map(Number); return LANG === 'zh' ? `${y}年${m}月${dd}日` : `${MONTHS[m - 1]} ${dd}, ${y}`; };
// Day labels only where they fit; dense eras keep their ticks and edge numbers.
const LABELED = new Set();
{ let last = -1e9; for (const d of DAY_LIST) { const x = DAY_AT[d].x; if (x - last >= 190) { LABELED.add(d); last = x; } } }

// ---------- looks: one entry per material ----------
const LK = {
  pencil: {paper: '#f3ede1', line: '#3b342d', lead: '#7a7066', base: null, hole: '#f3ede1', rim: null, pic: '#3b342d'},
  ink: {paper: '#f1efea', line: '#121015', lead: '#4a4744', base: '#1b1a1d', hole: '#f1efea', rim: '#2b2a2e', pic: '#d9d6d0'},
  chalk: {paper: '#1d2d5a', line: '#e8efff', lead: '#9fb0d8', base: '#23386e', hole: '#1d2d5a', rim: '#2a4280', pic: '#e8efff'},
  glass: {paper: '#eef1f6', line: '#26303f', lead: '#56607a', base: 'rgba(255,255,255,.42)', hole: 'rgba(40,50,70,.18)', rim: 'rgba(255,255,255,.55)', pic: '#ffffff'},
  color: {paper: '#f6f2ea', line: '#17161a', lead: '#5a5550', base: '#141316', hole: '#f6f2ea', rim: '#26252a', pic: '#ffffff'},
};
const lineCol = look => LK[look].line, leadCol = look => LK[look].lead;

// ---------- marks ----------
function pLine(c, pts, {w = 1.6, col = AFC.pencil, al = 1, seed = 1, close = false, rough = .9} = {}) {
  if (pts.length < 2) return;
  c.save(); c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let k = 0; k < 2; k++) { c.save(); c.globalAlpha *= al * (k ? .3 : .8); c.lineWidth = w * (k ? .55 : 1); wob(c, pts, rough + k * .9, seed + k * 13, close, {pressure: .55}); c.restore(); }
  c.restore();
}
function iLine(c, pts, {w = 2.6, col = INKC.line, al = 1, seed = 1, close = false, rough = .5} = {}) {
  if (pts.length < 2) return;
  c.save(); c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha *= al; c.lineWidth = w; wob(c, pts, rough, seed, close, {pressure: .85}); c.restore();
}
function mLine(c, look, pts, o = {}) {
  const map = o.col === undefined || o.col === AFC.pencil || o.col === INKC.line ? lineCol(look) : o.col === AFC.lead ? leadCol(look) : o.col;
  if (look === 'pencil' || look === 'chalk') return pLine(c, pts, {...o, col: map});
  iLine(c, pts, {...o, w: (o.w ?? 1.6) * (look === 'ink' ? 1.4 : 1.1), col: map});
}
function partial(pts, u) {
  if (u >= 1) return pts; if (u <= 0) return pts.slice(0, 1);
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const d = L[L.length - 1] * u, out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (L[i] <= d) out.push(pts[i]); else { const t = (d - L[i - 1]) / (L[i] - L[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]); break; } }
  return out;
}
// The handwriting face has a hairline space, so spaces get a minimum advance or mixed CJK/Latin loses its gaps.
const charAdvance = (c, ch, size) => ch === ' ' ? Math.max(c.measureText(ch).width, size * .34) : c.measureText(ch).width;
const textWidth = (c, text, size) => [...text].reduce((w, ch) => w + charAdvance(c, ch, size), 0);
function writeOn(c, text, x, y, {size = 48, col = AFC.pencil, p = 1, align = 'left', al = 1, rot = -.012, weight = 600} = {}) {
  if (p <= 0 || al <= 0 || !text) return;
  const chars = [...text], n = chars.length * clamp(p, 0, 1), full = Math.floor(n), frac = n - full;
  c.save(); c.font = `${weight} ${size}px ${AF_FONT}`; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  const w = textWidth(c, text, size), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  c.translate(x0, y); c.rotate(rot);
  let xx = 0; const base = c.globalAlpha;
  for (let i = 0; i < chars.length && i <= full; i++) {
    const a = base * al * (i < full ? 1 : frac); if (a <= 0) break;
    c.fillStyle = col; c.globalAlpha = a * .9; c.fillText(chars[i], xx, 0);
    c.globalAlpha = a * .2; c.fillText(chars[i], xx + .7, .5);
    xx += charAdvance(c, chars[i], size);
  }
  c.restore();
}
function arrow(c, look, from, to, {col, seed = 1, p = 1, bend = .22, al = 1} = {}) {
  if (p <= 0 || al <= 0) return;
  const mid = [(from[0] + to[0]) / 2 + (to[1] - from[1]) * bend, (from[1] + to[1]) / 2 - (to[0] - from[0]) * bend], pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([(1 - t) ** 2 * from[0] + 2 * (1 - t) * t * mid[0] + t * t * to[0], (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * mid[1] + t * t * to[1]]); }
  mLine(c, look, partial(pts, p), {w: 1.5, col, seed, al});
  if (p >= 1) { const a = Math.atan2(to[1] - pts[12][1], to[0] - pts[12][0]), h = 15;
    mLine(c, look, [[to[0] - Math.cos(a - .5) * h, to[1] - Math.sin(a - .5) * h], to, [to[0] - Math.cos(a + .5) * h, to[1] - Math.sin(a + .5) * h]], {w: 1.5, col, seed: seed + 1, al}); }
}
function marginNote(c, look, lines, at, target, p, {col, al = 1, from} = {}) {
  if (p <= 0 || al <= 0) return;
  const color = col ?? (look === 'ink' ? INKC.line : AFC.lead);
  lines.forEach((t, i) => writeOn(c, t, at[0], at[1] + i * 36, {size: 30, col: color, p: clamp(p * 1.6 - i * .35, 0, 1), al}));
  if (target) arrow(c, look, from ?? [at[0] - 14, at[1] - 10], target, {col: color, seed: (at[0] | 0) + 3, p: clamp(p * 1.5 - .4, 0, 1), al});
}
function star(c, x, y, r, col, points = 4) {
  if (r <= .4) return;
  c.save(); c.beginPath();
  for (let i = 0; i < points * 2; i++) { const a = i / (points * 2) * TAU - Math.PI / 2, rr = i % 2 ? r * (points === 4 ? .24 : .45) : r; i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = col; c.fill(); c.restore();
}

// ---------- screen overlays: AF's captions (top left), the product's card (top right) ----------
function caption(c, look, lines, tau, fade = [Infinity, Infinity]) {
  resetT(c); const al = 1 - sm(fade[0], fade[1], tau, lin); if (al <= 0) return; let y = 150;
  for (const [text, t0, t1, size = 50] of lines) { writeOn(c, L10N(text), 110, y, {size, col: lineCol(look), p: sm(t0, t1, tau, lin), al}); y += size * 1.45; }
}
function featureCard(c, look, card, tau, t0, t1 = Infinity) {
  if (!card || tau < t0) return;
  resetT(c); const al = 1 - sm(t1, t1 + .35, tau, lin); if (al <= 0) return;
  const x = W - 110;
  writeOn(c, L10N(card.title), x, 140, {size: 62, col: lineCol(look), p: sm(t0, t0 + .5, tau, lin), align: 'right', al});
  if (card.sub) writeOn(c, L10N(card.sub), x, 192, {size: 30, col: leadCol(look), p: sm(t0 + .35, t0 + 1.1, tau, lin), align: 'right', al});
  mLine(c, look, partial([[x - 240, 212], [x - 120, 209], [x, 214]], sm(t0 + .5, t0 + .9, tau, lin)), {w: 1.3, col: AFC.gold, seed: 9, al});
}
function dateLine(c, look, text, al = 1) {
  if (!text || al <= 0) return; resetT(c);
  writeOn(c, text, W - 110, 252, {size: 27, col: leadCol(look), align: 'right', weight: 400, rot: 0, al});
}

// ---------- frame pictures: tiny photos in the negative, a different subject per commit ----------
const PIC_TONES = [['#f2b880', '#c8604e'], ['#9cc7e8', '#3d6fa8'], ['#bfe0b0', '#4f8a5b'], ['#f6d46b', '#d98a3a'], ['#d8b8e8', '#6a55a8'], ['#f3a7b3', '#a8506b']];
function framePicture(c, look, x, y, w, h, seed, k = 1) {
  const kind = Math.floor(hash(seed, 3) * 6), col = LK[look].pic;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (look === 'ink') { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#6d6a66'); g.addColorStop(1, '#3a3836'); c.fillStyle = g; c.fillRect(x, y, w, h); }
  else if (look === 'chalk') { c.fillStyle = '#16244a'; c.fillRect(x, y, w, h); }
  else if (look === 'glass' || look === 'color') { const [a, b] = PIC_TONES[kind], g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, look === 'glass' ? mix(a, '#ffffff', .35) : a); g.addColorStop(1, look === 'glass' ? mix(b, '#ffffff', .35) : b); c.fillStyle = g; c.fillRect(x, y, w, h); }
  c.globalAlpha *= k;
  const stroke = look === 'pencil' || look === 'chalk' ? look : 'pencil';
  const L = (pts, o = {}) => mLine(c, stroke, pts.map(([u, v]) => [x + u * w, y + v * h]), {w: 1.2, col, seed: seed + (o.s || 0), rough: .4, ...o});
  if (w < 30) { L([[0, .62 + hash(seed, 5) * .2], [1, .5 + hash(seed, 6) * .3]], {w: 1}); c.restore(); return; }
  const sun = (u, v, r) => { c.fillStyle = look === 'pencil' ? alpha(AFC.gold, .5) : look === 'chalk' ? '#e8efff' : '#fff6dc'; c.beginPath(); c.arc(x + u * w, y + v * h, r, 0, TAU); c.fill(); };
  if (kind === 0) { sun(.74, .3, 6); L([[0, .9], [.28, .42], [.46, .7], [.64, .34], [1, .88]]); }
  else if (kind === 1) { c.fillStyle = look === 'pencil' ? alpha(AFC.pencil, .12) : alpha(col, .5); c.beginPath(); c.arc(x + w * .5, y + h * .42, h * .2, 0, TAU); c.fill(); L([[.5, .22], [.62, .3], [.62, .52], [.5, .62], [.38, .52], [.38, .3], [.5, .22]]); L([[.2, 1], [.3, .74], [.5, .66], [.7, .74], [.8, 1]], {s: 1}); }
  else if (kind === 2) { L([[.5, .95], [.5, .55]]); L([[.3, .62], [.36, .3], [.5, .14], [.66, .3], [.7, .62], [.3, .62]], {s: 2}); L([[0, .95], [1, .95]], {s: 3}); }
  else if (kind === 3) { L([[0, .95], [0, .6], [.18, .6], [.18, .38], [.34, .38], [.34, .72], [.5, .72], [.5, .28], [.64, .28], [.64, .58], [.8, .58], [.8, .46], [1, .46]]); }
  else if (kind === 4) { sun(.3, .38, 5); L([[0, .62], [1, .62]]); L([[.56, .6], [.62, .44], [.64, .6]], {s: 4}); L([[.1, .8], [.3, .76], [.5, .8], [.7, .76], [.9, .8]], {s: 5, w: .8}); }
  else { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; L([[.5, .45], [.5 + Math.cos(a) * .12, .45 + Math.sin(a) * .2]], {s: i}); } L([[.5, .6], [.52, .95]], {s: 9}); }
  c.restore();
}

// ---------- the strip ----------
function stripPath(x0, x1) { return rectPath(x0, STRIP.top, x1 - x0, STRIP.h); }
function drawStrip(c, look, view, {reveal = 1e9} = {}) {
  const P = LK[look], x0 = Math.max(-600, view[0] - 100), x1 = Math.min(view[1] + 100, reveal, ROLL_END + 200), top = STRIP.top, h = STRIP.h;
  if (x1 <= x0) return;
  const base = stripPath(x0, x1);
  if (look === 'pencil') { c.fillStyle = alpha(AFC.pencil, .05); c.fill(base); formHatch(c, base, [x0, top, x1 - x0, h], {color: AFC.lead, spacing: 7, length: 16, width: .6, opacity: .22, tone: () => .45, direction: () => 1.05, seed: 5}); }
  else { c.fillStyle = P.base; c.fill(base); }
  if (look === 'pencil' || look === 'chalk' || look === 'glass') {
    const K = 360;
    for (let k = Math.floor(x0 / K); k * K < x1; k++) {
      const a = Math.max(k * K, x0), b = Math.min((k + 1) * K + 4, x1);
      const col = look === 'glass' ? 'rgba(255,255,255,.95)' : P.line;
      mLine(c, look, [[a, top], [b, top]], {w: 2.2, seed: 100 + k, col}); mLine(c, look, [[a, top + h], [b, top + h]], {w: 1.8, seed: 200 + k, col: look === 'glass' ? 'rgba(120,135,160,.6)' : col});
    }
  }
  for (let x = Math.ceil(x0 / 28) * 28; x < x1 - 14; x += 28) for (const y of [top + 7, top + h - 18]) {
    const hole = roundRectPath(x, y, 14, 11, 2.5);
    c.fillStyle = P.hole; c.fill(hole);
    if (look === 'pencil') pLine(c, rectPts(x, y, 14, 11), {w: .9, close: true, seed: x + y, rough: .3, al: .8});
  }
}
// A frame is clear until AF passes it, then it flashes and its picture develops in.
function drawCommitFrame(c, look, f, k) {
  const fw = Math.min(STRIP.fw, f.w * .82), y = STRIP.top + (STRIP.h - STRIP.fh) / 2, x = f.x + (f.w - fw) / 2, P = LK[look];
  const box = roundRectPath(x, y, fw, STRIP.fh, Math.min(3, fw / 4));
  if (k <= 0) { if (look === 'pencil') pLine(c, rectPts(x, y, fw, STRIP.fh), {w: 1, close: true, seed: f.seed, rough: .4, al: .45}); else { c.fillStyle = P.rim; c.fill(box); } return; }
  const flash = 1 - sm(0, .25, k, lin);
  c.fillStyle = look === 'pencil' ? AFC.paper : look === 'chalk' ? '#16244a' : '#55524e'; c.fill(box);
  framePicture(c, look, x, y, fw, STRIP.fh, f.seed, sm(.15, .7, k, lin));
  if (flash > 0) { c.save(); c.globalAlpha *= flash; c.fillStyle = '#fff8dc'; c.fill(box); c.restore(); }
  if (look === 'pencil' || look === 'chalk') mLine(c, look, rectPts(x, y, fw, STRIP.fh), {w: 1.2, close: true, seed: f.seed, rough: .4});
  if (look === 'glass') { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1; c.stroke(box); }
  if (look === 'color' && k >= 1) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x + fw / 2, y + STRIP.fh / 2, 4, x + fw / 2, y + STRIP.fh / 2, 70); g.addColorStop(0, 'rgba(255,236,190,.45)'); g.addColorStop(1, 'rgba(255,236,190,0)'); c.fillStyle = g; c.fillRect(x - 60, y - 60, fw + 120, STRIP.fh + 120); c.restore(); }
}
function drawFrames(c, look, view, expose) {
  for (const f of FRAMES) { if (f.x + f.w < view[0] - 60 || f.x > view[1] + 60) continue; drawCommitFrame(c, look, f, expose(f)); }
}
function drawDayMarks(c, look, view, shown) {
  for (const d of DAY_LIST) {
    const D = DAY_AT[d]; if (D.x > view[1] + 60 || D.end < view[0] - 240) continue;
    const p = shown(d); if (p <= 0) continue;
    mLine(c, look, partial([[D.x - 6, STRIP.top - 8], [D.x - 5, STRIP.top + STRIP.h + 10]], clamp(p * 2, 0, 1)), {w: 1.6, col: AFC.red, seed: D.x | 0, al: .8});
    if (!LABELED.has(d)) continue;
    writeOn(c, dayLabel(d), D.x + 2, STRIP.top + STRIP.h + 50, {size: 34, col: lineCol(look), p: clamp(p * 1.4, 0, 1), rot: 0});
    const edge = `${d.slice(2)} ▸ ${D.count}`;
    c.save(); c.font = `700 13px ${AF_FONT}`; c.fillStyle = look === 'pencil' ? AFC.gold : '#e9c46a'; c.globalAlpha *= clamp(p * 2 - 1, 0, 1); c.fillText(edge, D.x + 4, STRIP.top + STRIP.h - 22); c.restore();
  }
}

// ---------- props ----------
// The lifted print: a photo AF pulls up out of the strip to look closely. zoom > 1 pushes into the peak.
function drawPrint(c, look, x, y, {w = 330, h = 220, rot = 0, flip = 0, zoom = 1, tiles = 0, live = 0, exif = 0, tau = 0, al = 1} = {}) {
  if (al <= 0) return;
  const ink = look === 'ink', sx = Math.cos(flip * Math.PI);
  c.save(); c.globalAlpha *= al; c.translate(x, y); c.rotate(rot + live * .035 * Math.sin(tau * 14)); c.scale(Math.max(.02, Math.abs(sx)), 1);
  const outer = roundRectPath(-w / 2 - 14, -h / 2 - 14, w + 28, h + 44, 4);
  c.save(); c.translate(6, 8); c.fillStyle = 'rgba(0,0,0,.10)'; c.fill(outer); c.restore();
  c.fillStyle = ink ? INKC.paper : AFC.white; c.fill(outer);
  mLine(c, look, rectPts(-w / 2 - 14, -h / 2 - 14, w + 28, h + 44), {w: 1.6, close: true, seed: 401, rough: .5});
  if (sx >= 0) {
    c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
    const focus = [w * .12, -h * .22];
    c.translate(focus[0], focus[1]); c.scale(zoom, zoom); c.translate(-focus[0], -focus[1]);
    const sky = c.createLinearGradient(0, -h / 2, 0, h / 2);
    if (ink) { sky.addColorStop(0, '#d9d6d0'); sky.addColorStop(1, '#8b8884'); } else { sky.addColorStop(0, '#f6f0e2'); sky.addColorStop(1, '#ece2cc'); }
    c.fillStyle = sky; c.fillRect(-w, -h, w * 2, h * 2);
    c.fillStyle = ink ? '#f6f3ec' : alpha(AFC.gold, .45); c.beginPath(); c.arc(w * .3, -h * .28, 16, 0, TAU); c.fill();
    const ridge = [[-w / 2 - 10, h * .3], [-w * .28, -h * .05], [-w * .12, h * .12], [w * .12, -h * .22], [w * .3, h * .02], [w / 2 + 10, h * .22]];
    const mountain = polyPath([...ridge, [w / 2 + 10, h], [-w / 2 - 10, h]]);
    c.fillStyle = ink ? '#4d4a47' : alpha(AFC.lead, .18); c.fill(mountain);
    if (!ink) formHatch(c, mountain, [-w, -h, w * 2, h * 2], {color: AFC.lead, spacing: 5, length: 12, width: .6, opacity: .35, tone: (xx, yy) => clamp(.2 + (yy + h * .2) / h * .6, 0, .7), direction: () => 1, seed: 402});
    mLine(c, look === 'ink' ? 'pencil' : look, ridge, {w: 1.8, seed: 403, col: ink ? '#f1efea' : AFC.pencil});
    const snow = [[w * .06, -h * .14], [w * .12, -h * .22], [w * .19, -h * .13], [w * .14, -h * .1], [w * .1, -h * .12]];
    c.fillStyle = ink ? '#f1efea' : AFC.white; c.fill(polyPath(snow));
    const cl = [w * .12, -h * .22];
    c.strokeStyle = ink ? '#121015' : AFC.pencil; c.lineWidth = .9; c.lineCap = 'round';
    c.beginPath(); c.arc(cl[0], cl[1] - 7, 1.6, 0, TAU); c.moveTo(cl[0], cl[1] - 5.4); c.lineTo(cl[0], cl[1] - 1.5); c.moveTo(cl[0], cl[1] - 1.5); c.lineTo(cl[0] - 1.5, cl[1]); c.moveTo(cl[0], cl[1] - 1.5); c.lineTo(cl[0] + 1.5, cl[1]); c.moveTo(cl[0] - 2, cl[1] - 4); c.lineTo(cl[0] + 2.4, cl[1] - 6); c.stroke();
    c.fillStyle = AFC.red; c.beginPath(); c.moveTo(cl[0] + 2.4, cl[1] - 6); c.lineTo(cl[0] + 2.4, cl[1] - 10); c.lineTo(cl[0] + 5.4, cl[1] - 8.6); c.closePath(); c.fill();
    c.restore();
    if (tiles > 0) {
      c.save(); c.strokeStyle = alpha(AFC.blue, .55 * Math.sin(Math.PI * clamp(tiles, 0, 1))); c.lineWidth = 1.2; c.setLineDash([4, 5]);
      const n = 4; for (let i = 1; i < n; i++) { c.beginPath(); c.moveTo(-w / 2 + i * w / n, -h / 2); c.lineTo(-w / 2 + i * w / n, h / 2); c.stroke(); c.beginPath(); c.moveTo(-w / 2, -h / 2 + i * h / n); c.lineTo(w / 2, -h / 2 + i * h / n); c.stroke(); }
      c.restore();
    }
    if (live > 0) {
      c.save(); c.globalAlpha *= clamp(live * 3, 0, 1); const bx = -w / 2 + 12, by = -h / 2 + 12;
      c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(roundRectPath(bx, by, 72, 24, 12));
      c.strokeStyle = '#2b2a2e'; c.lineWidth = 1.4; c.beginPath(); c.arc(bx + 14, by + 12, 6, 0, TAU); c.stroke(); c.beginPath(); c.arc(bx + 14, by + 12, 2.5, 0, TAU); c.fill();
      c.font = `700 15px ${AF_FONT}`; c.fillStyle = '#2b2a2e'; c.fillText('LIVE', bx + 26, by + 17); c.restore();
    }
    if (zoom > 1.05) writeOn(c, `${zoom.toFixed(1)}×`, w / 2 - 8, h / 2 + 24, {size: 22, col: ink ? INKC.line : AFC.lead, align: 'right', rot: 0, weight: 400});
  } else {
    const rows = ['ƒ/8  ·  1/250 s', 'ISO 100  ·  35 mm', LANG === 'zh' ? 'GPS  ·  海拔 3,120 m' : 'GPS  ·  alt 3,120 m'];
    const k = w / 330;
    writeOn(c, 'EXIF', -w / 2 + 6 * k, -h / 2 + 34 * k, {size: 32 * k, col: ink ? INKC.line : AFC.pencil, rot: 0, p: sm(.55, .75, flip, lin)});
    rows.forEach((r, i) => writeOn(c, r, -w / 2 + 6 * k, -h / 2 + (90 + i * 44) * k, {size: 28 * k, col: ink ? INKC.line : AFC.pencil, rot: 0, weight: 400, p: sm(.6 + i * .08, .85 + i * .08, flip, lin)}));
  }
  c.restore();
}
// The fixer tray: a shallow darkroom tray set into the strip at the v0.1.0 seam.
function drawTray(c, look, x, {splash = 0, ripple = 0} = {}) {
  const y = STRIP.top - 6, w = 230, d = 34, ink = look === 'ink';
  const rim = [[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 14, y + d], [x - w / 2 + 14, y + d]];
  c.fillStyle = ink ? '#dcd8d0' : AFC.paper; c.fill(polyPath(rim));
  const liquid = polyPath([[x - w / 2 + 12, y + 6], [x + w / 2 - 12, y + 6], [x + w / 2 - 18, y + d - 5], [x - w / 2 + 18, y + d - 5]]);
  c.fillStyle = ink ? '#3b3a3f' : alpha('#8aa0b8', .45); c.fill(liquid);
  if (!ink) formHatch(c, liquid, [x - w / 2, y, w, d], {color: '#5d7389', spacing: 4, length: 12, width: .6, opacity: .4, tone: () => .5, direction: () => .1, seed: 501});
  mLine(c, look, [...rim, rim[0]], {w: 2, seed: 502, rough: .4});
  if (ripple > 0) for (let i = 0; i < 2; i++) { const r = (ripple + i * .35) % 1; mLine(c, look, ellPts(x, y + d * .5, 30 + r * 80, 4 + r * 7, 0, 30), {w: 1.2, close: true, al: (1 - r) * .8, seed: 510 + i, col: ink ? INKC.light : '#5d7389'}); }
  writeOn(c, LANG === 'zh' ? '定影' : 'FIXER', x, y + d + 30, {size: 22, col: ink ? INKC.line : AFC.lead, align: 'center', rot: 0});
  if (splash > 0 && splash < 1) for (let i = 0; i < 14; i++) {
    const a = -Math.PI * (.12 + .76 * hash(i, 81)), sp = 260 + hash(i, 82) * 300, tt = splash * .5, px = x + Math.cos(a) * sp * tt, py = y + Math.sin(a) * sp * tt + 900 * tt * tt;
    c.fillStyle = ink ? INKC.line : '#5d7389'; c.beginPath(); c.arc(px, py, 3 + hash(i, 84) * 4, 0, TAU); c.fill();
  }
}
// The S3 bucket and the repo folder that tip photos onto the strip.
function drawBucket(c, look, x, y, tilt, label) {
  c.save(); c.translate(x, y); c.rotate(tilt);
  const body = [[-46, -38], [46, -38], [34, 40], [-34, 40]];
  c.fillStyle = look === 'ink' ? INKC.light : AFC.paper; c.fill(polyPath(body));
  if (look !== 'ink') formHatch(c, polyPath(body), [-50, -40, 100, 84], {color: AFC.lead, spacing: 5, length: 11, width: .6, opacity: .3, tone: () => .4, direction: () => 1.1, seed: 601});
  mLine(c, look, [...body, body[0]], {w: 2, seed: 602, rough: .5});
  mLine(c, look, ellPts(0, -38, 46, 9, 0, 24), {w: 1.6, close: true, seed: 603});
  writeOn(c, label, 0, 12, {size: 26, col: look === 'ink' ? INKC.line : AFC.pencil, align: 'center', rot: 0});
  c.restore();
}
function drawFolder(c, look, x, y, tilt, label) {
  c.save(); c.translate(x, y); c.rotate(tilt);
  const body = [[-50, -30], [-16, -30], [-8, -40], [50, -40], [50, 34], [-50, 34]];
  c.fillStyle = look === 'ink' ? INKC.light : AFC.paper; c.fill(polyPath(body));
  mLine(c, look, [...body, body[0]], {w: 2, seed: 612, rough: .5});
  writeOn(c, label, 0, 12, {size: 24, col: look === 'ink' ? INKC.line : AFC.pencil, align: 'center', rot: 0});
  c.restore();
}
