'use strict';
// Props that stand beside the strip in Acts II to V. Each sits at the x of the commit it rests on,
// so it scrolls past with the page. Times are film seconds; `look` is the material of the page layer.

const UP = STRIP.top - 20;
const fillOf = look => look === 'chalk' ? '#23386e' : look === 'glass' ? 'rgba(255,255,255,.62)' : look === 'ink' ? '#f7f5f0' : AFC.paper;
function card2(c, look, pts, seed, {fill, w = 2} = {}) {
  c.fillStyle = fill ?? fillOf(look); c.fill(polyPath(pts));
  mLine(c, look, [...pts, pts[0]], {w, seed, rough: .5});
}
function label(c, look, text, x, y, size = 24, o = {}) { writeOn(c, text, x, y, {size, col: lineCol(look), align: 'center', rot: 0, ...o}); }

// Storage: S3 bucket tips photos in; a local folder (#40) and an Eagle library (#122) are pinned where they landed.
function drawStorage(c, look, t) {
  const s = t - 28;
  if (s > -1 && s < 8) {
    const bx = SEAM + 820, drop = easeOut(clamp(s / .8, 0, 1)), y = lerp(-150, 430, drop), tilt = sm(.9, 1.4, s) * .9;
    drawBucket(c, look, bx, y, tilt, 'S3');
    for (let i = 0; i < 5; i++) { const u = clamp((s - 1.2 - i * .18) / .6, 0, 1); if (u <= 0 || u >= 1) continue;
      const p = [lerp(bx + 40, bx - 80 + i * 60, u), lerp(y + 20, STRIP.top + 40, u * u)]; c.save(); c.translate(p[0], p[1]); c.rotate(u * 3 + i); c.fillStyle = look === 'ink' ? '#d9d6d0' : AFC.white; c.fillRect(-18, -13, 36, 26); c.strokeStyle = lineCol(look); c.lineWidth = 1.4; c.strokeRect(-18, -13, 36, 26); c.restore(); }
    const gx = SEAM + 1500, gy = lerp(-150, 450, easeOut(clamp((s - 1.6) / .8, 0, 1)));
    drawFolder(c, look, gx, gy, sm(2.6, 3.1, s) * -.5, 'GitHub');
  }
}

// The map: frames with GPS drop pins onto a hand-drawn map beside the strip.
const MAP_AT = () => [routeKey(37.4) + 470, 575];
function drawMap(c, look, t) {
  const s = t - 33.4; if (s < 0 || t > 41) return;
  const [mx, my] = MAP_AT(), w = 440, h = 200, k = easeOut(clamp(s / .7, 0, 1)) * (1 - sm(40.2, 40.8, t, lin));
  c.save(); c.translate(mx, my + (1 - k) * 60); c.globalAlpha *= k; c.rotate(-.02);
  const sheet = [[-w / 2, -h / 2], [w / 2, -h / 2 + 6], [w / 2 - 4, h / 2], [-w / 2 + 4, h / 2 - 4]];
  card2(c, look, sheet, 801, {fill: look === 'ink' ? '#f4f1ea' : AFC.white});
  mLine(c, look, [[-w / 2 + 20, 30], [-120, 10], [-40, 40], [40, -10], [120, 20], [w / 2 - 20, -30]], {w: 1.2, seed: 802, col: AFC.lead});
  mLine(c, look, [[-w / 2 + 10, -60], [-100, -80], [-20, -50], [60, -90], [140, -60], [w / 2 - 10, -80]], {w: 1, seed: 803, col: AFC.lead, al: .7});
  mLine(c, look, [[-60, h / 2 - 10], [-40, 40], [-70, -20], [-50, -h / 2 + 10]], {w: 2.2, seed: 804, col: '#5d7389', al: .8});
  const pins = [[-150, 20], [-90, -40], [-10, 60], [60, -20], [130, 50], [170, -70], [20, -80]];
  pins.forEach(([px, py], i) => {
    const u = clamp((s - .8 - i * .5) / .5, 0, 1); if (u <= 0) return;
    const src = [routeKey(34.2 + i * .5) + 40 - mx, STRIP.top + 20 - my], p = [lerp(src[0], px, easeOut(u)), lerp(src[1], py, easeOut(u)) - Math.sin(u * Math.PI) * 120];
    c.fillStyle = AFC.red; c.beginPath(); c.arc(p[0], p[1] - 14, 7, 0, TAU); c.fill();
    mLine(c, look, [[p[0], p[1] - 8], [p[0], p[1]]], {w: 1.8, seed: 810 + i});
    if (u >= 1) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(p[0] - 2, p[1] - 16, 2, 0, TAU); c.fill(); }
  });
  c.restore();
}

// HDR: one frame glows brighter than the paper around it.
function drawHDRGlow(c, look, t) {
  const s = t - 40.4; if (s < 0 || t > 47) return;
  const f = FRAMES[199], x = f.x + f.w / 2, y = STRIP.top + STRIP.h / 2, k = sm(0, .8, s) * (1 - sm(5.2, 6.4, s));
  const lift = easeOut(clamp(s / .8, 0, 1)) * 105 * (1 - sm(5.2, 6.4, s)), cy = y - lift, pw = 150, ph = 100;
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, cy, 10, x, cy, 190 * k + 1); g.addColorStop(0, alpha('#fff4c2', .9 * k)); g.addColorStop(.4, alpha('#ffd98a', .35 * k)); g.addColorStop(1, 'rgba(255,220,140,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, cy, 190 * k + 1, 0, TAU); c.fill(); c.restore();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + s * .3; mLine(c, look, [[x + Math.cos(a) * 95, cy + Math.sin(a) * 70], [x + Math.cos(a) * (95 + 50 * k), cy + Math.sin(a) * (70 + 40 * k)]], {w: 1.6, col: AFC.gold, seed: 830 + i, al: k}); }
  c.save(); c.fillStyle = '#fffdf6'; c.fillRect(x - pw / 2 - 8, cy - ph / 2 - 8, pw + 16, ph + 16);
  framePicture(c, look === 'ink' ? 'pencil' : look, x - pw / 2, cy - ph / 2, pw, ph, f.seed, 1); c.globalAlpha = .55 * k; c.fillStyle = '#fffbe6'; c.fillRect(x - pw / 2, cy - ph / 2, pw, ph); c.restore();
  mLine(c, look, rectPts(x - pw / 2 - 8, cy - ph / 2 - 8, pw + 16, ph + 16), {w: 1.6, close: true, seed: 840});
  const st = clamp((s - 1.2) / .3, 0, 1);
  if (st > 0) { c.save(); c.translate(x + 70, cy - 60); c.rotate(-.2); c.scale(lerp(2.2, 1, easeOut(st)), lerp(2.2, 1, easeOut(st))); c.globalAlpha *= st;
    c.strokeStyle = AFC.red; c.lineWidth = 3; c.strokeRect(-38, -18, 76, 36); c.font = `700 26px ${AF_FONT}`; c.fillStyle = AFC.red; c.textAlign = 'center'; c.fillText('HDR', 0, 9); c.restore(); }
}

// The first stumble: frames sorted into piles by camera; the piles topple (revert of #72).
function drawPiles(c, look, t) {
  const s = t - 44.2; if (s < 0 || t > 52) return;
  const x0 = xOf(221) + 40, cams = ['X100V', 'A7C', 'iPhone'], fall = sm(1.6, 2.2, s);
  cams.forEach((name, i) => {
    const px = x0 + i * 120, base = STRIP.top - 4, k = easeOut(clamp((s - i * .25) / .5, 0, 1));
    c.save(); c.translate(px, base); c.rotate(fall * (i - 1 || .6) * 1.2 * (1 + i * .1)); c.translate(0, fall * 30 * (i + 1) * sm(1.8, 2.3, s));
    for (let j = 0; j < 4; j++) { if (k * 4 < j) break; const y = -18 - j * 22; c.fillStyle = look === 'ink' ? '#55524e' : AFC.white; c.fillRect(-26 + (j % 2) * 3, y, 52, 20); mLine(c, look, rectPts(-26 + (j % 2) * 3, y, 52, 20), {w: 1.2, close: true, seed: 850 + i * 7 + j}); }
    c.restore();
    if (fall < .3) label(c, look, name, px, base - 110, 20, {al: k});
  });
}
// The second one: a speed-up that got reverted, a jam puff on the strip.
function drawJam(c, look, t) {
  const s = t - 48.4; if (s < -.2 || t > 55) return;
  const x = xOf(247);
  for (let i = 0; i < 6; i++) { const k = clamp(s / .7, 0, 1), r = (14 + i * 6) * (.4 + k); mLine(c, look, ellPts(x + (i - 3) * 16, STRIP.top - 10 - k * 30 - i * 3, r, r * .7, 0, 16), {w: 1.2, close: true, seed: 870 + i, al: (1 - k) * .8}); }
}

// Search: a box pinned above the strip types a query; matching frames light up.
function drawSearch(c, look, t) {
  const s = t - 49.6; if (s < 0 || t > 53.8) return;
  const x = xOf(262) + 330, y = 580, k = easeOut(clamp(s / .5, 0, 1)) * (1 - sm(53.2, 53.7, t, lin));
  c.save(); c.globalAlpha *= k;
  card2(c, look, [[x - 150, y - 30], [x + 150, y - 30], [x + 150, y + 30], [x - 150, y + 30]], 880, {fill: look === 'ink' ? '#ffffff' : AFC.white});
  c.strokeStyle = lineCol(look); c.lineWidth = 2.2; c.beginPath(); c.arc(x - 118, y - 2, 11, 0, TAU); c.moveTo(x - 110, y + 6); c.lineTo(x - 100, y + 16); c.stroke();
  const q = 'tokyo', n = Math.floor(clamp((s - .5) / .9, 0, 1) * q.length);
  writeOn(c, q.slice(0, n) + (Math.floor(t * 3) % 2 && n < q.length ? '|' : ''), x - 86, y + 10, {size: 30, col: lineCol(look), rot: 0, weight: 400});
  c.restore();
  if (s > 1.5) for (const i of [256, 259, 262, 263, 267]) { const f = FRAMES[i], fw = Math.min(STRIP.fw, f.w * .82); c.save(); c.strokeStyle = AFC.blue; c.lineWidth = 3; c.globalAlpha *= sm(1.5, 1.8, s) * (1 - sm(3.4, 4.0, s)); c.strokeRect(f.x + (f.w - fw) / 2 - 3, STRIP.top + 28, fw + 6, STRIP.fh + 6); c.restore(); }
}

// The static-site press: one new photo, and the whole strip behind gets reprinted before it can deploy.
const PRESS_X = () => xOf(270) + 40;
function drawPress(c, look, t) {
  const s = t - 53.4; if (s < 0 || t > 62) return;
  const x = PRESS_X(), roll = sm(.9, 2.6, s, easeInOutSine), rx = x - roll * 1300 + sm(2.6, 3.0, s) * 1300 * 0;
  const k = easeOut(clamp(s / .5, 0, 1));
  c.save(); c.globalAlpha *= k;
  card2(c, look, [[x + 60, UP - 150], [x + 200, UP - 150], [x + 200, UP], [x + 60, UP]], 890);
  label(c, look, 'build:', x + 130, UP - 100, 22); label(c, look, 'manifest', x + 130, UP - 72, 22);
  mLine(c, look, [[x + 60, UP - 40], [x + 200, UP - 40]], {w: 1.4, seed: 891});
  c.restore();
  if (s > .9 && s < 3.2) {
    const al = 1 - sm(2.8, 3.2, s, lin), ry = STRIP.top - 18;
    c.save(); c.globalAlpha *= al; c.fillStyle = look === 'ink' ? '#3a3836' : alpha(AFC.pencil, .25); c.fill(roundRectPath(rx - 22, ry - 26, 44, STRIP.h + 60, 20)); c.restore();
    mLine(c, look, rectPts(rx - 22, ry - 26, 44, STRIP.h + 60), {w: 1.6, close: true, seed: 892, al});
    for (let i = 0; i < 3; i++) mLine(c, look, [[rx + 30 + i * 18, ry - 10], [rx + 90 + i * 30, ry - 10]], {w: 1, seed: 893 + i, al: al * .7});
  }
  const st = clamp((s - 3.0) / .25, 0, 1);
  if (st > 0) { c.save(); c.translate(x + 130, UP - 190); c.rotate(-.12); const sc = lerp(2.4, 1, easeOut(st)); c.scale(sc, sc); c.globalAlpha *= st * (1 - sm(5.5, 6.2, s, lin));
    c.strokeStyle = AFC.red; c.lineWidth = 3; c.strokeRect(-70, -22, 140, 44); c.font = `700 28px ${AF_FONT}`; c.fillStyle = AFC.red; c.textAlign = 'center'; c.fillText(LANG === 'zh' ? '重新部署' : 'deploy', 0, 10); c.restore(); }
}

// The darkroom (a server) and its desk (the dashboard), drawn in blueprint chalk.
function drawDarkroom(c, look, t) {
  const s = t - 60.6; if (s < -.5 || t > 72) return;
  const x = xOf(292) + 200, base = STRIP.top - 4, k = clamp(s / 1.2, 0, 1), P = LK[look];
  const hut = [[x - 20, base], [x - 20, base - 200], [x + 110, base - 290], [x + 240, base - 200], [x + 240, base]];
  mLine(c, look, partial([...hut, hut[0]], k), {w: 2.2, seed: 901});
  if (k >= 1) { c.fillStyle = look === 'chalk' ? '#172651' : fillOf(look); c.fill(polyPath(hut)); mLine(c, look, [...hut, hut[0]], {w: 2.2, seed: 901}); }
  mLine(c, look, partial([[x + 70, base], [x + 70, base - 120], [x + 150, base - 120], [x + 150, base]], clamp(k * 1.5 - .5, 0, 1)), {w: 1.6, seed: 902});
  if (s > 1) { const g = c.createRadialGradient(x + 110, base - 205, 2, x + 110, base - 205, 60); g.addColorStop(0, 'rgba(255,70,60,.9)'); g.addColorStop(1, 'rgba(255,70,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(x + 110, base - 205, 60, 0, TAU); c.fill(); }
  label(c, look, LANG === 'zh' ? '服务端' : 'server', x + 110, base - 150, 22, {p: sm(1.1, 1.6, s, lin)});
  const dx = x + 300, sk = clamp((s - .6) / 1, 0, 1);
  mLine(c, look, partial([[dx, base], [dx, base - 90], [dx + 200, base - 90], [dx + 200, base]], sk), {w: 2, seed: 903});
  const scr = [[dx + 20, base - 100], [dx + 20, base - 230], [dx + 190, base - 230], [dx + 190, base - 100]];
  if (sk > .5) { c.fillStyle = look === 'chalk' ? '#172651' : fillOf(look); c.fill(polyPath(scr)); mLine(c, look, [...scr, scr[0]], {w: 1.8, seed: 904});
    for (let i = 0; i < 6; i++) { const cx = dx + 34 + (i % 3) * 52, cy = base - 214 + Math.floor(i / 3) * 44; c.strokeStyle = P.line; c.lineWidth = 1.2; c.strokeRect(cx, cy, 44, 34); }
    const edited = sm(2.2, 2.3, s, lin), title = LANG === 'zh' ? (edited ? '京都清晨' : '未命名') : (edited ? 'Kyoto dawn' : 'Untitled');
    writeOn(c, title, dx + 36, base - 116, {size: 18, col: edited ? '#7fe7ff' : P.line, rot: 0, weight: 700});
    label(c, look, LANG === 'zh' ? '管理后台' : 'dashboard', dx + 100, base - 30, 20);
  }
  if (s > 2.3 && s < 3.4) { const f = FRAMES[293], u = sm(2.3, 2.9, s, lin); arrow(c, look, [dx + 40, base - 100], [f.x + f.w / 2, STRIP.top + 10], {col: '#7fe7ff', seed: 905, p: u}); }
}

// The doors: the same darkroom, one door per gallery. Names are illustrative.
const DOORS = ['mia', 'kenji', 'lea', 'ana'];
function drawDoors(c, look, t) {
  const s = t - 65.2; if (s < -.5 || t > 80) return;
  const x0 = xOf(316) + 110, base = STRIP.top - 4;
  DOORS.forEach((n, i) => {
    const x = x0 + i * 145, k = easeOut(clamp((s - i * .25) / .5, 0, 1)); if (k <= 0) return;
    const dh = 170 * k, door = [[x, base], [x, base - dh], [x + 100, base - dh], [x + 100, base]];
    c.fillStyle = look === 'chalk' ? '#172651' : fillOf(look); c.fill(polyPath(door)); mLine(c, look, [...door, door[0]], {w: 2, seed: 910 + i});
    const open = sm(1.6 + i * .2, 2.1 + i * .2, s);
    if (open > 0) { c.fillStyle = '#ffd98a'; c.globalAlpha *= .35 * open; c.fillRect(x + 4, base - dh + 4, 92 * open, dh - 4); c.globalAlpha /= .35 * open || 1; }
    if (k >= 1) { c.fillStyle = look === 'chalk' ? '#e8efff' : AFC.white; c.fillRect(x + 8, base - dh - 34, 130, 26); writeOn(c, `${n}.afilmory.art`, x + 12, base - dh - 14, {size: 16, col: '#1d2d5a', rot: 0, weight: 700}); }
    if (open > .5 && i < 3) afCanister(c, x + 50 + 30 * (1 - open), base - 30, {look: look === 'chalk' ? 'chalk' : 'pencil', scale: .5});
  });
  const sx = xOf(429), sy = base - 170;
  if (t > 70) { mLine(c, look, [[sx, base], [sx, sy]], {w: 2.4, seed: 920}); c.fillStyle = AFC.green; c.fill(roundRectPath(sx - 90, sy - 44, 180, 40, 6)); writeOn(c, 'photos.lea.me', sx, sy - 16, {size: 20, col: '#ffffff', align: 'center', rot: 0, weight: 700}); }
}
// The box: the same darkroom packed to carry home.
function drawBox(c, look, t) {
  const s = t - 70.6; if (s < -.5 || t > 80) return;
  const x = xOf(340) + 40, base = STRIP.top - 4, k = easeOut(clamp(s / .5, 0, 1));
  c.save(); c.translate(x, base); c.scale(k, k);
  const box = [[-70, 0], [-70, -100], [70, -100], [70, 0]];
  c.fillStyle = look === 'chalk' ? '#2c4a8a' : '#c9a36a'; c.fill(polyPath(box)); mLine(c, look, [...box, box[0]], {w: 2, seed: 930});
  mLine(c, look, [[-70, -100], [-40, -130], [100, -130], [70, -100]], {w: 1.8, seed: 931}); mLine(c, look, [[70, 0], [100, -30], [100, -130]], {w: 1.8, seed: 932});
  const mini = [[-30, -100], [-30, -150], [0, -172], [30, -150], [30, -100]]; mLine(c, look, mini, {w: 1.6, seed: 933});
  label(c, look, 'Docker', 0, -40, 26);
  c.restore();
}

// Winter: grain falls like snow while the strip runs mostly blank.
const winterK = x => sm(xOf(540), xOf(560), x, lin) * (1 - sm(xOf(606), xOf(628), x, lin));
function drawSnow(c, v, t, k) {
  if (k <= 0) return; resetT(c);
  for (let i = 0; i < 90; i++) { const sp = 40 + hash(i, 3) * 60, x = ((hash(i, 1) * W - v.x * .15 + Math.sin(t * .7 + i) * 20) % W + W) % W, y = ((hash(i, 2) * H + t * sp) % H);
    c.fillStyle = alpha('#ffffff', .85 * k); c.beginPath(); c.arc(x, y, 1.5 + hash(i, 4) * 2.5, 0, TAU); c.fill(); }
}

// The glass page: soft colour blobs behind frosted glass.
function glassBackdrop(c, v) {
  resetT(c); c.fillStyle = '#e9edf5'; c.fillRect(0, 0, W, H);
  const blobs = [['#f2b880', 0, 260, 520], ['#d97a8c', 900, 720, 560], ['#6f8fd8', 1700, 300, 600], ['#8fd0c0', 2500, 760, 520], ['#f6d46b', 3300, 360, 480]];
  for (const [col, bx, by, r] of blobs) { for (let rep = -1; rep <= 1; rep++) {
    const x = ((bx - v.x * .35) % 4000 + 4000) % 4000 - 600 + rep * 4000; if (x < -r || x > W + r) continue;
    const g = c.createRadialGradient(x, by, 0, x, by, r); g.addColorStop(0, alpha(col, .55)); g.addColorStop(1, alpha(col, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H); } }
  c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(0, 0, W, H);
}
function colourBackdrop(c, v, t) {
  resetT(c); c.fillStyle = LK.color.paper; c.fillRect(0, 0, W, H);
  const k = sm(107.8, 109.4, t), g = c.createRadialGradient(W * .55, H * .55, 0, W * .55, H * .55, W * .9);
  g.addColorStop(0, alpha('#ffe7b0', .7 * k)); g.addColorStop(.5, alpha('#ffc9d4', .35 * k)); g.addColorStop(1, alpha('#b9d3ff', .3 * k)); c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// The cardboard phone costume: the first iPhone app, before it was rebuilt natively.
function drawCostume(c, G, place, tear) {
  const T = q => afWorld(q, place), lc = T(G.lc), r = G.lens * place.scale * 1.08, top = T([0, -30 - 118 - 6])[1], bot = T([0, -24])[1], cx = T([6, 0])[0];
  const P = [[cx - 100, bot], [cx - 96, top], [cx + 98, top - 3], [cx + 102, bot]];
  if (tear <= 0) {
    c.save(); const outer = polyPath(P), hole = new Path2D(); hole.arc(lc[0], lc[1], r, 0, TAU);
    const L2 = layer(260, 220), g = L2.getContext('2d'); g.setTransform(S, 0, 0, S, 0, 0); g.translate(-(cx - 130), -(top - 30));
    g.fillStyle = '#c9a36a'; g.fill(outer); formHatch(g, outer, [cx - 110, top - 10, 220, bot - top + 20], {color: '#8a6a3a', spacing: 6, length: 14, width: .7, opacity: .35, tone: () => .5, direction: () => 1.4, seed: 941});
    g.globalCompositeOperation = 'destination-out'; g.fill(hole);
    c.drawImage(L2, cx - 130, top - 30, 260, 220); c.restore();
    iLine(c, [...P, P[0]], {w: 2.2, col: '#6a4f2a', seed: 942});
    iLine(c, ellPts(lc[0], lc[1], r, r, 0, 30), {w: 1.8, col: '#6a4f2a', close: true, seed: 943});
    c.fillStyle = '#e8d8b8'; c.fillRect(cx - 88, top + 6, 36, 22); writeOn(c, 'RN', cx - 70, top + 23, {size: 16, col: '#6a4f2a', align: 'center', rot: 0, weight: 700});
    c.fillStyle = 'rgba(230,220,200,.8)'; c.fillRect(cx + 52, top - 7, 40, 14); c.fillRect(cx - 96, bot - 40, 14, 34);
    return;
  }
  const mid = (P[1][0] + P[2][0]) / 2, halves = [[P[0], P[1], [mid, top - 2], [mid, bot]], [[mid, bot], [mid, top - 2], P[2], P[3]]];
  halves.forEach((h, i) => { const dir = i ? 1 : -1, u = tear;
    const hc = [(h[0][0] + h[2][0]) / 2, (h[1][1] + h[0][1]) / 2];
    c.save(); c.translate(hc[0] + dir * 420 * u, hc[1] - 260 * u + 900 * u * u); c.rotate(dir * u * 2.4); c.translate(-hc[0], -hc[1]); c.globalAlpha *= 1 - sm(.7, 1, u, lin);
    c.fillStyle = '#c9a36a'; c.fill(polyPath(h)); iLine(c, [...h, h[0]], {w: 2, col: '#6a4f2a', seed: 944 + i}); c.restore(); });
  for (let i = 0; i < 12; i++) { const a = hash(i, 51) * TAU, d = tear * (80 + hash(i, 52) * 220); c.fillStyle = alpha('#c9a36a', 1 - tear); c.fillRect(cx + Math.cos(a) * d, lc[1] + Math.sin(a) * d + 300 * tear * tear, 8, 5); }
}

// iOS features beside the strip: an upload pill, a photo-of-the-day widget, a notification.
function drawPhoneBits(c, look, t) {
  if (t < 101 || t > 112) return;
  const glassCard = (x, y, w, h, r = 18) => { c.save(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(roundRectPath(x, y, w, h, r)); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 2; c.stroke(roundRectPath(x, y, w, h, r)); c.restore(); };
  const pop = t0 => easeOutBack(clamp((t - t0) / .5, 0, 1));
  let x = xOf(790) + 250, k = pop(102);
  if (k > 0) { c.save(); c.translate(x, 560); c.scale(k, k); glassCard(-140, -26, 280, 52, 26); c.fillStyle = AFC.blue; c.fill(roundRectPath(-120, 6, 240 * clamp((t - 102.3) / 1.6, 0, 1), 6, 3));
    writeOn(c, LANG === 'zh' ? '上传中 · 12 张' : 'Uploading · 12 photos', -120, -2, {size: 20, col: '#26303f', rot: 0, weight: 700}); c.restore(); }
  x = xOf(822) + 60; k = pop(104.2);
  if (k > 0) { c.save(); c.translate(x, 580); c.scale(k, k); glassCard(-90, -90, 180, 180, 32); c.save(); c.beginPath(); c.roundRect(-78, -78, 156, 128, 22); c.clip(); framePicture(c, 'color', -78, -78, 156, 128, 77, 1); c.restore();
    writeOn(c, LANG === 'zh' ? '今日一张' : 'Photo of the day', 0, 76, {size: 17, col: '#26303f', rot: 0, align: 'center', weight: 700}); c.restore(); }
  x = xOf(827) + 320; k = pop(105.6);
  if (k > 0) { c.save(); c.translate(x, 560); c.scale(k, k); glassCard(-170, -36, 340, 72, 22); c.fillStyle = AFC.blue; c.fill(roundRectPath(-156, -22, 44, 44, 10));
    writeOn(c, LANG === 'zh' ? 'lea 评论了你的照片' : 'lea commented on your photo', -100, -2, {size: 19, col: '#26303f', rot: 0, weight: 700}); writeOn(c, '"that light!"', -100, 22, {size: 17, col: '#56607a', rot: 0, weight: 400}); c.restore(); }
}
