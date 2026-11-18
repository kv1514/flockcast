// District view: SFPD plate-reader COUNTS per supervisor district (no camera locations, by design).
// Ranked choropleth: shaded map + sorted list with bars.
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
  const ranked = ds.slice().sort((a, b) => b.count - a.count || a.district - b.district);
  const max = ranked[0].count;
  const NS = "http://www.w3.org/2000/svg";

  // Equirectangular projection, corrected for SF's latitude.
  const k = Math.cos((37.76 * Math.PI) / 180);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const d of ds) for (const poly of d.outline) for (const [x, y] of poly[0]) {
    minX = Math.min(minX, x * k); maxX = Math.max(maxX, x * k);
    minY = Math.min(minY, -y); maxY = Math.max(maxY, -y);
  }
  const W = 600, pad = 6, s = (W - 2 * pad) / (maxX - minX), H = (maxY - minY) * s + 2 * pad;
  const P = ([x, y]) => [pad + (x * k - minX) * s, pad + (-y - minY) * s];

  const svg = document.getElementById("zone-map");
  const wrap = svg.parentElement;
  const tip = document.getElementById("zone-tip");
  svg.setAttribute("viewBox", `0 0 ${W} ${H.toFixed(0)}`);
  const shapes = new Map();

  for (const d of ds) {
    const path = document.createElementNS(NS, "path");
    path.setAttribute(
      "d",
      d.outline
        .map((poly) => poly.map((ring) => "M" + ring.map((p) => P(p).map((v) => v.toFixed(1)).join(",")).join("L") + "Z").join(""))
        .join("")
    );
    path.setAttribute("class", "zone");
    path.style.setProperty("--heat", (0.08 + 0.92 * (d.count / max)).toFixed(2));
    path.setAttribute("tabindex", "0");
    path.setAttribute("role", "button");
    path.setAttribute("aria-label", `District ${d.district}: ${d.count} cameras`);
    path.addEventListener("click", () => pick(d.district));
    path.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(d.district); }
    });
    path.addEventListener("mousemove", (e) => {
      const r = wrap.getBoundingClientRect();
      tip.hidden = false;
      tip.style.left = `${e.clientX - r.left}px`;
      tip.style.top = `${e.clientY - r.top}px`;
      tip.replaceChildren(`District ${d.district}  `, Object.assign(document.createElement("b"), { textContent: d.count }), " cameras");
    });
    path.addEventListener("mouseleave", () => { tip.hidden = true; });
    svg.append(path);
    shapes.set(d.district, path);
  }

  const list = document.getElementById("zone-list");
  const items = new Map();
  ranked.forEach((d, i) => {
    const b = document.createElement("button");
    b.type = "button";
    const rank = Object.assign(document.createElement("span"), { className: "rank", textContent: i + 1 });
    const name = Object.assign(document.createElement("span"), { textContent: `District ${d.district}` });
    const bar = Object.assign(document.createElement("span"), { className: "bar" });
    const fill = document.createElement("i");
    fill.style.width = `${(100 * d.count) / max}%`;
    bar.append(fill);
    const n = Object.assign(document.createElement("span"), { className: "n", textContent: d.count });
    b.append(rank, name, bar, n);
    b.addEventListener("click", () => pick(d.district));
    b.addEventListener("mouseenter", () => shapes.get(d.district).classList.add("on"));
    b.addEventListener("mouseleave", () => shapes.get(d.district).classList.toggle("on", current === d.district));
    const li = document.createElement("li");
    li.append(b);
    list.append(li);
    items.set(d.district, b);
  });

  document.getElementById("zone-total").textContent = data.total;
  document.getElementById("zone-date").textContent = data.retrieved;

  let current = null;
  function pick(num) {
    current = num;
    const d = ds.find((x) => x.district === num);
    for (const [k2, el] of shapes) el.classList.toggle("on", k2 === num);
    for (const [k2, el] of items) el.setAttribute("aria-pressed", k2 === num ? "true" : "false");
    const share = Math.round((100 * d.count) / data.total);
    const rank = ranked.findIndex((x) => x.district === num) + 1;
    document.getElementById("zone-title").textContent = `District ${d.district}`;
    document.getElementById("zone-stat").textContent =
      `${d.count} of ${data.total} mapped SFPD plate readers (${share}%), #${rank} of 11 districts.`;
  }
  pick(ranked[0].district);
})();
