'use strict';
// The whole journey as one continuous shot. AF only moves right along the strip; the camera follows a
// moving average of AF's x and never turns back. The page changes material at each seam, so walking
// forward is what changes the look: pencil, ink, blueprint chalk, glass, colour.

const T1 = {page: 0, appear: 3, canister: 6, shoot: 9, walk6: 12, print: 13.4, carry: 18, tray: 24.2, inked: 26.1, storage: 28};
const JOURNEY_END = 114;
const LIFT = FRAMES.find(f => f.day === '2025-06-06' && f.n - DAY_AT['2025-06-06'].first === 6);
const TRAY_X = SEAM, X_TRIP = xOf(221) - 30;

// ---------- where AF is ----------
const ROUTE = [
  [0, 180], [T1.shoot, 180], [T1.walk6, 1540, lin], [T1.print, 1900, easeOut], [T1.carry + .5, 1900],
  [T1.tray, TRAY_X - 170, lin], [T1.tray + .1, TRAY_X - 170], [T1.inked + .3, TRAY_X + 170], [T1.storage, TRAY_X + 170],
  [40.2, xOf(199) - 230], [43.4, xOf(199) - 230], [45.6, X_TRIP, lin], [46.3, X_TRIP + 130, easeOut], [48.2, X_TRIP + 130],
  [49.6, xOf(250)], [52.8, xOf(262), lin], [53.6, xOf(270) - 90, easeOut], [57.4, xOf(270) - 90],
  [60.8, xOf(292) - 60], [64.4, xOf(292) - 60], [66, xOf(316) - 40], [69.6, xOf(316) - 40], [71, xOf(340) - 150], [72.6, xOf(340) - 150],
  [75.4, xOf(430)], [79, xOf(546), lin], [83, xOf(600), lin], [85.4, xOf(625), lin], [87, xOf(640)],
  [90, xOf(671)], [93.5, xOf(705), lin], [96.5, xOf(761) + 30, easeOut], [101.5, xOf(761) + 30],
  [107.5, xOf(826)], [108.8, SEAMS[3] + 60, lin], [111.5, xOf(835), easeOut], [JOURNEY_END, xOf(835)],
];
function routeKey(t) {
  if (t <= ROUTE[0][0]) return ROUTE[0][1];
  for (let i = 1; i < ROUTE.length; i++) if (t < ROUTE[i][0]) { const [a, va] = ROUTE[i - 1], [b, vb, e = easeInOutSine] = ROUTE[i]; return lerp(va, vb, e(clamp((t - a) / (b - a), 0, 1))); }
  return ROUTE[ROUTE.length - 1][1];
}
const HOP_IN = [T1.tray + .1, T1.tray + .6], DUNK = [T1.tray + .6, T1.tray + 1.3], HOP_OUT = [T1.tray + 1.3, T1.inked + .3];
const TRIP = [45.6, 48.2];
function afRoot(t) {
  const ground = STRIP.top;
  if (t >= HOP_IN[0] && t < HOP_IN[1]) { const u = (t - HOP_IN[0]) / (HOP_IN[1] - HOP_IN[0]); return [lerp(TRAY_X - 170, TRAY_X, u), ground + 18 * u - 4 * 120 * u * (1 - u), 0]; }
  if (t >= DUNK[0] && t < DUNK[1]) return [TRAY_X, ground + 18, 0];
  if (t >= HOP_OUT[0] && t < HOP_OUT[1]) { const u = (t - HOP_OUT[0]) / (HOP_OUT[1] - HOP_OUT[0]); return [lerp(TRAY_X, TRAY_X + 170, u), ground + 18 * (1 - u) - 4 * 140 * u * (1 - u), 0]; }
  if (t >= TRIP[0] && t < TRIP[1]) {
    const s = t - TRIP[0], rot = s < .3 ? lerp(0, 1.2, easeIn(s / .3)) : s < .7 ? lerp(1.2, 1.45, (s - .3) / .4) : s < 1.0 ? lerp(1.45, .2, easeOut((s - .7) / .3)) : s < 2.0 ? -.06 : lerp(-.06, 0, (s - 2) / .6);
    const bounce = s > .7 && s < 1.0 ? -40 * Math.sin((s - .7) / .3 * Math.PI) : 0;
    return [routeKey(t), ground + bounce, rot];
  }
  return [routeKey(t), ground, 0];
}
// The x at which AF exposes each frame, found in one sweep of a finely sampled route.
const EXPOSED = (() => {
  const out = FRAMES.map(() => Infinity); let i = 0;
  for (let t = T1.shoot; t <= JOURNEY_END && i < FRAMES.length; t += 1 / 240) { const x = afRoot(t)[0]; while (i < FRAMES.length && x >= FRAMES[i].x + FRAMES[i].w * .4) out[i++] = t; }
  return out;
})();
const exposeK = (f, t) => Number.isFinite(EXPOSED[f.n]) ? sm(EXPOSED[f.n], EXPOSED[f.n] + .5, t, lin) : 0;
function lastExposed(t) { let lo = -1, hi = FRAMES.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (EXPOSED[m] <= t) lo = m; else hi = m - 1; } return lo; }
const moving = t => Math.abs(routeKey(t + .04) - routeKey(t - .04)) > .5;

// ---------- how AF looks ----------
const WALK = afPose({gx: .6, smile: .6, canister: 1});
const SLEEPY = afPose({canister: 1, lid: .5, gy: .4, gx: .4, smile: .1, brow: -.3});
const STEPS = [[-38, 34, 1, 0], [-22, 18, .95, 0], [-4, 4, 1.04, 6], [14, -16, .97, 2], [34, -38, 1, 0], [18, -22, .95, 0], [4, -4, 1.04, 6], [-16, 14, .97, 2]];
function walkPose(base, x) { const [fa, fb, squash, lift] = STEPS[((Math.floor(x / 17) % 8) + 8) % 8]; return {...base, fa, fb, squash, lift, lean: base.lean + .05}; }
const P1 = o => afPose({canister: 1, ...o});
const APPEAR = afTrack([
  [0, afPose({mood: 'blink'})], [.9, afPose({mood: 'blink'})], [1.0, afPose({eyeS: 1.12, pupil: .7, brow: .8, button: 1})],
  [1.4, afPose({gx: .2, gy: .1, smile: .8, brow: .3})], [2.9, afPose({gx: -.9, turn: .1, lean: -.05, brow: .5})],
]);
const LOAD = afTrack([
  [0, afPose({gx: -.9, turn: .1, lean: -.05, brow: .5})], [1.2, afPose({gx: -.9, turn: .1, lean: -.05, brow: .8, eyeS: 1.1})],
  [1.4, afPose({squash: .86, lean: .1, gx: -.5, gy: .5})], [1.6, afPose({squash: 1.08, gx: -.3, gy: -.6, armL: 1.4, armR: 1.4, mouth: .7})],
  [2.2, P1({squash: .9, mood: 'happy', smile: 1})], [2.8, P1({mood: 'happy', smile: 1, brow: .4})], [3.0, P1({gx: .7, smile: .6, lock: .6})],
]);
const LOOK = afTrack([
  [0, {...WALK}], [.3, P1({armR: 2.2, gx: .9, gy: -.3, mouth: .5})], [.9, P1({armR: 2.2, gx: .9, gy: -.7, lock: 1, smile: .7})],
  [1.6, P1({gx: .9, gy: -.8, lock: 1, smile: .7})], [2.0, P1({gx: .9, gy: -.8, lock: 1, spark: 1, pupil: 1.2, mouth: .6, brow: .8})],
  [3.6, P1({gx: .9, gy: -.8, lock: 1, spark: 1, pupil: 1.2, mouth: .9, brow: 1, button: .8})], [4.3, P1({mood: 'happy', smile: 1, gy: -.6})],
]);
const CARRY = P1({armL: 2.7, armR: 2.7, gx: .5, gy: -.7, smile: .7});
const STOPS = [
  [40.2, 43.4, afTrack([[0, P1({armR: 2.2, gx: .9, gy: -.3})], [.4, P1({eyeS: 1.15, pupil: .6, brow: 1, button: 1, gx: .9, gy: -.4})], [1.2, P1({spark: 1, pupil: 1.2, mouth: .6, gx: .9, gy: -.5})], [2.6, P1({mood: 'happy', smile: 1})]])],
  [45.6, 48.2, afTrack([[0, P1({mood: 'squeeze', armL: 1.7, armR: 1.4, button: 1})], [.7, P1({mood: 'squeeze', squash: .9})], [1.0, P1({mood: 'dizzy', smile: -.5})], [2.0, P1({mood: 'dizzy', smile: -.5})], [2.1, P1({brow: -.5, browTilt: .5, gx: .8, smile: .3})]])],
  [53.6, 57.4, afTrack([[0, P1({lock: 1, gx: .8})], [.1, P1({lock: 1, flash: 1, button: -1, mood: 'squeeze'})], [.35, P1({lock: .5, gx: .8})], [.6, P1({gx: -.9, turn: .1, lean: -.05})], [1.6, P1({gx: -.9, turn: .1, lid: .45, lidTilt: .6, browTilt: .6, smile: -.3})], [2.9, P1({mood: 'squeeze', squash: .9})], [3.2, P1({lid: .35, gx: .6, smile: -.3, brow: -.2})]])],
  [60.8, 64.4, afTrack([[0, P1({armR: 2.2, gx: .9, gy: -.5, mouth: .5})], [1.0, P1({mood: 'happy', smile: 1})], [2.0, P1({lock: 1, spark: .6, gx: .9, gy: -.3})], [2.9, P1({mood: 'happy', smile: 1, brow: .4})]])],
  [66, 69.6, afTrack([[0, P1({gy: -.8, gx: .7, spark: 1, mouth: .7})], [1.5, P1({armR: 2.6, mood: 'happy', smile: 1})], [2.9, P1({armR: 2.2, gx: .6, smile: .8})]])],
  [71, 72.6, afTrack([[0, P1({armR: 1.4, gx: .9, gy: .2, mood: 'happy', smile: 1})], [1.4, P1({gx: .6, smile: .8})]])],
  [96.5, 101.5, afTrack([[0, P1({gy: .8, gx: .2, lid: .3, browTilt: .4})], [.9, P1({gy: .6, lid: .35, browTilt: .6, smile: -.4})], [1.8, P1({armL: 2.0, armR: 2.0, brow: -.6, browTilt: .6, mouth: .6})], [2.4, P1({mood: 'squeeze', squash: 1.1, armL: 2.6, armR: 2.6})], [2.8, P1({spark: 1, pupil: 1.2, mouth: .8, brow: 1})], [3.6, P1({mood: 'happy', smile: 1, brow: .4, lean: -.04})]])],
  [108.8, JOURNEY_END, afTrack([[0, P1({eyeS: 1.15, pupil: .6, brow: 1, button: 1})], [.8, P1({spark: 1, mouth: .8, armL: 2.6, armR: 2.6, squash: 1.05})], [2.2, P1({mood: 'happy', smile: 1, brow: .4})], [4.2, P1({gx: 0, gy: .1, smile: 1, brow: .3})]])],
];
function poseAt(t) {
  if (t < T1.appear) return null;
  if (t < T1.canister) return APPEAR(t - T1.appear);
  if (t < T1.shoot) return LOAD(t - T1.canister);
  const x = afRoot(t)[0];
  const shooting = base => { const p = walkPose({...base, lock: .8, gx: .8}, x), n = lastExposed(t); if (n >= 0 && t - EXPOSED[n] < .12) { p.flash = 1; p.button = -1; } return p; };
  if (t < T1.walk6) return shooting(WALK);
  if (t < T1.print) return walkPose(WALK, x);
  if (t < T1.carry + .5) return LOOK(t - T1.print);
  if (t < T1.tray) return walkPose(CARRY, x);
  if (t < HOP_IN[0]) return P1({armR: 1.6, gx: .9, gy: .3, mouth: .5});
  if (t < HOP_IN[1]) return P1({squash: 1.1, tuck: .7, armL: 1.2, armR: 1.2, eyeS: 1.1, mouth: .8});
  if (t < DUNK[1]) { const u = (t - DUNK[0]) / (DUNK[1] - DUNK[0]); return P1({mood: u < .7 ? 'squeeze' : 'blink', squash: u < .5 ? .82 : .92, button: 1}); }
  if (t < HOP_OUT[1]) return P1({squash: 1.1, tuck: .6, armL: 1.6, armR: 1.6, spark: 1, mouth: .8});
  const s = t - HOP_OUT[1];
  if (s < .6) { const f = Math.floor(s * 24 / 2) % 2; return P1({mood: 'squeeze', gx: f ? .6 : -.6, lean: f ? .12 : -.12, squash: f ? 1.03 : .97}); }
  if (s < 1.9) return P1({mood: 'happy', smile: 1, brow: .5, lean: -.04});
  for (const [a, b, track] of STOPS) if (t >= a && t < b) {
    const p = {...track(t - a)};
    if (a === 66 && t - a > 1.5 && t - a < 2.9) p.armR = Math.floor((t - a) * 6) % 2 ? 2.2 : 2.9;
    if (a === 96.5 && t - a > .9 && t - a < 1.8) { const f = Math.floor((t - a) * 12) % 2; p.lean = f ? .1 : -.1; }
    return p;
  }
  if (t >= 90 && t < 93.5) return shooting(WALK);
  if (t >= 86.6 && t < 87.4) return P1({eyeS: 1.12, pupil: .7, brow: .8, gy: -.6, squash: .94});
  const w = winterK(x);
  return walkPose(w > .5 ? SLEEPY : WALK, x);
}
function lookAt(t) {
  if (t >= DUNK[0] && t < HOP_OUT[1]) return t >= DUNK[0] + (DUNK[1] - DUNK[0]) * .5 ? 'ink' : 'pencil';
  return lookOfX(afRoot(t)[0]);
}
// Travel is exposed on ones; thinking poses on twos.
function exposure(t) {
  const fast = [[HOP_IN[0], HOP_OUT[1] + .6], [TRIP[0], TRIP[0] + 1.0], [99, 100.4]];
  return moving(t) || fast.some(([a, b]) => t >= a && t < b) ? QT1(t) : QT2(t);
}

// ---------- the camera ----------
let FILM_END = JOURNEY_END, routeX = t => routeKey(t);
function viewAt(t) {
  let sx = 0; const n = 16, span = 1.4;
  for (let k = 0; k < n; k++) sx += routeX(clamp(t + (k / (n - 1) - .5) * span, 0, FILM_END));
  return {x: sx / n + 170, y: 640, z: 1.35};
}
const viewSpan = v => [v.x - W / 2 / v.z, v.x + W / 2 / v.z];
const toScreen = (v, [x, y]) => [(x - v.x) * v.z + W / 2, (y - v.y) * v.z + H / 2];

// ---------- Act I props on the route ----------
function canisterAt(t) {
  const c0 = T1.canister;
  if (t < c0 + .2) return {x: -520, y: STRIP.top - 40, rot: 0};
  if (t < c0 + 1.2) { const u = easeOut((t - c0 - .2) / 1), x = lerp(-520, 110, u); return {x, y: STRIP.top - 40 - Math.abs(Math.sin(u * Math.PI * 3)) * 18 * (1 - u), rot: x / 40}; }
  if (t < c0 + 1.6) return {x: 110, y: STRIP.top - 40, rot: 110 / 40};
  if (t < c0 + 2.2) {
    const u = (t - c0 - 1.6) / .6, G = afGeom(LOAD(2.2)), dst = afWorld(G.canister, {x: 180, y: STRIP.top, scale: AF_S});
    return {x: lerp(110, dst[0], u), y: lerp(STRIP.top - 40, dst[1], u) - 4 * 160 * u * (1 - u), rot: lerp(110 / 40, -.45, u) + u * TAU};
  }
  return null;
}
function printAt(t) {
  const s = t - T1.print;
  if (s < .5 || t > 40) return null;
  const home = [LIFT.x + LIFT.w / 2, STRIP.top + STRIP.h / 2], hover = [LIFT.x + 200, 575];
  if (s < 1.4) { const u = easeOut((s - .5) / .9); return {x: lerp(home[0], hover[0], u), y: lerp(home[1], hover[1], u), sc: lerp(.22, 1, u), rot: lerp(0, -.04, u)}; }
  const zoomK = sm(1.6, 3.4, s) * (1 - sm(4.0, 4.5, s)), tiles = s > 1.5 && s < 3.6 ? ((s - 1.5) * 1.6) % 1 : 0;
  if (t < T1.carry + .5) return {x: hover[0], y: hover[1], sc: 1, rot: -.04, zoom: 1 + 5 * zoomK, tiles};
  const c = t - T1.carry - .5, x = afRoot(t)[0], grip = [x + 10, STRIP.top - 262];
  if (c < .5) { const u = easeIO(c / .5); return {x: lerp(hover[0], grip[0], u), y: lerp(hover[1], grip[1], u), sc: lerp(1, .62, u), rot: lerp(-.04, .03, u)}; }
  if (t < T1.tray) return {x: grip[0], y: grip[1] + (Math.floor(x / 17) % 2 ? 3 : 0), sc: .62, rot: .03, flip: sm(T1.carry + 1.2, T1.carry + 2.0, t) * (1 - sm(T1.carry + 3.6, T1.carry + 4.2, t)), live: sm(T1.carry + 4.3, T1.carry + 4.5, t, lin) * (1 - sm(T1.carry + 5.9, T1.carry + 6.1, t, lin))};
  const u = clamp((t - T1.tray) / .5, 0, 1);
  if (u < 1) return {x: lerp(grip[0], TRAY_X + 40, u), y: lerp(grip[1], STRIP.top + 6, u) - 4 * 120 * u * (1 - u), sc: lerp(.62, .3, u), rot: u * 2.6};
  return {x: TRAY_X + 40, y: STRIP.top + 8, sc: .3, rot: 2.6, sunk: true};
}

// ---------- seams ----------
const seamXAt = (i, y) => SEAMS[i] + Math.sin(y / 85 + 1 + i) * 10 + noise1(y / 55, 91 + i) * 12;
function seamPoints(i, v) { const pts = [], y0 = v.y - H / 2 / v.z - 80, y1 = v.y + H / 2 / v.z + 80; for (let y = y0; y <= y1; y += 18) pts.push([seamXAt(i, y), y]); return pts; }
function drawSeamLine(c, look, v, i) {
  if (Math.abs(toScreen(v, [SEAMS[i], v.y])[0] - W / 2) > W / 2 + 120) return;
  const pts = seamPoints(i, v);
  if (i === 0) iLine(c, pts, {w: 4, al: look === 'ink' ? .9 : .6, seed: 17, rough: 1.2});
  else if (i === 1) { iLine(c, pts, {w: 3, col: '#e8efff', al: .9, seed: 18, rough: .8}); }
  else if (i === 2) { iLine(c, pts, {w: 6, col: 'rgba(255,255,255,.9)', seed: 19, rough: .4}); iLine(c, pts.map(([x, y]) => [x + 8, y]), {w: 1.5, col: 'rgba(120,150,210,.6)', seed: 20, rough: .4}); }
  else { ['#ff5d5d', '#ffb84d', '#ffe45c', '#5fd38a', '#4da3ff', '#9b6bff'].forEach((col, k) => iLine(c, pts.map(([x, y]) => [x - 10 + k * 4, y]), {w: 3, col, seed: 21 + k, rough: .5, al: .85})); }
}

// ---------- the page, in one material ----------
function drawPage(c, look, t, v, st) {
  if (look === 'glass') glassBackdrop(c, v);
  else if (look === 'color') colourBackdrop(c, v, t);
  else paper(c, LK[look].paper, null, 87);
  cam(c, v.x, v.y, v.z);
  const span = viewSpan(v);
  if (look === 'chalk') { c.save(); c.strokeStyle = 'rgba(232,239,255,.08)'; c.lineWidth = 1; for (let x = Math.floor(span[0] / 60) * 60; x < span[1]; x += 60) { c.beginPath(); c.moveTo(x, v.y - 500); c.lineTo(x, v.y + 500); c.stroke(); } for (let y = 120; y < 1200; y += 60) { c.beginPath(); c.moveTo(span[0], y); c.lineTo(span[1], y); c.stroke(); } c.restore(); }
  drawStrip(c, look, span, {reveal: t < 2.6 ? lerp(-600, 2600, sm(.1, 2.6, t, easeOut)) : 1e9});
  drawFrames(c, look, span, f => exposeK(f, t));
  drawDayMarks(c, look, span, d => Number.isFinite(EXPOSED[DAY_AT[d].first]) ? sm(EXPOSED[DAY_AT[d].first], EXPOSED[DAY_AT[d].first] + .8, t, lin) : 0);
  for (let i = 0; i < SEAMS.length; i++) drawSeamLine(c, look, v, i);
  if (t < 40) {
    const pr = printAt(t);
    if (Math.abs(TRAY_X - v.x) < W) drawTray(c, look, TRAY_X, {splash: sm(HOP_IN[1] - .05, HOP_IN[1] + .6, t, lin), ripple: t > HOP_IN[1] && t < HOP_OUT[1] + 1.5 ? (t - HOP_IN[1]) * .9 : 0});
    if (pr && pr.sunk) drawPrint(c, look, pr.x, pr.y, {rot: pr.rot, w: 330 * pr.sc, h: 220 * pr.sc, al: .8});
    const can = canisterAt(t);
    if (can) afCanister(c, can.x, can.y, {look, scale: .9 * AF_S, rot: can.rot});
  }
  drawStorage(c, look, t); drawMap(c, look, t); drawPiles(c, look, t); drawJam(c, look, t); drawSearch(c, look, t); drawPress(c, look, t);
  drawDarkroom(c, look, t); drawDoors(c, look, t); drawBox(c, look, t);
  if (st.pose) {
    const al = sm(T1.appear, T1.appear + .8, t, lin), place = {x: st.x + st.dx, y: st.y, scale: AF_S, rot: st.rot};
    if (t < T1.appear + 1.2) construction(c, st.x, st.y - 100, 90, 12, alpha(AFC.lead, .5), 1 - sm(T1.appear + .6, T1.appear + 1.2, t, lin));
    if (t >= 99.3 && t < 101) glow(c, st.x, st.y - 90, 200, '#bfe0ff', 1 - sm(99.3, 101, t, lin));
    const costumeOn = t >= 86.6 && t < 98.9, drop = costumeOn ? (1 - easeOut(clamp((t - 86.6) / .4, 0, 1))) * -500 : 0;
    const G = drawAF(c, st.pose, {...place, look: costumeOn && t >= 87 ? 'glass' : st.look, alpha: al});
    if (costumeOn) drawCostume(c, G, {...place, y: place.y + drop}, 0);
    if (t >= 98.9 && t < 100.4) drawCostume(c, G, place, (t - 98.9) / 1.5);
  }
  drawHDRGlow(c, look, t); drawPhoneBits(c, look, t);
  const pr = t < 40 ? printAt(t) : null;
  if (pr && !pr.sunk) drawPrint(c, look, pr.x, pr.y, {rot: pr.rot, w: 330 * pr.sc, h: 220 * pr.sc, zoom: pr.zoom ?? 1, tiles: pr.tiles ?? 0, flip: pr.flip ?? 0, live: pr.live ?? 0, tau: t});
  if (t > T1.print + .3 && t < T1.print + 1.4) { const a = [LIFT.x + LIFT.w / 2, STRIP.top + STRIP.h / 2]; for (let i = 0; i < 5; i++) mLine(c, look, [[a[0] - 40 + i * 20, a[1] - 60], [a[0] - 40 + i * 20 + 6, a[1] - 110]], {w: 1, al: .5 * (1 - sm(T1.print + .9, T1.print + 1.4, t, lin)), seed: 700 + i}); }
  const y0 = STRIP.top + STRIP.h + 110;
  for (const [lines, x, t0, target, col, t1] of NOTES) if (t > t0 - .2 && t < t1 + .5 && Math.abs(x - v.x) < W * 1.2) marginNote(c, look, typeof lines === 'function' ? lines() : lines, [x, y0], target ? [target, STRIP.top + STRIP.h + 8] : null, sm(t0, t0 + 1, t, lin), {col: col ?? AFC.lead, from: target ? [x + 10, y0 - 34] : undefined, al: 1 - sm(t1, t1 + .4, t, lin)});
}
const NOTES = [
  [['f841d2ad  feat: init'], 260, T1.shoot + .6, FRAMES[0].x + 40],
  [['25521e2a  tiled rendering', '8f2abb33  LOD on demand'], 1700, T1.print + 1.6],
  [() => [LANG === 'zh' ? 'ExifPanel · LivePhoto：init 里就有' : 'ExifPanel + LivePhoto: in init'], 2700, T1.carry + 1.4],
  [['2eb3020d  release: v0.1.0'], SEAM + 40, T1.inked + .4],
  [['7310555c  map explore · #29'], xOf(190) - 60, 34.4],
  [['21a6743c  group by camera · #72', '001506ee  Revert'], xOf(221) - 20, 45.6, null, AFC.red],
  [['444468b8  perf: webgl', 'd98049de  Revert'], xOf(247) - 80, 48.4, null, AFC.red],
  [['6ec545a6  HDR · #52'], xOf(199) - 40, 41.2],
  [['6c940658  search · #115'], xOf(262) - 20, 50.4],
  [['pnpm build:manifest'], xOf(270) - 120, 54.4],
  [['bb308820  server · onboarding', '223e90d4  dashboard · #135 sync · #136'], xOf(292) + 160, 61.2],
  [['bc4cd362  tenants', '26657788  landing · afilmory.art'], xOf(316) + 110, 66.0],
  [['017cd763  Dockerfile'], xOf(340) - 20, 71.2],
  [['a1710924  custom domains'], xOf(429) - 80, 74.6],
  [['e6302a45  first iPhone app (React Native)'], SEAMS[2] + 30, 86.8],
  [['8f6468c7  rewrite app in native Swift · #258'], xOf(761) - 220, 97.4],
  [['7cc409e4 upload · #275 widget · TestFlight'], xOf(790) - 60, 102.4],
  [['215576e7  WebGPU HDR · JPEG gain maps'], SEAMS[3] + 40, 109.2],
  [['4e16a747  iOS 1.5'], xOf(834) - 40, 111.8],
];
// Each note holds up to 5 s, and gives way when the next note near it arrives, so no two ever overlap.
NOTES.sort((a, b) => a[2] - b[2]).forEach((n, i) => {
  n[4] = n[4] ?? null; let t1 = n[2] + 5;
  for (const m of NOTES.slice(i + 1)) if (Math.abs(m[1] - n[1]) < 1100) { t1 = Math.min(t1, m[2] - .5); break; }
  n[5] = t1;
});
const LB = layer();
function renderInto(Lr, fn) { const g = Lr.getContext('2d'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, Lr.width, Lr.height); fn(g); g.restore(); return Lr; }

// ---------- words ----------
const CAPTIONS = [
  [[["Hi, I'm AF.", '你好，我是 AF。', 56], ["I'm a roll of film: one frame per commit.", '我是一卷胶片：每次提交，曝光一格。', 44]], 3.4, 8.4],
  [[['Day one: fourteen frames.', '第一天，十四格。', 52], ['The first one just says init.', '第一格只写着 init。', 44]], 9.3, 13.1],
  [[['First I learned to look closely.', '我先学会了看清楚。', 52], ['Really closely.', '非常、非常清楚。', 44, 15.6]], 13.8, 17.9],
  [[['Every setting you shot with,', '你用过的每个参数，', 52], ['and the moment around it.', '还有快门前后的那一瞬。', 44, 22.3]], 19.1, 24.2],
  [[['Four days in, I went public.', '第四天，我开源了。', 52], ['Fixer makes a print permanent.', '定影之后，照片就不会褪了。', 44]], 26.3, 29.0],
  [[['Keep your photos where they are.', '照片放在哪都行，', 52], ["I'll come to them.", '我自己去取。', 44]], 29.4, 33.4],
  [[['If a photo knows where it was taken,', '照片记得在哪拍的，', 48], ['it gets a pin.', '我就在地图上插一根针。', 44]], 34.2, 39.8],
  [[['Brighter than white?', '比白还亮？', 52], ['On an HDR screen, yes.', '在 HDR 屏幕上，可以。', 44]], 40.6, 44.6],
  [[['Not every idea makes it.', '不是每个点子都能留下。', 52], ['I trip, get up, and keep going.', '摔一跤，爬起来，接着走。', 44]], 46.6, 49.6],
  [[['Then search,', '然后是搜索，', 52], ['so you can find the one you mean.', '一下找到你要的那张。', 44]], 50.0, 53.4],
  [[['Back then I was a static site.', '那时我还是个静态站点。', 52], ['One new photo, and everything got rebuilt.', '加一张照片，就要整站重建、重新部署。', 44, 55.0]], 53.8, 58.4],
  [[['So I built myself a darkroom.', '于是我给自己盖了间暗房。', 52], ["Edit a photo, and it's live.", '改一张照片，马上生效。', 44, 62.4]], 60.2, 64.8],
  [[['Then I opened the doors.', '然后我把门打开了。', 52], ['Anyone can start a gallery here.', '现在谁都能在这开一个相册。', 44]], 66.0, 70.4],
  [[['Rather run it yourself?', '想自己部署？', 52], ['Same code, one Docker image.', '同一套代码，一个 Docker 镜像。', 44]], 71.0, 75.0],
  [[['November alone:', '光是十一月，', 52], ['two hundred and one frames.', '就有两百零一格。', 44]], 75.4, 78.6],
  [[['Then a quiet winter.', '然后是安静的冬天。', 52], ['Forty-five frames in five months.', '五个月，四十五格。', 44]], 79.2, 83.6],
  [[['I kept walking.', '我没有停下。', 52]], 83.9, 86.2],
  [[['Summer. I wanted to fit in your pocket.', '夏天，我想住进你的口袋。', 48]], 87.2, 89.8],
  [[['Thirty-four frames in one day.', '一天三十四格，', 52], ['My busiest ever.', '最忙的一天。', 44]], 90.2, 94.6],
  [[['Twelve days in, I tore it down', '十二天后，我把它拆了，', 50], ['and rebuilt it natively in Swift.', '用 Swift 原生重写。', 44]], 96.8, 101.4],
  [[['Upload from your phone.', '在手机上传照片，', 52], ['A photo of the day on your home screen.', '桌面上每天一张。', 44]], 102.2, 107.6],
  [[['And now colour,', '现在是彩色的，', 52], ['as bright as you shot it.', '和你拍下时一样亮。', 44]], 109.4, 113.8],
];
const CARDS = [
  [{title: 'Afilmory', sub: 'AF · Aperture · Film · Memory'}, .6, 8.9],
  [{title: {en: 'A gallery for photographers', zh: '给摄影师的相册'}, sub: {en: 'your photos, the way you shot them', zh: '照片，就该是你拍下时的样子'}}, 9.3, 13.2],
  [{title: {en: 'WebGL viewer', zh: 'WebGL 查看器'}, sub: {en: 'zoom into huge photos, tile by tile', zh: '再大的照片，也能一块块放大看清'}}, 13.5, 18.2],
  [{title: {en: 'EXIF & Live Photos', zh: 'EXIF 与实况照片'}, sub: {en: 'every setting, and the moment around it', zh: '每个参数，还有快门前后那一瞬'}}, 18.5, 25.6],
  [{title: 'v0.1.0', sub: {en: 'open source', zh: '开源'}}, 26.0, 28.4],
  [{title: {en: 'Bring your own storage', zh: '用你自己的存储'}, sub: 'S3 · GitHub · Eagle · local'}, 28.7, 33.4],
  [{title: {en: 'Explore map', zh: '地图探索'}, sub: {en: 'see where every photo was taken', zh: '看看每张照片在哪拍的'}}, 33.6, 39.9],
  [{title: 'HDR', sub: {en: 'brighter than white, on screens that can show it', zh: '比白更亮，在支持的屏幕上'}}, 40.2, 44.6],
  [{title: {en: 'Search', zh: '搜索'}, sub: {en: 'find any photo by place, camera or tag', zh: '按地点、相机或标签找照片'}}, 49.8, 53.4],
  [{title: {en: 'Server + dashboard', zh: '服务端 + 管理后台'}, sub: {en: 'upload, sync and edit live, no rebuild', zh: '上传、同步、实时编辑，不用重建'}}, 59.6, 65.2],
  [{title: 'afilmory.art', sub: {en: 'sign up, and your gallery is live', zh: '注册即上线你的相册'}}, 65.6, 70.6],
  [{title: {en: 'Or self-host', zh: '也可以自己部署'}, sub: {en: 'the same code, in Docker', zh: '同一套代码，用 Docker'}}, 70.8, 75.2],
  [{title: {en: 'iOS app', zh: 'iOS 应用'}, sub: {en: 'your gallery, on your iPhone', zh: '把相册装进 iPhone'}}, 86.4, 89.9],
  [{title: {en: 'The busiest day', zh: '最忙的一天'}, sub: {en: '34 commits, Aug 1, 2026', zh: '2026年8月1日 · 34 次提交'}}, 90.0, 95.0],
  [{title: 'Native Swift', sub: {en: 'rebuilt from scratch for iPhone', zh: '为 iPhone 从头重写'}}, 96.6, 101.6],
  [{title: {en: 'Upload, widgets, notifications', zh: '上传、小组件、通知'}, sub: {en: 'public beta on TestFlight', zh: 'TestFlight 公测中'}}, 101.8, 108.2],
  [{title: {en: 'HDR, in colour', zh: '彩色 HDR'}, sub: 'WebGPU + JPEG gain maps'}, 108.6, JOURNEY_END - .4],
];
const DATE = n => { if (n < 0) return ''; const d = FRAMES[n].day; return LANG === 'zh' ? `${fullDate(d)} · 第 ${n + 1} 次提交` : `${fullDate(d)} · ${n + 1} commit${n ? 's' : ''}`; };
function overlays(c, t, look = lookAt(t)) {
  for (const [lines, t0, t1] of CAPTIONS) {
    if (t < t0 - .1 || t > t1 + .5) continue;
    let tt = t0; const rows = lines.map(([en, zh, size, at]) => { const a = at ?? tt, text = L10N({en, zh}), d = Math.max(.5, [...text].length * .045); tt = a + d + .2; return [text, a, a + d, size]; });
    caption(c, look, rows, t, [t1, t1 + .4]);
  }
  for (const [card, t0, t1] of CARDS) featureCard(c, look, card, t, t0, t1);
  if (t >= T1.shoot) dateLine(c, look, DATE(lastExposed(t)), sm(T1.shoot, T1.shoot + .4, t, lin) * (1 - sm(JOURNEY_END - .6, JOURNEY_END, t, lin)));
}

// Every frame of the journey comes from here, so no stop ever resets the route.
function journey(c, t) { journeyView(c, t, viewAt(t), true); }
function journeyView(c, t, v, withText = false) {
  const te = exposure(t), [x, y, rot] = afRoot(t), pose = poseAt(te), s = te - HOP_OUT[1];
  const st = {x, y, rot, pose, look: lookAt(t), dx: s > 0 && s < .6 ? (Math.floor(s * 12) % 2 ? 6 : -6) : 0};
  const span = viewSpan(v), base = lookOfX(span[0] - 40);
  drawPage(c, base, t, v, st);
  if (withText) { drawSnow(c, v, t, winterK(x)); resetT(c); overlays(c, t, base); }
  SEAMS.forEach((sx, i) => {
    const ssx = toScreen(v, [sx, v.y])[0]; if (ssx < -80 || ssx > W + 80) return;
    renderInto(LB, g => { drawPage(g, LOOKS[i + 1], t, v, st); if (withText) { drawSnow(g, v, t, winterK(x)); resetT(g); overlays(g, t, LOOKS[i + 1]); } });
    resetT(c); c.save(); const clip = [...seamPoints(i, v).map(p => toScreen(v, p)), [W + 20, H + 20], [W + 20, -20]];
    c.clip(polyPath(clip)); c.drawImage(LB, 0, 0, W, H); c.restore();
  });
  if (!withText) drawSnow(c, v, t, winterK(x));
}
