// The flock: security cameras with flapping wings, drawn with three.js.
// Purely decorative. If three.js fails to load, the strip simply disappears.
(function () {
  const host = document.getElementById("flock");
  if (!host) return;
  if (typeof THREE === "undefined") return; // the pixel skyline still shows

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = "birds";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  camera.position.set(0, 0.6, 22);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xffe2cc, 0x3a2a55, 0.95));
  const sun = new THREE.DirectionalLight(0xffc08a, 0.85);
  sun.position.set(-4, 8, 10);
  scene.add(sun);

  // shared geometry / materials
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2b2f38, roughness: 0.55, metalness: 0.35 });
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xe9ebef, roughness: 0.6, metalness: 0.1 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.15, metalness: 0.8 });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x9aa3b2, roughness: 0.7, side: THREE.DoubleSide });

  const bodyGeo = new THREE.BoxGeometry(1.5, 0.62, 0.7); // camera housing
  const hoodGeo = new THREE.BoxGeometry(1.62, 0.12, 0.82); // sun hood
  const lensGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.28, 20);
  const glassGeo = new THREE.CircleGeometry(0.17, 20);
  const ledGeo = new THREE.SphereGeometry(0.06, 10, 10);
  const tailGeo = new THREE.BoxGeometry(0.35, 0.2, 0.25);

  // wing: a feathered triangle-ish shape, pivoting at the body edge (x = 0)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, -0.28);
  wingShape.lineTo(1.25, -0.15);
  wingShape.lineTo(1.75, 0.05);
  wingShape.lineTo(1.1, 0.12);
  wingShape.lineTo(0, 0.28);
  wingShape.lineTo(0, -0.28);
  const wingGeo = new THREE.ShapeGeometry(wingShape);
  wingGeo.rotateX(-Math.PI / 2); // lay flat in the XZ plane

  function makeBird() {
    const bird = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, shellMat);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.y = 0.36;
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.x = -0.9;
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.z = Math.PI / 2;
    lens.position.x = 0.86;
    const glass = new THREE.Mesh(glassGeo, new THREE.MeshStandardMaterial({ color: 0x223a6b, roughness: 0.05, metalness: 0.9 }));
    glass.rotation.y = Math.PI / 2;
    glass.position.x = 1.01;
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0.55, 0.2, 0.36);

    const wingL = new THREE.Group();
    const wl = new THREE.Mesh(wingGeo, wingMat);
    wl.rotation.y = -Math.PI / 2; // extend toward +z (left side)
    wingL.add(wl);
    wingL.position.set(0, 0.22, 0.35);
    const wingR = new THREE.Group();
    const wr = new THREE.Mesh(wingGeo, wingMat);
    wr.rotation.y = Math.PI / 2; // extend toward -z (right side)
    wingR.add(wr);
    wingR.position.set(0, 0.22, -0.35);

    bird.add(body, hood, tail, lens, glass, led, wingL, wingR);
    bird.userData = { wingL, wingR, led };
    return bird;
  }

  const N = 14;
  const birds = [];
  for (let i = 0; i < N; i++) {
    const b = makeBird();
    const s = 0.45 + Math.random() * 0.45;
    b.scale.setScalar(s);
    b.userData.speed = 1.6 + Math.random() * 1.4;
    b.userData.flap = 7 + Math.random() * 4;
    b.userData.phase = Math.random() * Math.PI * 2;
    b.userData.lane = (Math.random() - 0.5) * 4.2; // height band
    b.userData.depth = -6 + Math.random() * 10;
    b.userData.x = -20 + (i / N) * 40 + Math.random() * 2;
    b.rotation.y = -0.35; // three-quarter view, heading right
    scene.add(b);
    birds.push(b);
  }

  let halfW = 14;
  function resize() {
    const w = host.clientWidth || 600;
    const h = host.clientHeight || 160;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // visible half-width at z = 0
    halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect + 3;
  }
  resize();
  window.addEventListener("resize", resize);

  function tint() {
    wingMat.color.set(dark() ? 0x8a94a6 : 0x9aa3b2);
  }
  tint();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", tint);

  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    for (const b of birds) {
      const u = b.userData;
      u.x += u.speed * dt;
      if (u.x > halfW) { u.x = -halfW; u.lane = (Math.random() - 0.5) * 4.2; }
      const flap = Math.sin(t * u.flap + u.phase);
      b.position.set(u.x, u.lane + Math.sin(t * 1.3 + u.phase) * 0.35 - flap * 0.08, u.depth);
      b.rotation.z = Math.sin(t * 1.3 + u.phase + 1) * 0.08; // gentle pitch
      u.wingL.rotation.x = -flap * 0.9; // flap up/down
      u.wingR.rotation.x = flap * 0.9;
      u.led.visible = Math.sin(t * 3 + u.phase) > -0.3; // recording light blinks
    }
    renderer.render(scene, camera);
  }

  if (reduce) { frame(); return; } // one still frame, no motion
  (function loop() {
    if (visible && !document.hidden) frame();
    requestAnimationFrame(loop);
  })();
})();
