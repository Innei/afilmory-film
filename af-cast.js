'use strict';
// AF, the narrator: a small camera drawn after the Afilmory logo (prism hump, aperture lens, sparkle).
// Local space: origin on the ground between the feet, +x toward where AF walks, y down.
// The face lives inside the lens glass; the aperture blades are the eyelids, and the AF focus
// brackets around the lens are the eyebrows. A blink is the aperture closing.

const AFC = {
  paper: '#f3ede1', pencil: '#3b342d', lead: '#7a7066', gold: '#c9962f', red: '#c4473a', green: '#3f9d6b',
  ink: '#1d1b22', inkLine: '#121015', white: '#fcfaf3', grey: '#d8d4cb', sheen: '#9aa2d6',
  navy: '#1c2f5e', navy2: '#23396c', chalk: '#e8efff', blue: '#007bff', silver: '#d3d6d8',
};
const AF_FONT = '"Comic Neue","LXGW WenKai",cursive';
for (const [family, file, desc] of [['Comic Neue', 'ComicNeue-Regular.ttf', {weight: '400'}], ['Comic Neue', 'ComicNeue-Bold.ttf', {weight: '700'}], ['LXGW WenKai', 'LXGWWenKai-Medium.ttf', {weight: '100 900'}]]) {
  const face = new FontFace(family, `url('fonts/${file}')`, desc);
  _photoLoads.push(face.load().then(f => document.fonts.add(f)).catch(e => { window.__error = 'font failed to load: ' + file; throw e; }));
}

const AF_BASE = {
  lean: 0, squash: 1, turn: .4, gx: 0, gy: 0, lid: 0, lidTilt: 0, eyeS: 1, pupil: 1, mood: 'open', spark: 0,
  mouth: 0, smile: .5, brow: 0, browTilt: 0, lock: 0, button: 0, flash: 0, armL: 0, armR: 0, fa: -30, fb: 30,
  lift: 0, tuck: 0, canister: 0, iris: 0,
};
const AF_DISCRETE = new Set(['mood']);
const afPose = (o = {}) => ({...AF_BASE, ...o});
function afBlend(a, b, u) { const o = {}; for (const k in a) o[k] = AF_DISCRETE.has(k) ? (u < 1 ? a[k] : b[k]) : lerp(a[k], b[k] ?? a[k], u); return o; }
function afTrack(keys) {
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
      const [t0, a] = keys[i - 1], [t1, b, e = easeIO] = keys[i];
      return afBlend(a, b, e(clamp((t - t0) / (t1 - t0), 0, 1)));
    }
    return keys[keys.length - 1][1];
  };
}

const af2 = {
  rot: (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)],
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  mul: (a, k) => [a[0] * k, a[1] * k],
};
const AF_DIM = {bw: 176, bh: 118, leg: 30, lens: 50, glass: 39};

function afRoundRect(x, y, w, h, r, n = 5) {
  const pts = [], corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return pts;
}

function afGeom(p) {
  const {bw, bh, leg} = AF_DIM, sq = p.squash, rot = p.lean, turn = p.turn;
  const hipY = -leg * (1 - p.tuck * .6) - p.lift;
  const T = q => af2.add([0, hipY], af2.rot([q[0] / Math.sqrt(sq), q[1] * sq], rot));
  const top = -bh, half = bw / 2;
  const shell = afRoundRect(-half, top, bw, bh, 22).map(T);
  const hx0 = -34 + turn * 10, hx1 = 40 + turn * 10, hy = top - 26;
  const hump = [[hx0 - 6, top + 1], [hx0 + 8, hy + 4], [hx0 + 14, hy], [hx1 - 14, hy], [hx1 - 8, hy + 4], [hx1 + 6, top + 1]].map(T);
  const depth = turn > .04 ? afRoundRect(-half - turn * 20, top - turn * 7, bw, bh, 22).map(T) : null;
  const plateY = top + bh * .27;
  const plate = [[-half + 3, plateY], [half - 3, plateY]].map(T);
  const button = [[half - 52, top], [half - 52, top - 9 - p.button * 7], [half - 30, top - 9 - p.button * 7], [half - 30, top]].map(T);
  const knob = [[-half + 18, top], [-half + 18, top - 7], [-half + 48, top - 7], [-half + 48, top]].map(T);
  const flashWin = [[hx0 + 16, hy + 8], [hx1 - 16, hy + 8], [hx1 - 16, hy + 19], [hx0 + 16, hy + 19]].map(T);
  const finder = [[-half + 14, top + 8], [-half + 42, top + 8], [-half + 42, top + 24], [-half + 14, top + 24]].map(T);
  const lc = T([turn * 16, top + bh * .6]), sc = Math.sqrt(sq);
  const lens = AF_DIM.lens / sc, glass = AF_DIM.glass / sc;
  const ring = r => ellPts(lc[0], lc[1], r, r * (1 - turn * .08), 0, 40);
  const ap = p.mood === 'blink' ? 0 : 1 - clamp(p.iris ?? 0, 0, 1);
  const blades = Array.from({length: 6}, (_, i) => {
    const a = i / 6 * TAU - Math.PI / 2 + .35 + (1 - ap) * .5, r0 = glass * .98, r1 = glass * lerp(.02, .86, ap);
    return [[lc[0] + Math.cos(a) * r0, lc[1] + Math.sin(a) * r0], [lc[0] + Math.cos(a + .9) * (r0 + r1) / 2, lc[1] + Math.sin(a + .9) * (r0 + r1) / 2], [lc[0] + Math.cos(a + 1.35) * r1, lc[1] + Math.sin(a + 1.35) * r1]];
  });
  const E = q => af2.add(lc, af2.rot([q[0] + turn * 6, q[1]], rot * .3));
  const eye = x => ({c: E([x, -4]), rx: 10.5 * p.eyeS, ry: 13.5 * p.eyeS});
  const eyes = {near: eye(14), far: eye(-13)};
  const mouth = E([0, 17]);
  const sparkle = E([glass * .52, -glass * .5]);
  const bro = lens + 10 - p.lock * 6, bl = 14 + p.lock * 4, lift = -p.brow * 9;
  const bracket = (sx, sy, tilt) => {
    const cx = lc[0] + sx * bro * .78, cy = lc[1] + sy * bro * .78 + (sy < 0 ? lift : 0);
    const a = af2.rot([0, -sy * bl], tilt), b = af2.rot([-sx * bl, 0], tilt);
    return [[cx + a[0], cy + a[1]], [cx, cy], [cx + b[0], cy + b[1]]];
  };
  const brows = [bracket(-1, -1, p.browTilt * .5), bracket(1, -1, -p.browTilt * .5)];
  const lockBr = p.lock > .02 ? [bracket(-1, 1, 0), bracket(1, 1, 0)] : [];
  const arm = (side, ang) => {
    const sh = T([side * (half - 14), top + bh * .52]), a = Math.PI / 2 - side * (.55 + ang);
    const hand = af2.add(sh, [Math.cos(a) * 48 * side, Math.sin(a) * 48]);
    return {line: [sh, af2.add(af2.mul(af2.add(sh, hand), .5), [side * 5, -3]), hand], hand};
  };
  const arms = {back: arm(-1, p.armL), front: arm(1, p.armR)};
  const legs = [[-24, p.fa], [24, p.fb]].map(([hx, fx], i) => {
    const hip = T([hx, 0]), ground = [fx, -p.lift * .0], tucked = af2.add(hip, [-6, 12]);
    const F = [lerp(ground[0], tucked[0], p.tuck), lerp(ground[1], tucked[1], p.tuck)];
    return {line: [hip, af2.add(af2.mul(af2.add(hip, F), .5), [-4 * (1 - p.tuck), 0]), F], foot: F, i};
  });
  const canister = p.canister > .01 ? T([-half + 22, top - 4]) : null;
  return {p, T, shell, hump, depth, plate, button, knob, flashWin, finder, lc, lens, glass, ring, ap, blades, eyes, mouth, sparkle,
    brows, lockBr, arms, legs, canister, anchors: {top: T([turn * 10, top - 26]), back: T([-half, top + bh * .5]), hand: arms.front.hand, lens: lc}};
}

function afPal(look) {
  if (look === 'chalk') return {body: AFC.navy, plate: AFC.navy2, depth: '#15244a', barrel: '#16254c', glass: '#0d1735', line: AFC.chalk, mat: 'pencil', sclera: AFC.chalk, pupil: '#16254c', blade: '#2c4a8a', k: 2, brow: AFC.chalk, halo: AFC.navy};
  if (look === 'ink') return {body: AFC.ink, plate: AFC.grey, depth: '#0f0e12', barrel: '#141217', glass: '#08070a', line: AFC.inkLine, mat: 'ink', sclera: AFC.white, pupil: AFC.inkLine, blade: '#2d2b33', k: 1, brow: AFC.inkLine, sheen: AFC.sheen, halo: AFC.grey};
  if (look === 'glass') return {body: 'rgba(236,242,250,.55)', plate: 'rgba(255,255,255,.7)', depth: 'rgba(160,180,210,.35)', barrel: 'rgba(30,36,48,.85)', glass: '#0c1220', line: '#44506a', mat: 'ink', sclera: AFC.white, pupil: '#0c1220', blade: '#27324a', k: 1, brow: '#44506a', glassy: true, halo: 'rgba(255,255,255,.8)'};
  if (look === 'color') return {body: AFC.blue, plate: AFC.silver, depth: '#0a4fa6', barrel: '#1b1d22', glass: '#07090e', line: '#14161b', mat: 'ink', sclera: AFC.white, pupil: '#07090e', blade: '#2a2e38', k: 1, brow: '#14161b', sheen: '#7fb6ff', halo: AFC.silver};
  return {body: AFC.paper, plate: AFC.paper, depth: AFC.paper, barrel: AFC.paper, glass: '#5a524a', line: AFC.pencil, mat: 'pencil', sclera: AFC.paper, pupil: AFC.pencil, blade: '#7a7066', k: 1.6, brow: AFC.pencil, hatch: true, halo: AFC.paper};
}

function afStrokes(G, look, layer) {
  const P = afPal(look), k = P.k, s = [], add = (id, points, width, opacity = 1, extra = {}) => s.push({id, points, width, opacity, ...extra});
  const PR = [[0, .12], [.15, .9], [.5, 1], [.85, .75], [1, .08]], p = G.p;
  if (layer === 'back') {
    for (const L of G.legs) { add('leg/' + L.i, L.line, 2.4 * k, 1); add('shoe/' + L.i, [af2.add(L.foot, [-7, 0]), af2.add(L.foot, [2, -5]), af2.add(L.foot, [13, -2]), af2.add(L.foot, [12, 1])], 2.2 * k, 1, {corner: 1}); }
    add('arm/back', G.arms.back.line, 2.6 * k, .9); add('hand/back', ellPts(G.arms.back.hand[0], G.arms.back.hand[1], 8, 7, 0, 12), 2 * k, .9, {close: true});
    if (G.depth) add('depth', G.depth, 1.8 * k, .8, {close: true});
  } else if (layer === 'body') {
    add('shell', G.shell, 2.3 * k, 1, {close: true, pressure: [[0, .8], [.5, 1], [1, .8]]});
    add('hump', G.hump, 2.1 * k, 1, {corner: 1.2, pressure: PR});
    add('plate', G.plate, 1.2 * k, .7);
    add('button', G.button, 1.8 * k, 1, {corner: 1});
    add('knob', G.knob, 1.6 * k, 1, {corner: 1});
    add('flash', [...G.flashWin, G.flashWin[0]], 1.1 * k, .8, {corner: 1});
    add('finder', [...G.finder, G.finder[0]], 1.2 * k, .85, {corner: 1});
    add('lens/barrel', G.ring(G.lens), 2.2 * k, 1, {close: true, pressure: [[0, .8], [.5, 1], [1, .8]]});
    add('lens/ring', G.ring(G.lens * .88), 1.1 * k, .7, {close: true});
    add('arm/front/halo', G.arms.front.line, 6 * k, 1, {color: P.halo}); add('arm/front', G.arms.front.line, 2.6 * k, 1);
    add('hand/halo', ellPts(G.arms.front.hand[0], G.arms.front.hand[1], 8, 7, 0, 12), 5 * k, 1, {close: true, color: P.halo}); add('hand', ellPts(G.arms.front.hand[0], G.arms.front.hand[1], 8, 7, 0, 12), 2 * k, 1, {close: true});
  } else {
    const light = P.sclera;
    for (const side of ['near', 'far']) {
      const e = G.eyes[side], mood = p.mood, L = (x, y) => [e.c[0] + x * e.rx, e.c[1] + y * e.ry];
      if (mood === 'happy') add('eye/' + side, [L(-1, .35), L(-.5, -.15), L(0, -.3), L(.5, -.15), L(1, .35)], 2.4, 1, {color: light});
      else if (mood === 'squeeze') add('eye/' + side, side === 'near' ? [L(.8, -.55), L(-.5, 0), L(.8, .55)] : [L(-.8, -.55), L(.5, 0), L(-.8, .55)], 2.4, 1, {color: light, corner: .5});
      else if (mood === 'dizzy') { const pts = []; for (let i = 0; i <= 26; i++) { const a = i / 26 * TAU * 2.2, r = .12 + i / 26 * .75; pts.push(L(Math.cos(a) * r, Math.sin(a) * r)); } add('spiral/' + side, pts, 1.6, 1, {color: light}); }
    }
    if (p.mood !== 'blink') {
      const m = G.mouth, o = p.mouth, sm = p.smile;
      if (o > .05) add('mouth', ellPts(m[0], m[1] + 2, 5 + o * 2, 2 + o * 5, 0, 14), 1.6, 1, {close: true, color: light});
      else add('mouth', [[m[0] - 7, m[1] - sm * 2], [m[0], m[1] + sm * 4], [m[0] + 7, m[1] - sm * 2]], 1.7, 1, {color: light});
    }
    G.blades.forEach((b, i) => add('blade/' + i, b, 1.1 * k, G.ap < .98 ? .95 : .55, {color: look === 'pencil' ? undefined : P.blade}));
    G.brows.forEach((b, i) => add('brow/' + i, b, 2.6 * k, 1, {corner: 1, color: p.lock > .5 ? AFC.green : P.brow}));
    G.lockBr.forEach((b, i) => add('lock/' + i, b, 2.6 * k, clamp(p.lock * 1.5, 0, 1), {corner: 1, color: p.lock > .5 ? AFC.green : P.brow}));
  }
  return {strokes: s};
}

const AF_CELS = new Map();
function afCel(G, look, layer, key) {
  const id = look + '|' + key + '|' + layer;
  if (AF_CELS.has(id)) return AF_CELS.get(id);
  const cel = compileCel(afStrokes(G, look, layer), {id: 'af/' + look + '/' + layer});
  AF_CELS.set(id, cel); if (AF_CELS.size > 400) AF_CELS.delete(AF_CELS.keys().next().value);
  return cel;
}

function afEyes(g, G, P) {
  const p = G.p, gl = circPath(G.lc[0], G.lc[1], G.glass);
  g.save(); g.clip(gl);
  if (!['blink', 'happy', 'squeeze', 'dizzy'].includes(p.mood)) for (const side of ['near', 'far']) {
    const e = G.eyes[side];
    g.save(); g.translate(e.c[0], e.c[1]);
    const sc = new Path2D(); sc.ellipse(0, 0, e.rx, e.ry, 0, 0, TAU);
    g.fillStyle = P.sclera; g.fill(sc); g.clip(sc);
    const rp = Math.min(e.rx, e.ry) * .66 * p.pupil, px = p.gx * e.rx * .42, py = p.gy * e.ry * .32;
    g.fillStyle = P.pupil; g.beginPath(); g.arc(px, py, rp, 0, TAU); g.fill();
    g.fillStyle = P.sclera;
    if (p.spark > .05) {
      const s = rp * (.55 + .35 * p.spark), cx = px - rp * .25, cy = py - rp * .3;
      g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, r = i % 2 ? s * .3 : s; i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill();
    } else { g.beginPath(); g.arc(px - rp * .34, py - rp * .4, rp * .36, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(px + rp * .34, py + rp * .34, rp * .15, 0, TAU); g.fill();
    g.restore();
  }
  const ap = G.ap;
  if (ap < .98) {
    const r = G.glass * lerp(.02, .9, ap), hole = new Path2D();
    hole.rect(G.lc[0] - G.glass - 2, G.lc[1] - G.glass - 2, G.glass * 2 + 4, G.glass * 2 + 4);
    const tilt = 0;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU - Math.PI / 2 + .35 + (1 - ap) * .5 + tilt, x = G.lc[0] + Math.cos(a) * r, y = G.lc[1] + Math.sin(a) * r; i ? hole.lineTo(x, y) : hole.moveTo(x, y); }
    hole.closePath();
    g.fillStyle = P.blade; g.fill(hole, 'evenodd');
  }
  if (p.lid > .02 && ap > .5) for (const side of ['near', 'far']) {
    const e = G.eyes[side], y = e.c[1] + (-1 + p.lid * 2) * e.ry, t = p.lidTilt * (side === 'near' ? 1 : -1) * e.ry * .45;
    g.fillStyle = P.blade; g.beginPath(); g.moveTo(e.c[0] - e.rx * 1.3, y - t); g.lineTo(e.c[0] + e.rx * 1.3, y + t); g.lineTo(e.c[0] + e.rx * 1.3, e.c[1] - e.ry * 1.4); g.lineTo(e.c[0] - e.rx * 1.3, e.c[1] - e.ry * 1.4); g.closePath(); g.fill();
    g.strokeStyle = P.sclera; g.lineWidth = 1.6; g.beginPath(); g.moveTo(e.c[0] - e.rx * 1.05, y - t); g.lineTo(e.c[0] + e.rx * 1.05, y + t); g.stroke();
  }
  const s = G.sparkle, sr = 7;
  g.fillStyle = P.glassy || P.hatch ? '#ffffff' : alpha('#ffffff', .92);
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, r = i % 2 ? sr * .22 : sr; i ? g.lineTo(s[0] + Math.cos(a) * r, s[1] + Math.sin(a) * r) : g.moveTo(s[0] + Math.cos(a) * r, s[1] + Math.sin(a) * r); } g.closePath(); g.fill();
  g.restore();
}

function afRender(g, p, look, key) {
  const G = afGeom(p), P = afPal(look);
  const box = [-160, -220, 320, 240];
  if (G.canister) afCanister(g, G.canister[0], G.canister[1], {look, scale: .9, rot: -.45 + p.lean});
  drawCel(g, afCel(G, look, 'back', key), {material: P.mat, color: P.line});
  if (G.depth) { const d = curvePath(G.depth, true, 1.2); g.fillStyle = P.depth; g.fill(d); if (P.hatch) formHatch(g, d, box, {color: AFC.lead, spacing: 4.5, length: 11, width: .7, opacity: .4, tone: () => .6, direction: () => 1.1, seed: 3}); }
  const shell = curvePath(G.shell, true, 1.2), hump = curvePath(G.hump, false, 1.2);
  g.fillStyle = P.body; g.fill(hump); g.fill(shell);
  g.save(); g.clip(shell); const pl = G.plate; g.fillStyle = P.plate; g.beginPath(); g.moveTo(pl[0][0] - 20, pl[0][1]); g.lineTo(pl[1][0] + 20, pl[1][1]); g.lineTo(pl[1][0] + 20, pl[1][1] - 80); g.lineTo(pl[0][0] - 20, pl[0][1] - 80); g.fill(); g.restore();
  g.fillStyle = P.plate; g.fill(hump);
  if (P.hatch) {
    formHatch(g, shell, box, {color: AFC.lead, spacing: 5.5, length: 13, width: .75, opacity: .32, seed: 31, tone: (x, y) => clamp((y - G.plate[0][1]) / 90 * .5, 0, .5), direction: () => 1.05});
  } else if (P.sheen) {
    g.save(); g.clip(shell); g.beginPath(); g.rect(-200, G.plate[0][1], 400, 200); g.clip();
    formHatch(g, shell, box, {color: P.sheen, spacing: 6, length: 10, width: .8, opacity: .35, seed: 23, tone: (x, y) => clamp(.5 - (y - G.plate[0][1]) / 120 - x / 400, 0, .5), direction: () => -.5});
    g.restore();
  } else if (P.glassy) {
    g.save(); g.clip(shell); const gr = g.createLinearGradient(0, G.hump[2][1], 0, G.shell[10][1]); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(120,160,220,.25)');
    g.fillStyle = gr; g.fillRect(-200, -260, 400, 280); g.restore();
  }
  g.fillStyle = look === 'pencil' ? AFC.paper : '#e9eef3'; g.globalAlpha = look === 'pencil' ? 1 : .85; g.fill(polyPath(G.flashWin)); g.fill(polyPath(G.finder)); g.globalAlpha = 1;
  if (p.flash > .01) glowFlash(g, G, p.flash);
  const barrel = circPath(G.lc[0], G.lc[1], G.lens);
  g.fillStyle = P.barrel; g.fill(barrel);
  if (P.hatch) formHatch(g, barrel, [G.lc[0] - G.lens, G.lc[1] - G.lens, G.lens * 2, G.lens * 2], {color: AFC.lead, spacing: 4, length: 9, width: .7, opacity: .35, tone: () => .45, direction: () => .3, seed: 9});
  g.fillStyle = P.glass; g.fill(circPath(G.lc[0], G.lc[1], G.glass));
  afEyes(g, G, P);
  drawCel(g, afCel(G, look, 'body', key), {material: P.mat, color: P.line});
  drawCel(g, afCel(G, look, 'face', key), {material: 'ink', color: P.line});
  if (P.glassy) { g.save(); g.clip(curvePath(G.shell, true, 1.2)); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.arc(G.lc[0] - 20, G.lc[1] + 30, 118, Math.PI * 1.08, Math.PI * 1.32); g.stroke(); g.restore(); }
  return G;
}

function glowFlash(g, G, k) {
  const w = G.flashWin, cx = (w[0][0] + w[1][0]) / 2, cy = (w[0][1] + w[2][1]) / 2;
  g.save(); g.fillStyle = alpha('#fff6c8', k); g.fill(polyPath(w));
  g.strokeStyle = alpha(AFC.gold, k); g.lineWidth = 2.2; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32, r0 = 22, r1 = 22 + 26 * k; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke(); }
  g.restore();
}

// The keepsake: the film canister from the logo. Carried on AF's back until the roll is developed.
function afCanister(g, x, y, {look = 'pencil', scale = 1, rot = 0} = {}) {
  const P = afPal(look), seed = 71;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(scale, scale);
  const bodyP = roundRectPath(-20, -34, 40, 62, 5), cap = roundRectPath(-24, -42, 48, 10, 3), foot = roundRectPath(-24, 26, 48, 8, 3), spool = rectPath(-6, -50, 12, 9);
  g.fillStyle = look === 'color' ? '#f2c230' : P.plate; g.fill(bodyP);
  g.fillStyle = P.barrel; g.fill(cap); g.fill(foot); g.fill(spool);
  const tongue = new Path2D(); tongue.moveTo(20, -24); tongue.lineTo(40, -24); tongue.lineTo(46, -18); tongue.lineTo(46, 14); tongue.lineTo(20, 14); tongue.closePath();
  g.fillStyle = look === 'pencil' ? AFC.paper : '#3a3128'; g.fill(tongue);
  g.fillStyle = look === 'pencil' ? AFC.pencil : '#f3ede1'; for (let i = 0; i < 3; i++) { g.fillRect(24 + i * 7, -21, 3.5, 4); g.fillRect(24 + i * 7, 7, 3.5, 4); }
  g.strokeStyle = P.line; g.lineWidth = 2 * (look === 'pencil' ? 1.2 : 1); g.lineJoin = 'round';
  for (const [pts, cl] of [[rectPts(-20, -34, 40, 62), true], [rectPts(-24, -42, 48, 10), true], [rectPts(-24, 26, 48, 8), true], [[[20, -24], [40, -24], [46, -18], [46, 14], [20, 14]], false]]) wob(g, pts, .8, seed + pts.length, cl, {smooth: false});
  g.restore();
}

const AF_SPRITES = new Map(), AF_BOX = [-190, -260, 380, 290];
function afKey(p) { return Object.keys(p).sort().map(k => typeof p[k] === 'number' ? k + ':' + p[k].toFixed(3) : k + ':' + p[k]).join(','); }
function afSprite(p, look) {
  const key = afKey(p), id = look + '|' + S + '|' + key;
  if (AF_SPRITES.has(id)) { const v = AF_SPRITES.get(id); AF_SPRITES.delete(id); AF_SPRITES.set(id, v); return v; }
  const box = AF_BOX, dpi = 2 * S, cv = document.createElement('canvas');
  cv.width = Math.ceil(box[2] * dpi); cv.height = Math.ceil(box[3] * dpi);
  const g = cv.getContext('2d'); g.setTransform(dpi, 0, 0, dpi, -box[0] * dpi, -box[1] * dpi);
  const G = afRender(g, p, look, key), v = {cv, box, G};
  AF_SPRITES.set(id, v); if (AF_SPRITES.size > 36) AF_SPRITES.delete(AF_SPRITES.keys().next().value);
  return v;
}
function drawAF(c, p, {x = 0, y = 0, scale = 1, rot = 0, flip = 1, look = 'pencil', alpha: al = 1} = {}) {
  const s = afSprite(p, look);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(scale * flip, scale); c.globalAlpha *= al;
  c.drawImage(s.cv, s.box[0], s.box[1], s.box[2], s.box[3]); c.restore();
  return s.G;
}
function afWorld(q, {x = 0, y = 0, scale = 1, rot = 0, flip = 1} = {}) { return af2.add([x, y], af2.rot([q[0] * scale * flip, q[1] * scale], rot)); }
