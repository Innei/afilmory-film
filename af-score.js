'use strict';
// An original score, synthesized with Web Audio on the film's own timeline. Lo-fi felt piano in D,
// the camera's own sounds as percussion: one shutter click per exposed frame (the literal commit
// count), the advance lever as a snare. Each act adds or swaps a layer; colour lifts the key to E.
// Every cue is placed from the route and the timings in af-route.js / af-finale.js, so it cannot drift.

function afScore(ac, t0, destination) {
  const END = FIN.end, master = ac.createGain(), makeup = ac.createGain(); master.gain.value = 1.5;
  makeup.gain.setValueAtTime(1.4, t0); makeup.gain.setValueAtTime(1.4, t0 + END - 2.2); makeup.gain.linearRampToValueAtTime(0, t0 + END);
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -22; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = .006; comp.release.value = .22;
  master.connect(comp); comp.connect(makeup); makeup.connect(destination);
  const verb = ac.createConvolver(), ir = ac.createBuffer(2, Math.floor(ac.sampleRate * 2.4), ac.sampleRate), r = rng(29);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (r() * 2 - 1) * Math.exp(-i / ac.sampleRate * 3); }
  verb.buffer = ir; const wet = ac.createGain(); wet.gain.value = .24; verb.connect(wet); wet.connect(master);
  const out = (node, send = .3, pan = 0) => { const p = ac.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(master); const s = ac.createGain(); s.gain.value = send; p.connect(s); s.connect(verb); };
  const hz = n => 440 * 2 ** ((n - 69) / 12), at = t => t0 + t;
  const env = (g, t, a, v, d) => { g.gain.setValueAtTime(0, at(t)); g.gain.linearRampToValueAtTime(v, at(t) + a); g.gain.exponentialRampToValueAtTime(.0001, at(t) + d); };
  const osc = (type, f, t, d, g) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.connect(g); o.start(at(t)); o.stop(at(t) + d + .05); return o; };
  function piano(n, t, d = 2.4, v = .14, pan = 0) {
    const g = ac.createGain(), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200; g.connect(f); out(f, .55, pan);
    g.gain.setValueAtTime(0, at(t)); g.gain.linearRampToValueAtTime(v, at(t) + .008); g.gain.exponentialRampToValueAtTime(v * .25, at(t) + .3); g.gain.exponentialRampToValueAtTime(.0001, at(t) + d);
    for (const [k, a] of [[1, 1], [2.003, .26], [3.01, .08], [4.02, .03]]) { const m = ac.createGain(); m.gain.value = a; m.connect(g); osc('sine', hz(n) * k, t, d, m); }
  }
  function bell(n, t, v = .06, pan = .3) { const g = ac.createGain(); out(g, .8, pan); env(g, t, .004, v, 2.4); for (const [k, a] of [[1, .7], [2.76, .2], [5.4, .07]]) { const m = ac.createGain(); m.gain.value = a; m.connect(g); osc('sine', hz(n) * k, t, 2.5, m); } }
  function marimba(n, t, v = .08, pan = 0) { const g = ac.createGain(); out(g, .35, pan); env(g, t, .003, v, .5); const m = ac.createGain(); m.gain.value = .25; m.connect(g); osc('sine', hz(n), t, .55, g); osc('sine', hz(n) * 4, t, .15, m); }
  function pluck(n, t, v = .16) { const g = ac.createGain(), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, at(t)); f.frequency.exponentialRampToValueAtTime(220, at(t) + .35); g.connect(f); out(f, .15, -.05); env(g, t, .006, v, .7); osc('triangle', hz(n), t, .75, g); }
  function glide(t, d, f0, f1, v = .05, type = 'sine') { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, at(t)); o.frequency.exponentialRampToValueAtTime(f1, at(t) + d); g.gain.setValueAtTime(0, at(t)); g.gain.linearRampToValueAtTime(v, at(t) + .03); g.gain.setValueAtTime(v, at(t) + d * .7); g.gain.exponentialRampToValueAtTime(.0001, at(t) + d); o.connect(g); out(g, .25); o.start(at(t)); o.stop(at(t) + d + .02); }
  function noise(t, d, v, seed = 1, freq = 3000, q = .7, trem = 0, pan = -.2) {
    const n = Math.ceil(ac.sampleRate * d), b = ac.createBuffer(1, n, ac.sampleRate), x = b.getChannelData(0), rr = rng(seed);
    for (let i = 0; i < n; i++) { const u = i / n, w = trem ? .55 + .45 * Math.sin(i / ac.sampleRate * TAU * trem) : 1; x[i] = (rr() * 2 - 1) * Math.sin(Math.PI * u) ** .6 * w; }
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = v; s.connect(f); f.connect(g); out(g, .15, pan); s.start(at(t));
  }
  // A shutter: a crisp click and a tiny mechanical tail.
  function shutter(t, v = .05, seed = 1) { noise(t, .018, v * 2.2, seed, 5200, 1.6, 0, .15); noise(t + .03, .03, v, seed + 3, 2400, 2, 0, .1); }
  function lever(t, v = .06) { for (let i = 0; i < 3; i++) noise(t + i * .035, .02, v, 90 + i, 1800 + i * 300, 2.5, 0, -.1); }
  function kick(t, v = .22) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(120, at(t)); o.frequency.exponentialRampToValueAtTime(42, at(t) + .18); env(g, t, .003, v, .32); o.connect(g); out(g, .05); o.start(at(t)); o.stop(at(t) + .35); }
  function thud(t, v = .25) { kick(t, v); noise(t, .22, v * .45, 3, 380, 1); }
  function pad(notes, t, d, v = .016, bright = 1500) {
    notes.forEach((n, j) => { const g = ac.createGain(), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(420, at(t)); f.frequency.linearRampToValueAtTime(bright, at(t) + d * .6); g.connect(f); out(f, .6, (j / Math.max(1, notes.length - 1) - .5) * .7);
      g.gain.setValueAtTime(0, at(t)); g.gain.linearRampToValueAtTime(v, at(t) + Math.min(1.2, d * .35)); g.gain.setValueAtTime(v, at(t) + d * .85); g.gain.exponentialRampToValueAtTime(.0001, at(t) + d + 1.2);
      for (const det of [-6, 5]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = det; o.connect(g); o.start(at(t)); o.stop(at(t) + d + 1.3); } });
  }

  // ---------- the bed: one chord per bar at 84 BPM, layers chosen by act ----------
  const BEAT = 60 / 84, BAR = BEAT * 4;
  const D = [[50, 62, 66, 69], [47, 59, 62, 66], [43, 59, 62, 67], [45, 57, 61, 64]];
  const E = D.map(ch => ch.map(n => n + 2));
  const silentFrom = 98.2, silentTo = 99.2;
  const actAt = t => t < 26 ? 'pencil' : t < 59.4 ? 'ink' : t < 79 ? 'chalk' : t < 86.2 ? 'winter' : t < 108.3 ? 'glass' : t < FIN.card ? 'color' : 'end';
  for (let b = 0, t = 0; t < FIN.end - 1; b++, t = b * BAR) {
    const act = actAt(t), ch = (act === 'color' || act === 'end' ? E : D)[b % 4], root = ch[0];
    const quiet = u => u >= silentFrom && u < silentTo;
    if (act === 'pencil') { if (t > 2) ch.slice(1).forEach((n, i) => { if (!quiet(t + i * BEAT)) piano(n + 12, t + i * BEAT * 1.5, 2.6, .07, (i - 1) * .2); }); piano(root + 12, t, 3, .08, -.1); }
    if (act === 'ink') {
      piano(root + 12, t, 2.8, .08); [1, 2, 3].forEach(i => piano(ch[i] + 12, t + BEAT * (i === 3 ? 2.5 : i), 2, .055, .2));
      pluck(root - 12 + 12, t, .15); pluck(root + 7, t + BEAT * 2, .12);
      for (let k = 1; k < 4; k += 2) noise(t + k * BEAT, .12, .035, 40 + b, 3200, .6, 0, .25);
    }
    if (act === 'chalk') {
      const arp = [ch[1], ch[2], ch[3], ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[3], ch[2]];
      for (let k = 0; k < 16; k++) marimba(arp[k % 8] + 12, t + k * BEAT / 4, k % 4 === 0 ? .075 : .05, (k % 2 ? .25 : -.25));
      pluck(root, t, .15); pluck(root, t + BEAT * 2.5, .1); kick(t, .12); kick(t + BEAT * 2, .09);
      lever(t + BEAT, .03); lever(t + BEAT * 3, .03);
    }
    if (act === 'winter') { bell(ch[2] + 24, t, .04, -.3); bell(ch[3] + 24, t + BEAT * 2, .03, .3); noise(t, BAR, .006, 70 + b, 6000, .3); pad([root, ch[2]], t, BAR, .006, 700); }
    if (act === 'glass' && !quiet(t) && !quiet(t + BAR - .1)) {
      for (let k = 0; k < 8; k++) bell([ch[1], ch[2], ch[3], ch[2]][k % 4] + 24, t + k * BEAT / 2, .028, (k % 2 ? .35 : -.35));
      pad(ch.slice(1), t, BAR, .009, 2400); pluck(root, t, .14); kick(t, .16); kick(t + BEAT * 2, .12); lever(t + BEAT * 3, .035);
    }
    if (act === 'color') { pad(ch.slice(1).map(n => n + 12), t, BAR, .012, 3000); piano(root + 12, t, 3, .09); [1, 2, 3].forEach(i => piano(ch[i] + 24, t + i * BEAT * .75, 2.4, .06, (i - 2) * .3)); pluck(root, t, .14); kick(t, .14); }
  }
  // Seams: a chord where the material changes.
  pad([50, 57, 62, 66], TRAY_X ? T1.tray + .6 : 0, 3, .014);
  [[SEAMS[1], [47, 54, 59, 62]], [SEAMS[2], [50, 57, 62, 69]], [SEAMS[3], [52, 59, 64, 68, 71]]].forEach(([sx, notes]) => {
    const t = firstTimeAt(sx); if (!Number.isFinite(t)) return; pad(notes, t - .2, 2.6, .02, 2600); bell(notes[notes.length - 1] + 12, t, .06);
  });

  // ---------- the commits: one shutter per exposed frame ----------
  EXPOSED.forEach((t, i) => { if (Number.isFinite(t) && t < JOURNEY_END && !(t >= silentFrom && t < silentTo)) shutter(t, (t >= 90 && t < 93.5) || (t >= T1.shoot && t < T1.walk6) ? .045 : .022, i + 1); });

  // ---------- Act I cues ----------
  noise(.1, 2.5, .02, 11, 4200, .8, 9); noise(1.3, 1.2, .016, 12, 3600, .8, 11);
  const motif = [74, 78, 81, 76];
  motif.forEach((n, i) => piano(n, 3.35 + i * .22 + (i === 3 ? .2 : 0), 2.2, .11, .1));
  noise(3.95, .08, .05, 13, 5000, 1.5);
  noise(6.2, 1.0, .03, 14, 900, .7, 14); thud(7.6, .1); bell(86, 8.2, .05); piano(78, 8.3, 1.6, .08);
  glide(9.05, .5, 900, 2400, .018);
  bell(88, 14.3, .05); glide(15.0, 2.2, 400, 1600, .03); bell(93, 17.1, .04);
  noise(19.2, .25, .05, 20, 2500, .6); noise(21.6, .25, .05, 21, 2500, .6); for (let i = 0; i < 6; i++) bell(86 + (i % 3) * 3, 22.3 + i * .12, .025, .4);
  noise(T1.tray + .55, .5, .1, 22, 700, .5); for (let i = 0; i < 8; i++) noise(T1.tray + .7 + i * .07, .04, .05, 23 + i, 1400 + i * 120, 3);
  for (let i = 0; i < 7; i++) noise(T1.inked + .2 + i * .045, .04, .06, 30 + i, 1800, 1.4);
  // ---------- Act II ----------
  for (let i = 0; i < 5; i++) noise(29.2 + i * .18, .05, .04, 40 + i, 2200, 2);
  [34.8, 35.3, 35.8, 36.3, 36.8, 37.3, 37.8].forEach((t, i) => marimba(81 + [0, 2, 4, 7, 9, 7, 4][i], t, .05, .3));
  glide(40.6, 1.2, 600, 2400, .03); bell(93, 41.6, .06); bell(98, 41.9, .04);
  glide(45.6, .45, 900, 180, .05); thud(46.3, .2); [86, 90, 93, 90, 86].forEach((n, i) => bell(n, 46.7 + i * .2, .025, i % 2 ? .4 : -.4));
  glide(48.4, .3, 1200, 300, .03); noise(48.5, .3, .05, 50, 600, .6);
  for (let i = 0; i < 5; i++) noise(50.2 + i * .18, .03, .05, 51 + i, 3000, 2);
  noise(54.3, 1.8, .03, 55, 300, .8, 18); thud(56.4, .18); piano(50, 56.9, 2, .08);
  // ---------- Act III ----------
  bell(81, 62.4, .06); bell(88, 62.6, .05);
  DOORS.forEach((_, i) => bell([81, 83, 86, 88][i], 65.2 + 1.6 + i * .2, .04, (i - 1.5) * .25));
  thud(71.2, .08); bell(86, 71.4, .04);
  // ---------- Act IV ----------
  glide(86.6, .4, 1800, 400, .03); thud(87.0, .12);
  for (let k = 0; k < 14; k++) kick(90 + k * BEAT / 2, .1 + k * .006);
  glide(98.2, .7, 440, 60, .05, 'sawtooth'); glide(98.25, .7, 660, 90, .03, 'sawtooth');
  noise(98.9, .45, .12, 60, 1500, .5); noise(99.0, .3, .08, 61, 3200, .8);
  glide(99.2, 1.1, 300, 1200, .03); [74, 78, 81, 86].forEach((n, i) => bell(n + 12, 99.3 + i * .12, .05));
  [102, 104.2, 105.6].forEach((t, i) => { glide(t, .12, 600 + i * 200, 1400 + i * 200, .04); bell(88 + i * 2, t + .05, .03); });
  // ---------- Act V and the ending ----------
  glide(108.2, 1.4, 300, 1800, .035); [76, 80, 83, 88, 92].forEach((n, i) => bell(n, 108.6 + i * .14, .05, (i - 2) * .2));
  pad([52, 59, 64, 68], FIN.pull, FIN.card - FIN.pull, .014, 2200);
  motif.map(n => n + 2).forEach((n, i) => piano(n, FIN.pop - .3 + i * .26 + (i === 3 ? .24 : 0), 3, .12, .1));
  [88, 92, 95, 100].forEach((n, i) => bell(n, FIN.pop + i * .1, .05, (i - 1.5) * .3));
  pad([52, 59, 64, 68, 71], FIN.card, FIN.end - FIN.card, .016, 2600); piano(52, FIN.card, 5, .1); piano(64, FIN.card + .05, 5, .08); piano(76, FIN.card + .1, 5, .07);
  motif.map(n => n + 2).forEach((n, i) => piano(n + 12, FIN.card + 1.2 + i * .3, 3, .07, .15));
  shutter(FIN.card + 3.0, .09, 999); lever(FIN.card + 3.25, .05);
}
function firstTimeAt(x) { for (let t = 0; t <= JOURNEY_END; t += 1 / 60) if (routeKey(t) >= x) return t; return Infinity; }
