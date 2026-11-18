// Banner backdrop: a pixel-art San Francisco skyline at sunset, like an old video game.
// Drawn on a tiny canvas and scaled up with hard pixel edges. Purely decorative:
// no images, no network, and no camera locations (the city is invented pixel art).
(function () {
  const host = document.getElementById("flock");
  if (!host) return;

  const P = 3; // screen pixels per art pixel
  const FPS = 10; // stepped, retro animation
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SKY = ["#1f1140", "#341a5c", "#5a2373", "#8e2f78", "#c8426d", "#ee6a52", "#fb9746", "#ffc562"];
  const WATER = ["#3a2160", "#24154a", "#160d33"];
  const SUN_TOP = "#fff3b0", SUN_BOT = "#ff8a3d";
  const HILL_FAR = "#4a2569", HILL = "#2a1449";
  const CITY_BACK = "#3b1f5e", CITY = "#211039", CITY_FRONT = "#180b2e", GLOW = "#ff8a5c";
  const BRIDGE = "#c8432f", BRIDGE_DARK = "#7c2333";
  const WIN = ["#ffd36b", "#ffe9a8", "#ffb347"];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  const canvas = document.createElement("canvas");
  canvas.className = "sky";
  host.prepend(canvas);
  const g = canvas.getContext("2d");
  const back = document.createElement("canvas"), bk = back.getContext("2d");
  const front = document.createElement("canvas"), fr = front.getContext("2d");

  let W = 0, H = 0, hy = 0, sx = 0, sy = 0, sr = 0;
  let stars = [], clouds = [], blinkers = [], beacons = [], crown = null;

  let seed = 1; // seeded random: the same city on every load and resize
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const ri = (a, z) => a + Math.floor(rnd() * (z - a + 1));
  const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, t) => "#" + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const bump = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const hillH = (x) => Math.round(Math.max(
    bump(x, -W * 0.01, W * 0.06, H * 0.26), // Marin headlands
    bump(x, W * 0.33, W * 0.03, H * 0.13), // Presidio
    bump(x, W * 0.39, W * 0.025, H * 0.08), // Telegraph Hill
    bump(x, W * 0.9, W * 0.07, H * 0.17) // Mount Sutro
  ));

  // ordered-dither gradient, the classic 16-bit sky
  function dither(ctx, y0, y1, colors) {
    const h = y1 - y0;
    if (h <= 0) return;
    const img = ctx.createImageData(W, h), d = img.data, cols = colors.map(rgb);
    for (let y = 0; y < h; y++) {
      const t = (y / Math.max(1, h - 1)) * (cols.length - 1);
      const i = Math.min(cols.length - 2, Math.floor(t)), f = t - i;
      for (let x = 0; x < W; x++) {
        const c = f * 16 > BAYER[((y0 + y) & 3) * 4 + (x & 3)] ? cols[i + 1] : cols[i];
        const o = (y * W + x) * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, y0);
  }

  function tower(x, w, h, col, lit) {
    h = Math.max(2, h);
    const top = hy - h;
    rect(fr, x, top, w, h, col);
    rect(fr, x + w / 2 < sx ? x + w - 1 : x, top, 1, h, mix(col, GLOW, 0.3)); // sunset rim light
    if (rnd() < 0.3) rect(fr, x + (w >> 1), top - 2, 1, 2, col); // antenna
    for (let y = top + 1; y < hy - 1; y += 2)
      for (let xx = x + 1; xx < x + w - 1; xx += 2)
        if (rnd() < lit) {
          if (col === CITY_BACK) { rect(fr, xx, y, 1, 1, "#9a5a7c"); continue; }
          const c = WIN[ri(0, 2)];
          if (rnd() < 0.12) blinkers.push({ x: xx, y, c, p: rnd() * 6.3, r: 0.05 + rnd() * 0.25 });
          else rect(fr, xx, y, 1, 1, c);
        }
  }

  function pyramid(cx, bw, h) { // Transamerica Pyramid
    const top = hy - h;
    for (let y = top; y < hy; y++) {
      const u = (y - top) / h, hw = Math.round(((bw - 1) / 2) * u);
      rect(fr, cx - hw, y, 2 * hw + 1, 1, CITY);
      if (u > 0.35 && u < 0.5) { rect(fr, cx - hw - 1, y, 1, 1, CITY); rect(fr, cx + hw + 1, y, 1, 1, CITY); }
      rect(fr, cx < sx ? cx + hw : cx - hw, y, 1, 1, mix(CITY, GLOW, 0.5));
      if (hw > 1 && y % 2 && rnd() < 0.35) rect(fr, cx - hw + 1 + ri(0, 2 * hw - 2), y, 1, 1, WIN[ri(0, 2)]);
    }
    beacons.push({ x: cx, y: top - 1 });
  }

  function obelisk(cx, w, h) { // Salesforce Tower, with its LED crown
    const x = cx - (w >> 1), top = hy - h;
    rect(fr, x + 2, top, w - 4, 1, CITY);
    rect(fr, x + 1, top + 1, w - 2, 2, CITY);
    rect(fr, x, top + 3, w, h - 3, CITY);
    for (let xx = x + 1; xx < x + w - 1; xx += 2) rect(fr, xx, top + 7, 1, h - 9, mix(CITY, CITY_BACK, 0.6));
    rect(fr, cx < sx ? x + w - 1 : x, top + 3, 1, h - 3, mix(CITY, GLOW, 0.45));
    crown = { x, top, w };
  }

  function coit(cx) { // Coit Tower on Telegraph Hill
    const base = hy - hillH(cx), h = Math.round(H * 0.11);
    rect(fr, cx - 1, base - h, 3, h, CITY);
    rect(fr, cx - 2, base - h, 5, 1, CITY);
    rect(fr, cx - 2, base - h - 1, 1, 1, CITY); rect(fr, cx, base - h - 1, 1, 1, CITY); rect(fr, cx + 2, base - h - 1, 1, 1, CITY);
    rect(fr, cx - 1, base - h + 1, 1, h - 1, mix(CITY, GLOW, 0.35));
  }

  function sutro(cx) { // Sutro Tower
    const base = hy - hillH(cx), h = Math.round(H * 0.34), top = base - h;
    const waist = top + Math.round(h * 0.4), col = "#1c0c30";
    for (let y = waist; y < base; y++) {
      const s = Math.round(1 + (2 * (y - waist)) / (base - waist));
      rect(fr, cx - s, y, 1, 1, col); rect(fr, cx + s, y, 1, 1, col);
      if ((y - waist) % 3 === 0) rect(fr, cx - s, y, 2 * s + 1, 1, col);
    }
    rect(fr, cx - 3, waist, 7, 1, col);
    rect(fr, cx, top, 1, waist - top, col);
    rect(fr, cx - 3, top + 2, 1, waist - top - 2, col);
    rect(fr, cx + 3, top + 2, 1, waist - top - 2, col);
    beacons.push({ x: cx, y: top - 1 }, { x: cx - 3, y: top + 1 }, { x: cx + 3, y: top + 1 });
  }

  function bridge() { // Golden Gate Bridge
    const t1 = Math.round(W * 0.08), t2 = Math.round(W * 0.24), end = Math.round(W * 0.32);
    const top = hy - Math.round(H * 0.46), deck = hy - Math.round(H * 0.11);
    const c1 = t1 + 2, c2 = t2 + 2, mid = (c1 + c2) / 2, half = (c2 - c1) / 2, drop = deck - 2 - top;
    const cableY = (x) => {
      if (x >= c1 && x <= c2) return deck - 1 - drop * ((x - mid) / half) ** 2;
      const u = x < c1 ? (c1 - x) / c1 : (x - c2) / (end - c2);
      return Math.min(deck - 1, top + 1 + drop * u + drop * 0.5 * u * (1 - u));
    };
    let py = Math.round(cableY(0));
    for (let x = 0; x <= end; x++) {
      const y = Math.round(cableY(x));
      rect(fr, x, Math.min(y, py), 1, Math.abs(y - py) + 1, BRIDGE);
      if (x % 3 === 0 && y < deck - 1) rect(fr, x, y + 1, 1, deck - 1 - y, "#9a3440");
      py = y;
    }
    rect(fr, 0, deck, end + 1, 1, BRIDGE);
    rect(fr, 0, deck + 1, end + 1, 1, BRIDGE_DARK);
    rect(fr, end - 1, deck, 2, hy - deck, BRIDGE_DARK);
    for (const tx of [t1, t2]) {
      rect(fr, tx, top, 2, hy - top, BRIDGE);
      rect(fr, tx + 3, top, 2, hy - top, mix(BRIDGE, "#ff9a6a", 0.4));
      rect(fr, tx, top, 5, 2, BRIDGE);
      for (const k of [0.33, 0.66]) rect(fr, tx + 2, top + Math.round((deck - top) * k), 1, 2, BRIDGE);
      for (let y = hy + 1; y < H; y += 2) rect(fr, tx + ((y >> 1) % 2), y, 4, 1, "#5e2142"); // reflection
      beacons.push({ x: tx + 2, y: top - 1 });
    }
  }

  function build() {
    const cw = host.clientWidth, ch = host.clientHeight;
    if (!cw || !ch) return false;
    W = Math.ceil(cw / P); H = Math.ceil(ch / P);
    for (const c of [canvas, back, front]) { c.width = W; c.height = H; }
    canvas.style.width = W * P + "px";
    canvas.style.height = H * P + "px";
    hy = Math.round(H * 0.8);
    sx = Math.round(W * 0.57); sr = Math.round(H * 0.26); sy = hy - Math.round(H * 0.05);
    seed = 20261117;
    stars = []; clouds = []; blinkers = []; beacons = []; crown = null;
    bk.clearRect(0, 0, W, H); fr.clearRect(0, 0, W, H);

    // back layer: sky, sun glow, striped retro sun, water
    dither(bk, 0, hy, SKY);
    for (let y = sy - sr - 4; y < hy; y++)
      for (let x = sx - sr - 4; x <= sx + sr + 4; x++) {
        const d = Math.hypot(x - sx, y - sy);
        if (d > sr && ((d <= sr + 2 && ((x + y) & 1) === 0) || (d <= sr + 4 && x % 2 === 0 && y % 2 === 0)))
          rect(bk, x, y, 1, 1, "#ffb86a");
      }
    for (let y = sy - sr; y < Math.min(hy, sy + sr + 1); y++) {
      const dy = y - sy, n = dy + Math.round(sr * 0.8);
      if (n > 0 && n % 4 < 1 + Math.floor(n / 8)) continue;
      const k = Math.floor(Math.sqrt(sr * sr - dy * dy));
      rect(bk, sx - k, y, 2 * k + 1, 1, mix(SUN_TOP, SUN_BOT, (dy + sr) / (2 * sr)));
    }
    dither(bk, hy, H, WATER);
    rect(bk, 0, hy, W, 1, "#b84a6e");
    rect(bk, sx - sr - 3, hy, 2 * sr + 7, 1, "#ffb15c");

    for (let i = 0; i < W / 9; i++) stars.push({ x: ri(0, W - 1), y: ri(0, Math.round(hy * 0.32)), p: rnd() * 6.3 });
    for (let i = 0; i < 4; i++) clouds.push({ x: rnd() * W, y: Math.round(H * (0.1 + 0.32 * rnd())), len: ri(10, 26), v: 0.6 + rnd() * 1.2 });

    // front layer: East Bay hills, bridge, hills, downtown, landmarks
    for (let x = Math.round(W * 0.34); x < W; x++) {
      const h = Math.round(H * (0.035 + 0.02 * Math.sin(x * 0.09) + 0.012 * Math.sin(x * 0.23 + 1)));
      rect(fr, x, hy - h, 1, h, HILL_FAR);
    }
    bridge();
    for (let x = 0; x < W; x++) { const h = hillH(x); if (h > 0) rect(fr, x, hy - h, 1, h, HILL); }
    coit(Math.round(W * 0.39));
    const x0 = Math.round(W * 0.42), x1 = Math.round(W * 0.82);
    const env = (x) => Math.exp(-(((x - W * 0.58) / (W * 0.14)) ** 2));
    for (let x = x0; x < x1; ) {
      const w = ri(3, 7);
      tower(x, w, Math.round(H * (0.06 + 0.24 * env(x) * (0.55 + 0.45 * rnd()))), CITY_BACK, 0.08);
      x += w + ri(-1, 1);
    }
    pyramid(Math.round(W * 0.5), 9, Math.round(H * 0.5));
    obelisk(Math.round(W * 0.645), 7, Math.round(H * 0.58));
    for (let x = x0 - 3; x < x1 + 3; ) {
      const w = ri(4, 9);
      tower(x, w, Math.round(H * (0.05 + 0.13 * env(x) * rnd())), CITY_FRONT, 0.22);
      x += w + ri(0, 2);
    }
    for (let y = hy + 1; y < hy + 3; y++) for (let x = x0; x < x1; x++) if ((x + y) & 1) rect(fr, x, y, 1, 1, "#1a0f35");
    sutro(Math.round(W * 0.9));
    return true;
  }

  function draw(frame) {
    const t = frame / FPS;
    g.drawImage(back, 0, 0);
    for (const s of stars) if (Math.sin(frame * 0.35 + s.p * 7) > -0.3) rect(g, s.x, s.y, 1, 1, Math.sin(s.p * 9) > 0.6 ? "#fff8d6" : "#c9a7e8");
    for (const c of clouds) {
      const x = Math.round(((c.x + t * c.v) % (W + c.len + 8)) - c.len - 4);
      rect(g, x + Math.round(c.len * 0.3), c.y - 1, Math.round(c.len * 0.35), 1, "#ffd0b0");
      rect(g, x + 2, c.y, c.len - 4, 1, "#ffb09a");
      rect(g, x, c.y + 1, c.len, 1, "#e9798a");
      rect(g, x + 3, c.y + 2, c.len - 7, 1, "#a94a7e");
    }
    for (let y = hy + 1; y < H; y++) { // sun glitter on the bay
      if ((y + frame) % 3 === 0) continue;
      const d = (y - hy) / (H - hy);
      const len = Math.max(1, Math.round(sr * (1 - 0.55 * d) * (0.45 + 0.35 * Math.sin(frame * 0.5 + y * 2.1))));
      rect(g, sx - len + Math.round(Math.sin(frame * 0.3 + y * 1.7) * 2), y, 2 * len + 1, 1, d < 0.25 ? "#ffd77a" : "#fb9746");
    }
    g.drawImage(front, 0, 0);
    for (const b of blinkers) if (Math.sin(t * 6 * b.r + b.p) > 0) rect(g, b.x, b.y, 1, 1, b.c);
    if (frame % 12 < 6) for (const b of beacons) rect(g, b.x, b.y, 1, 1, "#ff3b30");
    if (crown) for (let r = 1; r <= 5; r++) for (let c = 1; c < crown.w - 1; c++)
      if ((c + r + frame) % 5 === 0) rect(g, crown.x + c, crown.top + r, 1, 1, "#bfe3ff");
  }

  let last = 0, visible = true;
  const start = performance.now();
  function rebuild() { if (build()) draw(last); }
  rebuild();
  if ("ResizeObserver" in window) new ResizeObserver(rebuild).observe(host);
  else window.addEventListener("resize", rebuild);
  if (reduce) return; // one still frame, no motion
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
  (function tick(now) {
    const f = Math.floor((now - start) / (1000 / FPS));
    if (f !== last && visible && !document.hidden) { last = f; draw(f); }
    requestAnimationFrame(tick);
  })(start);
})();
