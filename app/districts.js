// District view: SFPD plate-reader COUNTS per supervisor district (no camera locations, by design).
(async function () {
  const section = document.getElementById("zones");
  if (!section) return;
  let data;
  try {
    data = await fetch("district_counts.json", { cache: "no-store" }).then((r) => r.json());
    if (!data?.districts?.length) throw new Error("no districts");
  } catch (e) {
    section.hidden = true;
    console.warn("district counts unavailable", e);
    return;
  }
  // Drop far-offshore islands (the Farallones belong to SF but would shrink the map).
  const ds = data.districts.map((d) => ({
    ...d,
    outline: d.outline.filter((poly) => poly[0].every(([x]) => x > -122.6)),
  }));
  const max = Math.max(...ds.map((d) => d.count));
  const NS = "http://www.w3.org/2000/svg";

  // Simple equirectangular projection, corrected for SF's latitude.
  const k = Math.cos((37.76 * Math.PI) / 180);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const d of ds) for (const poly of d.outline) for (const [x, y] of poly[0]) {
    minX = Math.min(minX, x * k); maxX = Math.max(maxX, x * k);
    minY = Math.min(minY, -y); maxY = Math.max(maxY, -y);
  }
  const W = 600, pad = 12, s = (W - 2 * pad) / (maxX - minX), H = (maxY - minY) * s + 2 * pad;
  const P = ([x, y]) => [pad + (x * k - minX) * s, pad + (-y - minY) * s];

  const svg = document.getElementById("zone-map");
  svg.setAttribute("viewBox", `0 0 ${W} ${H.toFixed(0)}`);
  const shapes = new Map();
  const dots = new Map();

  for (const d of ds) {
    const path = document.createElementNS(NS, "path");
    path.setAttribute(
      "d",
      d.outline.map((poly) => poly.map((ring) => "M" + ring.map((p) => P(p).map((v) => v.toFixed(1)).join(",")).join("L") + "Z").join("")).join("")
    );
    path.setAttribute("class", "zone");
    path.style.setProperty("--heat", (0.12 + 0.78 * (d.count / max)).toFixed(2));
    path.setAttribute("tabindex", "0");
    path.setAttribute("role", "button");
    path.setAttribute("aria-label", `District ${d.district}: ${d.count} cameras`);
    path.addEventListener("click", () => pick(d.district));
    path.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(d.district); } });
    svg.append(path);
    shapes.set(d.district, path);
  }
  // count bubble at each district's centre (largest polygon's vertex average)
  for (const d of ds) {
    const big = d.outline.slice().sort((a, b) => b[0].length - a[0].length)[0][0];
    const c = big.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]).map((v) => v / big.length);
    const [cx, cy] = P(c);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "bubble");
    g.setAttribute("transform", `translate(${cx.toFixed(1)},${cy.toFixed(1)})`);
    const r = 9 + 13 * Math.sqrt(d.count / max);
    const halo = document.createElementNS(NS, "circle");
    halo.setAttribute("r", (r + 7).toFixed(1));
    halo.setAttribute("class", "halo");
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("r", r.toFixed(1));
    const t = document.createElementNS(NS, "text");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dy", "0.35em");
    t.textContent = d.count;
    g.append(halo, dot, t);
    g.addEventListener("click", () => pick(d.district));
    svg.append(g);
    dots.set(d.district, g);
  }

  // "Choose district" list, most cameras first
  const list = document.getElementById("zone-list");
  const items = new Map();
  for (const d of ds.slice().sort((a, b) => b.count - a.count)) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    const name = document.createElement("span");
    name.textContent = `District ${d.district}`;
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = d.count;
    b.append(name, n);
    b.addEventListener("click", () => pick(d.district));
    li.append(b);
    list.append(li);
    items.set(d.district, b);
  }

  document.getElementById("zone-total").textContent = data.total;
  document.getElementById("zone-date").textContent = data.retrieved;

  function pick(num) {
    const d = ds.find((x) => x.district === num);
    for (const [k2, el] of shapes) el.classList.toggle("on", k2 === num);
    for (const [k2, el] of dots) el.classList.toggle("on", k2 === num);
    for (const [k2, el] of items) el.setAttribute("aria-pressed", k2 === num ? "true" : "false");
    const share = Math.round((100 * d.count) / data.total);
    const rank = ds.slice().sort((a, b) => b.count - a.count).findIndex((x) => x.district === num) + 1;
    document.getElementById("zone-title").textContent = `District ${d.district}`;
    document.getElementById("zone-stat").textContent =
      `${d.count} of ${data.total} mapped SFPD plate readers (${share}%), #${rank} of 11 districts.`;
  }
  pick(ds.slice().sort((a, b) => b.count - a.count)[0].district);
})();
