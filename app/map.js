// "Follow the read": a map of where one SF plate read travels, stop by stop.
// San Francisco stops sit in a schematic inset (no camera locations, by design);
// other stops are city-level. Uses globals from app.js: hops, select, statusOf,
// verdictOf, recordOf, el, link.
(async function () {
  const section = document.getElementById("route");
  const svg = document.getElementById("route-map");
  const card = document.getElementById("route-card");
  if (!section || !svg || !card) return;
  let map;
  try {
    map = await fetch("us-map.json").then((r) => r.json());
  } catch (e) {
    section.hidden = true;
    console.warn("map unavailable", e);
    return;
  }
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const P = map.places;
  const mk = (parent, tag, attrs = {}, text) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    parent.append(n);
    return n;
  };

  const INSET = { x: -244, y: 150, w: 222, h: 250 };
  // lab: [dx, dy, text-anchor] for the label
  const NODES = {
    camera: { xy: [-196, 338], label: "Your plate", sub: "read by a Flock camera in SF", lab: [0, 26, "middle"] },
    sfpd: { xy: [-133, 232], label: "SFPD", sub: "San Francisco Police Dept.", lab: [0, -18, "middle"] },
    ncric: { xy: [-70, 338], label: "NCRIC", sub: "regional fusion center", lab: [0, 26, "middle"] },
    flock: { xy: P.atlanta, label: "Flock Safety cloud", sub: "private company · HQ Atlanta, GA", lab: [0, 28, "middle"] },
    states: { xy: P.hub, label: "Other states", sub: "out-of-state police agencies", lab: [0, -18, "middle"] },
    federal: { xy: P.dc, label: "Federal", sub: "federal agencies · Washington, DC", lab: [14, 5, "start"] },
  };
  const TIER_NODE = { device: "camera", private_company: "flock", local_le: "sfpd", regional_fusion: "ncric", out_of_state: "states", federal: "federal" };
  const SPOKES = ["seattle", "phoenix", "denver", "austin", "chicago", "nashville", "albany"].map((k) => P[k]);

  function sourcesOf(hop) {
    if (hop.from?.tier === "device") return ["camera"];
    const n = hop.from?.name || "", out = [];
    if (/flock/i.test(n)) out.push("flock");
    if (/sfpd|police department/i.test(n)) out.push("sfpd");
    if (/ncric/i.test(n)) out.push("ncric");
    return out.length ? out : [TIER_NODE[hop.from?.tier]].filter(Boolean);
  }
  const targetOf = (hop) => TIER_NODE[hop.to?.tier];

  function arcD([x1, y1], [x2, y2]) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    let nx = -dy / L, ny = dx / L;
    if (ny > 0) { nx = -nx; ny = -ny; } // always bulge upward
    const bend = Math.min(150, L * 0.3);
    const cx = (x1 + x2) / 2 + nx * bend, cy = (y1 + y2) / 2 + ny * bend;
    return `M${x1},${y1} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2},${y2}`;
  }

  // ---- static layers ----
  const gLand = mk(svg, "g");
  mk(gLand, "path", { d: map.states, class: "land" });
  mk(gLand, "path", { d: map.nation, class: "nation" });
  mk(gLand, "path", { d: `M${P.sf[0]},${P.sf[1]} L${INSET.x + INSET.w},${INSET.y + 60}`, class: "leader" });
  mk(gLand, "circle", { cx: P.sf[0], cy: P.sf[1], r: 4, class: "sfdot" });
  mk(gLand, "rect", { x: INSET.x, y: INSET.y, width: INSET.w, height: INSET.h, rx: 14, class: "inset" });
  mk(gLand, "text", { x: INSET.x + 14, y: INSET.y + 24, class: "inset-title" }, "San Francisco");
  mk(gLand, "text", { x: INSET.x + 14, y: INSET.y + INSET.h - 12, class: "inset-note" }, "schematic · no camera locations");

  const gArcs = mk(svg, "g");
  const gSpokes = mk(svg, "g", { class: "spokes" });
  for (const s of SPOKES) {
    mk(gSpokes, "path", { d: arcD(P.hub, s) });
    mk(gSpokes, "circle", { cx: s[0], cy: s[1], r: 3.5 });
  }
  const gNodes = mk(svg, "g");
  const gFx = mk(svg, "g");

  let arcs = [], nodeEls = {}, built = false, statesHop = -1;

  function build() {
    gArcs.replaceChildren();
    gNodes.replaceChildren();
    arcs = hops.map((hop, i) => {
      const to = NODES[targetOf(hop)];
      if (targetOf(hop) === "states") statesHop = i;
      return sourcesOf(hop).map((s) => {
        const p = mk(gArcs, "path", { d: arcD(NODES[s].xy, to.xy), class: "arc" });
        p.addEventListener("click", () => select(i));
        return p;
      });
    });
    for (const [key, n] of Object.entries(NODES)) {
      const g = mk(gNodes, "g", { class: "node", tabindex: "0", role: "button", "aria-label": `${n.label}: ${n.sub}` });
      mk(g, "circle", { cx: n.xy[0], cy: n.xy[1], r: 15, class: "halo" });
      mk(g, "circle", { cx: n.xy[0], cy: n.xy[1], r: 8, class: "dot" });
      mk(g, "text", { x: n.xy[0] + n.lab[0], y: n.xy[1] + n.lab[1], "text-anchor": n.lab[2], class: "label" }, n.label);
      const go = () => {
        const i = key === "camera" ? 0 : hops.findIndex((h) => targetOf(h) === key);
        if (i >= 0) { stopPlay(); select(i); }
      };
      g.addEventListener("click", go);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      nodeEls[key] = g;
    }
    built = true;
  }

  // ---- packet: a little plate that travels along the active arcs ----
  let anim = 0;
  function sendPacket(paths) {
    cancelAnimationFrame(anim);
    gFx.replaceChildren();
    if (reduce) return;
    const dots = paths.map(() => {
      const g = mk(gFx, "g", { class: "packet" });
      mk(g, "rect", { x: -15, y: -9, width: 30, height: 18, rx: 4 });
      mk(g, "text", { x: 0, y: 4, "text-anchor": "middle" }, "ABC");
      return g;
    });
    const lens = paths.map((p) => p.getTotalLength());
    const t0 = performance.now(), dur = 1400;
    (function step(now) {
      const u = Math.min(1, (now - t0) / dur), e = 1 - (1 - u) ** 3;
      paths.forEach((p, k) => {
        const pt = p.getPointAtLength(lens[k] * e);
        dots[k].setAttribute("transform", `translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`);
      });
      if (u < 1) anim = requestAnimationFrame(step);
      else setTimeout(() => gFx.replaceChildren(), 500);
    })(t0);
  }

  // ---- side card ----
  function renderCard(i) {
    const hop = hops[i], st = statusOf(hop), v = verdictOf(hop), rule = (hop.rules || [])[0];
    const node = NODES[targetOf(hop)];
    card.replaceChildren(
      el("p", { class: "stop" }, `Stop ${i + 1} of ${hops.length}`),
      el("h3", {}, hop.to?.name || ""),
      el("p", { class: "where" }, node?.sub || ""),
      hop.plain ? el("p", { class: "plain" }, hop.plain) : null,
      el(
        "div",
        { class: `verdict ${v.cls}` },
        el("span", { class: "q" }, "Is it allowed to have your data?"),
        el("strong", {}, v.label),
        rule ? el("p", {}, rule.summary, " ", link(rule.url, "source ↗")) : null
      ),
      el(
        "div",
        { class: `record ${st}` },
        el("span", { class: "q" }, "What the record shows"),
        el("strong", {}, recordOf(hop))
      ),
      el(
        "div",
        { class: "route-nav" },
        el("button", { type: "button", onclick: () => { stopPlay(); select(i - 1); }, disabled: i === 0 }, "← Back"),
        el("button", { type: "button", onclick: () => { stopPlay(); select(i + 1); }, disabled: i === hops.length - 1 }, "Next stop →"),
        el("a", { href: "#detail" }, "Every rule and source ↓")
      )
    );
  }

  let shown = -1;
  function update(i) {
    if (!built) build();
    const hop = hops[i];
    if (!hop) return;
    const st = statusOf(hop);
    arcs.forEach((list, j) => list.forEach((p) => p.setAttribute("class", `arc ${j < i ? "done" : j === i ? `now ${st}` : "todo"}`)));
    const visited = new Set(["camera", ...hops.slice(0, i + 1).map(targetOf)]);
    const from = new Set(sourcesOf(hop));
    for (const [key, g] of Object.entries(nodeEls)) {
      const cls = ["node", visited.has(key) ? "seen" : "", key === targetOf(hop) ? `here ${st}` : "", from.has(key) ? "from" : ""];
      g.setAttribute("class", cls.filter(Boolean).join(" "));
    }
    gSpokes.classList.toggle("on", statesHop >= 0 && i >= statesHop);
    renderCard(i);
    if (i !== shown) sendPacket(arcs[i]);
    shown = i;
  }
  document.addEventListener("hopchange", (e) => update(e.detail));
  if (typeof hops !== "undefined" && hops.length) update(typeof current === "number" ? current : 0);

  // ---- play: follow the read through every stop ----
  const play = document.getElementById("route-play");
  let timer = null;
  function stopPlay() {
    clearInterval(timer);
    timer = null;
    play.textContent = "▶ Follow the read";
    play.setAttribute("aria-pressed", "false");
  }
  play.addEventListener("click", () => {
    if (timer) return stopPlay();
    play.textContent = "❚❚ Pause";
    play.setAttribute("aria-pressed", "true");
    select(0);
    timer = setInterval(() => {
      if (current >= hops.length - 1) return stopPlay();
      select(current + 1);
    }, 3800);
  });
})();
