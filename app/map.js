// "Follow the read" (the hero): one SF plate read travels stop by stop on a real map.
// At each hop the map frames the trip, sends the plate along the path, then zooms in
// on where it landed; the card shows the rule there and whether the rule held.
// Leaflet + keyless Esri/OpenStreetMap tiles, no API key. Camera locations are never shown:
// the camera stop is the whole city, shaded by cameras per district (counts only).
// Uses globals from app.js: hops, current, select, statusOf, verdictOf, recordOf, el, link.
// If Leaflet can't load, map-svg.js draws a static map instead.
(function () {
  if (!window.L) return;
  const section = document.getElementById("route");
  const host = document.getElementById("route-live");
  const card = document.getElementById("route-card");
  const steps = document.getElementById("route-steps");
  const play = document.getElementById("route-play");
  if (!section || !host || !card || !steps || !play) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // Where each holder is based. Public institutional addresses only.
  const NODES = {
    camera: { ll: [37.7585, -122.4413], zoom: 12, short: "Your plate", label: "Your plate · San Francisco",
      sub: "Read by one of SFPD's ~400 Flock cameras. Exact camera locations are left out; the map shades cameras per district." },
    flock: { ll: [33.7866, -84.4107], zoom: 14, short: "Flock cloud", label: "Flock Safety HQ",
      sub: "Private company · Howell Mill Rd, Atlanta, GA · hosts SF's reads in its cloud" },
    sfpd: { ll: [37.7727, -122.3894], zoom: 15, short: "SFPD", label: "SFPD Headquarters",
      sub: "San Francisco Police Department · 1245 3rd St, Mission Bay" },
    ncric: { ll: [37.7793, -122.4193], zoom: 13, short: "NCRIC", label: "NCRIC",
      sub: "Regional fusion center · San Francisco (shown at city level)" },
    states: { ll: [39.5, -98.35], short: "Other states", label: "Other states",
      sub: "Out-of-state police agencies, nationwide", fit: [[25, -124], [49, -67]] },
    federal: { ll: [38.8951, -77.0364], zoom: 12, short: "Federal", label: "Federal agencies",
      sub: "Washington, DC area" },
  };
  const TIER_NODE = { device: "camera", private_company: "flock", local_le: "sfpd", regional_fusion: "ncric", out_of_state: "states", federal: "federal" };
  const SPOKES = [[47.61, -122.33], [33.45, -112.07], [39.74, -104.99], [30.27, -97.74], [41.88, -87.63], [36.16, -86.78], [42.65, -73.76], [25.77, -80.19]];

  function sourcesOf(hop) {
    if (hop.from?.tier === "device") return ["camera"];
    const n = hop.from?.name || "", out = [];
    if (/flock/i.test(n)) out.push("flock");
    if (/sfpd|police department/i.test(n)) out.push("sfpd");
    if (/ncric/i.test(n)) out.push("ncric");
    return out.length ? out : [TIER_NODE[hop.from?.tier]].filter(Boolean);
  }
  const targetOf = (hop) => TIER_NODE[hop.to?.tier];

  // a gentle arc, bulging north
  function curve([y1, x1], [y2, x2], n = 64) {
    const dx = x2 - x1, dy = y2 - y1, L0 = Math.hypot(dx, dy) || 1e-9;
    let nx = -dy / L0, ny = dx / L0;
    if (ny < 0) { nx = -nx; ny = -ny; }
    const cx = (x1 + x2) / 2 + nx * L0 * 0.22, cy = (y1 + y2) / 2 + ny * L0 * 0.22;
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      pts.push([a * y1 + b * cy + c * y2, a * x1 + b * cx + c * x2]);
    }
    return pts;
  }

  // ---- the map ----
  const map = L.map(host, { scrollWheelZoom: false, zoomControl: false, zoomSnap: 0.25, worldCopyJump: true })
    .setView(NODES.camera.ll, 12);
  L.control.zoom({ position: "bottomleft" }).addTo(map);
  // Keyless basemaps: Esri street map (dark gray canvas in dark mode); OpenStreetMap if Esri fails.
  const ESRI = dark ? "Canvas/World_Dark_Gray_Base" : "World_Street_Map";
  let base = L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/${ESRI}/MapServer/tile/{z}/{y}/{x}`, {
    maxZoom: dark ? 16 : 19,
    attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  let tileErrors = 0;
  base.on("tileerror", () => {
    if (++tileErrors !== 4) return;
    map.removeLayer(base);
    base = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  });
  if ("ResizeObserver" in window) new ResizeObserver(() => map.invalidateSize()).observe(host);

  // keep the destination clear of the floating card
  const cardPad = () => (window.innerWidth > 760 ? card.offsetWidth + 28 : 0);
  const fitPad = () => ({ paddingTopLeft: [40, 50], paddingBottomRight: [cardPad() + 40, 50] });
  function centerFor(ll, zoom) {
    const p = map.project(ll, zoom).add([cardPad() / 2, 0]);
    return map.unproject(p, zoom);
  }

  const marks = {};
  for (const [k, n] of Object.entries(NODES)) {
    marks[k] = L.circleMarker(n.ll, { radius: 8, weight: 3 }).addTo(map);
    marks[k].on("click", () => goNode(k));
  }
  const pulse = L.marker(NODES.camera.ll, {
    icon: L.divIcon({ className: "pulse-icon", html: "<i></i>", iconSize: [48, 48], iconAnchor: [24, 24] }),
    interactive: false, keyboard: false,
  });
  const plateIcon = L.divIcon({ className: "plate-icon", html: "<span>YOUR PLATE</span>", iconSize: [92, 24], iconAnchor: [46, 12] });

  // camera counts per supervisor district (no camera points), shown at the start
  let districts = null, mode = "intro";
  fetch("district_counts.json")
    .then((r) => r.json())
    .then((d) => {
      const ds = d.districts.map((x) => ({ ...x, outline: x.outline.filter((poly) => poly[0].every(([lon]) => lon > -122.6)) }));
      const max = Math.max(...ds.map((x) => x.count));
      districts = L.layerGroup(
        ds.map((x) =>
          L.polygon(x.outline.map((poly) => poly.map((ring) => ring.map(([lon, lat]) => [lat, lon]))), {
            color: "#1a73e8", weight: 1.2, fillColor: "#1a73e8", fillOpacity: 0.06 + 0.5 * (x.count / max),
          }).bindTooltip(`District ${x.district}: ${x.count} cameras mapped`, { sticky: true })
        )
      );
      if (mode === "intro") districts.addTo(map);
    })
    .catch(() => {});

  // ---- path lines ----
  const lines = [];
  let spokes = null, statesHop = -1;
  function setLines(i) {
    hops.forEach((hop, j) => {
      const to = NODES[targetOf(hop)];
      if (j < i) {
        if (!lines[j]) lines[j] = sourcesOf(hop).map(() => L.polyline([], {}).addTo(map));
        sourcesOf(hop).forEach((s, k) => lines[j][k].setLatLngs(curve(NODES[s].ll, to.ll)));
        lines[j].forEach((l) => l.setStyle({ color: css("--muted"), weight: 3, opacity: 0.55, dashArray: null }));
      } else if (lines[j]) {
        lines[j].forEach((l) => l.remove());
        lines[j] = null;
      }
    });
  }
  function showSpokes(on) {
    if (on && !spokes) {
      const c = css("--bad");
      spokes = L.layerGroup(
        SPOKES.flatMap((s) => [
          L.polyline(curve(NODES.states.ll, s, 24), { color: c, weight: 1.6, opacity: 0.8, dashArray: "4 6", interactive: false }),
          L.circleMarker(s, { radius: 4, color: c, fillColor: c, fillOpacity: 1, weight: 1, interactive: false }),
        ])
      ).addTo(map);
    } else if (!on && spokes) {
      spokes.remove();
      spokes = null;
    }
  }

  function styleNodes(i) {
    const here = i < 0 ? "camera" : targetOf(hops[i]);
    const seen = new Set(["camera", ...hops.slice(0, i + 1).map(targetOf)]);
    const st = i < 0 ? "ok" : statusOf(hops[i]);
    for (const [k, m] of Object.entries(marks)) {
      const isHere = k === here, isSeen = seen.has(k);
      const col = isHere ? css(i < 0 ? "--accent" : `--${st}`) : isSeen ? css("--ink") : css("--muted");
      m.setStyle({ radius: isHere ? 10 : 7, color: col, fillColor: isSeen || isHere ? col : css("--panel"), fillOpacity: 1 });
      m.unbindTooltip();
      m.bindTooltip(NODES[k].label, { permanent: isHere, direction: "top", offset: [0, -10], className: isHere ? "stop-tip here" : "stop-tip" });
      if (isHere) m.openTooltip();
    }
    pulse.setLatLng(NODES[here].ll);
    pulse.getElement()?.setAttribute("data-st", i < 0 ? "start" : st);
  }

  // ---- stepper + card ----
  function renderSteps(i) {
    const item = (n, label, cls, idx) =>
      el("li", {}, el("button", {
        type: "button",
        class: cls,
        "aria-current": idx === i ? "step" : null,
        onclick: () => { stopPlay(); idx < 0 ? intro() : select(idx); },
      }, el("span", { class: "n" }, n), label));
    steps.replaceChildren(
      item("●", NODES.camera.short, "start", -1),
      ...hops.map((h, j) => item(String(j + 1), NODES[targetOf(h)]?.short || h.to?.name, statusOf(h), j))
    );
  }

  function renderCard(i) {
    if (i < 0) {
      card.replaceChildren(
        el("p", { class: "stop" }, "Start"),
        el("h3", {}, "Your plate, San Francisco"),
        el("p", { class: "plain" }, "A Flock camera reads your plate as you drive by. SFPD runs about 400 of them; OpenStreetMap volunteers have mapped 430, shaded here by supervisor district. Exact camera locations are left out on purpose."),
        el("p", { class: "plain" }, "Press play to follow that read through 5 stops. At each one: who holds it, whether the rule allows them to, and what the record shows."),
        el("div", { class: "route-nav" },
          el("button", { type: "button", class: "primary", onclick: () => startPlay() }, "▶ Follow the read"),
          el("button", { type: "button", onclick: () => { stopPlay(); select(0); } }, "First stop →"))
      );
      return;
    }
    const hop = hops[i], st = statusOf(hop), v = verdictOf(hop), rule = (hop.rules || [])[0];
    const node = NODES[targetOf(hop)];
    card.replaceChildren(
      el("p", { class: "stop" }, `Stop ${i + 1} of ${hops.length}`),
      el("h3", {}, hop.to?.name || ""),
      el("p", { class: "where" }, node?.sub || ""),
      hop.plain ? el("p", { class: "plain" }, hop.plain) : null,
      el("div", { class: `verdict ${v.cls}` },
        el("span", { class: "q" }, "Is it allowed to have your data?"),
        el("strong", {}, v.label),
        rule ? el("p", {}, rule.summary, " ", link(rule.url, "source ↗")) : null),
      el("div", { class: `record ${st}` },
        el("span", { class: "q" }, "What the record shows"),
        el("strong", {}, recordOf(hop))),
      el("div", { class: "route-nav" },
        el("button", { type: "button", onclick: () => { stopPlay(); i === 0 ? intro() : select(i - 1); } }, "← Back"),
        el("button", { type: "button", disabled: i === hops.length - 1, onclick: () => { stopPlay(); select(i + 1); } }, "Next stop →"),
        el("a", { href: "#detail" }, "Every rule and source ↓"))
    );
  }

  // ---- motion ----
  let token = 0, playing = false, playTimer = null;
  function moved(fn, ms) {
    return new Promise((res) => {
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      map.once("moveend", fin);
      fn();
      setTimeout(fin, ms);
    });
  }
  function view(to, animate) {
    if (to.fit) return animate ? map.flyToBounds(to.fit, { ...fitPad(), duration: 1.5 }) : map.fitBounds(to.fit, fitPad());
    const c = centerFor(to.ll, to.zoom);
    return animate ? map.flyTo(c, to.zoom, { duration: 1.7 }) : map.setView(c, to.zoom);
  }
  function travel(i, froms, to, color, my) {
    return new Promise((res) => {
      const paths = froms.map((k) => curve(NODES[k].ll, to.ll));
      lines[i] = froms.map(() => L.polyline([], { color, weight: 5, opacity: 0.95 }).addTo(map));
      const plates = froms.map((k) => L.marker(NODES[k].ll, { icon: plateIcon, interactive: false, keyboard: false, zIndexOffset: 1000 }).addTo(map));
      const t0 = performance.now(), dur = 1800;
      (function step(now) {
        if (my !== token) { plates.forEach((p) => p.remove()); return res(); }
        const u = Math.min(1, (now - t0) / dur), e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
        paths.forEach((pts, k) => {
          const n = Math.max(1, Math.round(e * (pts.length - 1)));
          lines[i][k].setLatLngs(pts.slice(0, n + 1));
          plates[k].setLatLng(pts[n]);
        });
        if (u < 1) requestAnimationFrame(step);
        else { setTimeout(() => plates.forEach((p) => p.remove()), 250); res(); }
      })(t0);
    });
  }

  function intro() {
    ++token;
    mode = "intro";
    clearTimeout(playTimer);
    setLines(0);
    showSpokes(false);
    districts?.addTo(map);
    if (!map.hasLayer(pulse)) pulse.addTo(map);
    styleNodes(-1);
    renderSteps(-1);
    renderCard(-1);
    view(NODES.camera, !reduce);
  }

  async function go(i) {
    const hop = hops[i];
    if (!hop) return;
    const my = ++token;
    mode = "hop";
    clearTimeout(playTimer);
    districts?.remove();
    const toKey = targetOf(hop), to = NODES[toKey], froms = sourcesOf(hop);
    statesHop = hops.findIndex((h) => targetOf(h) === "states");
    setLines(i);
    showSpokes(statesHop >= 0 && i > statesHop);
    if (!map.hasLayer(pulse)) pulse.addTo(map);
    styleNodes(i);
    renderSteps(i);
    renderCard(i);
    const color = css(`--${statusOf(hop)}`);
    if (reduce) {
      lines[i] = froms.map((k) => L.polyline(curve(NODES[k].ll, to.ll), { color, weight: 5 }).addTo(map));
      view(to, false);
      showSpokes(statesHop >= 0 && i >= statesHop);
      return arrive(i, my);
    }
    // 1) frame the whole trip
    const pts = [...froms.map((k) => NODES[k].ll), to.ll];
    await moved(() => map.flyToBounds(pts, { ...fitPad(), duration: 1.1, maxZoom: 13 }), 1700);
    if (my !== token) return;
    // 2) send the plate along the path
    await travel(i, froms, to, color, my);
    if (my !== token) return;
    // 3) zoom in on where it landed
    showSpokes(statesHop >= 0 && i >= statesHop);
    await moved(() => view(to, true), 2300);
    if (my !== token) return;
    arrive(i, my);
  }

  function arrive(i, my) {
    if (!playing) return;
    playTimer = setTimeout(() => {
      if (!playing || my !== token) return;
      if (current < hops.length - 1) select(current + 1);
      else { stopPlay(); overview(); }
    }, 4200);
  }

  function overview() { // the whole path at once
    const all = Object.values(NODES).map((n) => n.ll);
    setLines(hops.length);
    showSpokes(true);
    map.flyToBounds(all, { ...fitPad(), duration: 1.6 });
  }

  function goNode(k) {
    stopPlay();
    if (k === "camera") return intro();
    const i = hops.findIndex((h) => targetOf(h) === k);
    if (i >= 0) select(i);
  }

  // ---- play ----
  function stopPlay() {
    playing = false;
    clearTimeout(playTimer);
    play.textContent = "▶ Follow the read";
    play.setAttribute("aria-pressed", "false");
  }
  function startPlay() {
    playing = true;
    play.textContent = "❚❚ Pause";
    play.setAttribute("aria-pressed", "true");
    select(0);
  }
  play.addEventListener("click", () => (playing ? stopPlay() : startPlay()));

  // app.js fires "hopchange" on every select(); its first one is the page load.
  let first = true;
  document.addEventListener("hopchange", (e) => {
    if (first) { first = false; intro(); return; }
    go(e.detail);
  });
})();
