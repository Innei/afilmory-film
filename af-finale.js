'use strict';
// The ending. The camera pulls back until the whole roll is one line, then the roll is cut into
// month strips and laid out as a contact sheet: one cell per commit, real monthly counts. AF walks on,
// the canister it has carried since 0:08 pops open, AF signs the sheet, and the closing card holds.

const FIN = {pull: JOURNEY_END, fold: 115.8, folded: 117.4, afIn: 118.0, pop: 119.2, sign: 120.0, card: 122.8, end: 128};
const MONTH_KEYS = [...new Set(DAY_LIST.map(d => d.slice(0, 7)))];
const SHEET = {left: 330, top: 262, cell: 6.6, h: 24, row: 38};
const CELL = FRAMES.map(f => { const r = MONTH_KEYS.indexOf(f.day.slice(0, 7)); return {r, col: 0}; });
{ const seen = {}; CELL.forEach(c => { c.col = seen[c.r] = (seen[c.r] ?? -1) + 1; }); }
const MONTH_COUNT = MONTH_KEYS.map((_, r) => CELL.filter(c => c.r === r).length);
const ERA_COL = {pencil: '#b9ad98', ink: '#3a383c', chalk: '#3a5cb0', glass: '#8fbfe8'};
const eraColour = f => { const l = lookOfX(f.x); return l === 'color' ? PIC_TONES[Math.floor(hash(f.seed, 3) * 6)][0] : ERA_COL[l]; };
const monthLabel = k => { const [y, m] = k.split('-').map(Number); return LANG === 'zh' ? `${y}年${m}月` : `${MONTHS[m - 1]} ${y}`; };
const Z_MIN = (W - 160) / (ROLL_END + 300);

function pullView(t) {
  const u = easeInOutSine(clamp((t - FIN.pull) / (FIN.fold - FIN.pull), 0, 1)), v0 = viewAt(FIN.pull);
  const z = 1.35 * Math.pow(Z_MIN / 1.35, u), cx = lerp(v0.x, (ROLL_END - 300) / 2, u), cy = lerp(v0.y, STRIP.top + STRIP.h / 2, u);
  return {x: cx, y: cy, z};
}
function sheetCell(i) { const c = CELL[i]; return [SHEET.left + c.col * SHEET.cell, SHEET.top + c.r * SHEET.row]; }

function drawSheet(c, t, al = 1) {
  resetT(c); c.save(); c.globalAlpha *= al;
  const v = pullView(t), fold = t >= FIN.fold;
  const lbl = sm(FIN.folded - .4, FIN.folded + .4, t, lin);
  if (lbl > 0) MONTH_KEYS.forEach((k, r) => {
    const y = SHEET.top + r * SHEET.row + SHEET.h - 7;
    writeOn(c, monthLabel(k), SHEET.left - 24, y, {size: 22, col: LK.color.lead, align: 'right', rot: 0, weight: 400, al: lbl});
    writeOn(c, String(MONTH_COUNT[r]), SHEET.left + MONTH_COUNT[r] * SHEET.cell + 14, y, {size: 22, col: LK.color.line, rot: 0, weight: 700, al: lbl});
  });
  const band = sm(FIN.folded - .5, FIN.folded + .2, t, lin);
  if (band > 0) MONTH_KEYS.forEach((k, r) => { const y = SHEET.top + r * SHEET.row, w = MONTH_COUNT[r] * SHEET.cell + 16; c.save(); c.globalAlpha *= band; c.fillStyle = '#17161a'; c.fillRect(SHEET.left - 8, y - 7, w, SHEET.h + 14); c.fillStyle = LK.color.paper; for (let x = SHEET.left - 4; x < SHEET.left + w - 14; x += 9) { c.fillRect(x, y - 5, 4.5, 3); c.fillRect(x, y + SHEET.h + 2, 4.5, 3); } c.restore(); });
  FRAMES.forEach((f, i) => {
    const sx = (f.x + f.w * .1 - v.x) * v.z + W / 2, sy = (STRIP.top + (STRIP.h - STRIP.fh) / 2 - v.y) * v.z + H / 2, sw = Math.max(1.2, f.w * .8 * v.z), sh = Math.max(3, STRIP.fh * v.z);
    let x = sx, y = sy, w = sw, h = sh;
    if (fold) {
      const r = CELL[i].r, u = easeInOutSine(clamp((t - FIN.fold - r * .07) / 1.0, 0, 1)), [tx, ty] = sheetCell(i);
      x = lerp(sx, tx, u); y = lerp(sy, ty, u) - Math.sin(u * Math.PI) * 60; w = lerp(sw, SHEET.cell - 1.2, u); h = lerp(sh, SHEET.h, u);
    }
    c.fillStyle = eraColour(f); c.fillRect(x, y, w, h);
  });
  const hl = sm(FIN.folded + .2, FIN.folded + .8, t, lin);
  if (hl > 0) [[0, 'v0.1.0', 0], [5, 'afilmory.art', 1], [14, LANG === 'zh' ? 'iOS 应用' : 'iOS app', 2]].forEach(([r, text, i]) => {
    const y = SHEET.top + r * SHEET.row, w = MONTH_COUNT[r] * SHEET.cell;
    iLine(c, rectPts(SHEET.left - 12, y - 11, w + 24, SHEET.h + 22), {w: 2.4, col: AFC.gold, close: true, seed: 960 + i, al: hl});
    writeOn(c, text, SHEET.left + w + 64, y + SHEET.h - 4, {size: 24, col: AFC.gold, rot: 0, weight: 700, al: hl});
  });
  c.restore();
}

// AF walks onto the sheet's margin and the canister pops: the roll is developed.
function drawFinaleAF(c, t, al = 1) {
  if (t < FIN.afIn) return;
  resetT(c); c.save(); c.globalAlpha *= al;
  const walk = clamp((t - FIN.afIn) / 1.0, 0, 1), x = lerp(W + 160, W - 250, easeOut(walk)), y = H - 40, s = t - FIN.pop;
  let p = walk < 1 ? walkPose(P1({gx: -.4, smile: .8}), QT1(t) * 400) : P1({gx: -.6, gy: -.3, smile: .8});
  if (s > 0) p = s < .3 ? P1({mood: 'squeeze', squash: .9}) : s < 1.4 ? afPose({spark: 1, mouth: .8, eyeS: 1.1, gy: -.6, armL: 2.4, armR: 2.4}) : afPose({mood: 'happy', smile: 1, brow: .4});
  if (t >= FIN.sign) p = afPose({armR: 1.7, gx: -.8, gy: .4, smile: .8, lock: .6});
  const G = drawAF(c, p, {x, y, scale: .78, look: 'color'});
  if (s > 0) {
    const back = afWorld(G.anchors.back, {x, y, scale: .78}), u = clamp(s / .8, 0, 1);
    afCanister(c, back[0] - 20, back[1] - 30 + 10 * u, {look: 'color', scale: .8, rot: -.3});
    c.save(); c.translate(back[0] - 20 - 160 * u, back[1] - 90 - 200 * u + 260 * u * u); c.rotate(-u * 5); c.fillStyle = '#1b1a1d'; c.fillRect(-19, -5, 38, 10); c.restore();
    if (s < 1.2) { glow(c, back[0] - 20, back[1] - 60, 160, '#ffe7a0', 1 - s / 1.2); for (let i = 0; i < 8; i++) star(c, back[0] - 20 + Math.cos(i) * 90 * u, back[1] - 60 + Math.sin(i * 1.7) * 70 * u, 9 * (1 - u), AFC.gold); }
    const curl = []; for (let k = 0; k <= 20; k++) { const a = k / 20; curl.push([back[0] - 30 - a * 150 * u, back[1] - 40 - Math.sin(a * Math.PI * 1.5) * 60 * u]); }
    if (u > .2) { c.strokeStyle = '#1b1a1d'; c.lineWidth = 18 * .78; c.lineCap = 'butt'; c.beginPath(); curl.forEach((q, k) => k ? c.lineTo(...q) : c.moveTo(...q)); c.stroke();
      curl.forEach((q, k) => { if (k % 3 === 1) { c.fillStyle = PIC_TONES[k % 6][0]; c.fillRect(q[0] - 4, q[1] - 4, 8, 8); } }); }
  }
  c.restore();
}

function drawSignature(c, t, al = 1) {
  const p = sm(FIN.sign + .3, FIN.sign + 2.2, t, lin); if (p <= 0) return;
  resetT(c); c.save(); c.globalAlpha *= al;
  const text = LANG === 'zh' ? '由 AF 拍摄，为你的照片。' : 'Shot by AF, for your photos.';
  writeOn(c, text, W / 2 - 60, 960, {size: 56, col: LK.color.line, p, align: 'center', rot: -.02});
  c.restore();
}

function closingCard(c, t) {
  const k = sm(FIN.card, FIN.card + .7, t, lin); if (k <= 0) return;
  resetT(c); c.save(); c.globalAlpha = k; c.fillStyle = LK.color.paper; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, W * .7); g.addColorStop(0, 'rgba(255,231,176,.55)'); g.addColorStop(.6, 'rgba(255,201,212,.18)'); g.addColorStop(1, 'rgba(185,211,255,.25)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const s = t - FIN.card, blink = s > 3.0 && s < 3.18, peek = easeOut(clamp((s - .5) / .7, 0, 1));
  c.save(); c.beginPath(); c.rect(0, 0, W, 468); c.clip();
  drawAF(c, afPose({mood: blink ? 'blink' : 'open', gx: -.3, gy: .5, smile: .8, brow: .3, turn: .2}), {x: W / 2 + 170, y: 560 + 220 * (1 - peek), scale: 1.25, look: 'color'});
  c.restore();
  c.font = `700 150px ${AF_FONT}`; c.textAlign = 'center'; c.fillStyle = LK.color.line; c.fillText('Afilmory', W / 2, 560);
  writeOn(c, LANG === 'zh' ? '你的照片，冲洗好了。' : 'your photos, developed.', W / 2, 640, {size: 44, col: LK.color.lead, align: 'center', p: sm(.6, 1.6, s, lin), rot: 0});
  const bx = W / 2, by = 770, q = 'afilmory.art', n = Math.floor(clamp((s - 1.4) / 1.0, 0, 1) * q.length);
  iLine(c, rectPts(bx - 280, by - 38, 560, 76), {w: 2.2, col: LK.color.line, close: true, seed: 980, rough: .8});
  c.strokeStyle = LK.color.line; c.lineWidth = 2.6; c.beginPath(); c.arc(bx - 240, by - 3, 13, 0, TAU); c.moveTo(bx - 231, by + 7); c.lineTo(bx - 219, by + 19); c.stroke();
  writeOn(c, q.slice(0, n) + (n < q.length && Math.floor(t * 3) % 2 ? '|' : ''), bx - 200, by + 13, {size: 38, col: LK.color.line, rot: 0, weight: 700});
  writeOn(c, 'github.com/Afilmory/afilmory', W / 2, 868, {size: 30, col: LK.color.lead, align: 'center', p: sm(2.6, 3.4, s, lin), rot: 0, weight: 400});
  c.restore();
}

function finale(c, t) {
  const v = pullView(t);
  if (v.z > .45) { journeyView(c, Math.min(t, FIN.pull), v, t); }
  else { resetT(c); c.fillStyle = LK.color.paper; c.fillRect(0, 0, W, H); colourBackdrop(c, v, t); }
  const sheetAl = sm(.6, .45, v.z, lin) * (1 - sm(FIN.card, FIN.card + .7, t, lin));
  if (sheetAl > 0) drawSheet(c, t, sheetAl);
  const fade = 1 - sm(FIN.card, FIN.card + .7, t, lin);
  drawFinaleAF(c, t, fade); drawSignature(c, t, fade);
  resetT(c);
  if (t < FIN.card) {
    caption(c, 'color', [[L10N({en: 'Eight hundred thirty-seven frames.', zh: '八百三十七格，'}), 115.9, 117.0, 52], [L10N({en: 'One roll. Developed.', zh: '一卷，冲洗好了。'}), 118.9, 119.9, 48]], t, [FIN.card - .6, FIN.card]);
    featureCard(c, 'color', {title: {en: '837 commits', zh: '837 次提交'}, sub: {en: 'Jun 5, 2025 → Sep 26, 2026', zh: '2025年6月5日 → 2026年9月26日'}}, t, 115.4, FIN.card - .6);
  }
  closingCard(c, t);
}
