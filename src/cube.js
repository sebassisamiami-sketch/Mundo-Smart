import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/*
 * Escena 3D de Mundo Smart:
 *  - Un cubo de cristal principal que reacciona al scroll (posición, escala, giro)
 *  - Cubos pequeños flotando con paralaje
 *  - Un haz de luz tipo prisma detrás para que el cristal "refracte" colores
 * Funciona igual en móvil (scroll/táctil) y en PC (scroll + mouse).
 */

const canvas = document.getElementById('stage');
if (canvas) boot(canvas);

function boot(canvas) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !coarse,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    canvas.style.display = 'none';
    document.documentElement.classList.add('no-webgl');
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 9;

  // Luces de color para teñir los bordes del cristal
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 4, 5);
  scene.add(key);
  const cyan = new THREE.PointLight(0x4da3ff, 18, 14);
  cyan.position.set(-4, 1.5, 3);
  scene.add(cyan);
  const magenta = new THREE.PointLight(0xff4d9a, 14, 14);
  magenta.position.set(4, -2, 2);
  scene.add(magenta);

  // Material de cristal
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xcfdcff,
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    thickness: 2.2,
    ior: 1.5,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 620],
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.5,
    attenuationColor: new THREE.Color(0x5f7fc0),
    attenuationDistance: 1.8,
  });
  if ('dispersion' in glass) glass.dispersion = 0.6;

  // Haz de luz espectral detrás del cubo (lo que se ve "dentro" del cristal)
  const beamTex = makeBeamTexture();
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.1),
    new THREE.MeshBasicMaterial({
      map: beamTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    })
  );
  beam.position.z = -1.4;
  beam.rotation.z = -0.14;
  scene.add(beam);

  // Cubo principal
  const hero = new THREE.Mesh(new RoundedBoxGeometry(2.2, 2.2, 2.2, 6, 0.16), glass);
  scene.add(hero);

  // Cubos pequeños
  const count = coarse ? 6 : 10;
  const minis = [];
  for (let i = 0; i < count; i++) {
    const size = 0.28 + Math.random() * 0.5;
    const m = new THREE.Mesh(new RoundedBoxGeometry(size, size, size, 4, size * 0.14), glass);
    const depth = -2.5 + Math.random() * 4;
    minis.push({
      mesh: m,
      fx: (Math.random() * 2 - 1) * 1.05, // fracción del ancho visible
      fy: Math.random() * 2 - 1,
      depth,
      par: 0.0007 + (depth + 3) * 0.00032, // paralaje: más cerca = se mueve más
      spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.5 + Math.random() * 0.6),
      phase: Math.random() * Math.PI * 2,
    });
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(m);
  }

  // Estado del scroll
  const keys = [
    { p: 0.0, x: 0.0, y: 0.03, s: 1.0, o: 1.0 },
    { p: 0.16, x: 0.62, y: -0.04, s: 0.55, o: 0.75 },
    { p: 0.42, x: -0.68, y: 0.0, s: 0.5, o: 0.5 },
    { p: 0.7, x: 0.68, y: 0.0, s: 0.5, o: 0.5 },
    { p: 1.0, x: 0.0, y: 0.0, s: 0.75, o: 0.7 },
  ];

  let W = 1,
    H = 1,
    halfW = 1,
    halfH = 1,
    aspect = 1;
  const view = { p: 0, x: 0, y: 0, s: 1, o: 1 };
  let scrollY = scrollYNow();
  let lastScrollY = scrollY;
  let spin = 0; // impulso extra al hacer scroll rápido
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function scrollYNow() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === W && Math.abs(h - H) < 120) return; // ignora la barra de URL en móvil
    W = w;
    H = h;
    aspect = W / H;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.setSize(W, H, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * aspect;
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  addEventListener('scroll', () => (scrollY = scrollYNow()), { passive: true });
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      pointer.tx = (e.clientX / W) * 2 - 1;
      pointer.ty = (e.clientY / H) * 2 - 1;
    },
    { passive: true }
  );

  function sampleKeys(p) {
    let a = keys[0];
    let b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (p >= keys[i].p && p <= keys[i + 1].p) {
        a = keys[i];
        b = keys[i + 1];
        break;
      }
    }
    const t = b.p === a.p ? 0 : (p - a.p) / (b.p - a.p);
    const e = t * t * (3 - 2 * t); // smoothstep
    return {
      x: a.x + (b.x - a.x) * e,
      y: a.y + (b.y - a.y) * e,
      s: a.s + (b.s - a.s) * e,
      o: a.o + (b.o - a.o) * e,
    };
  }

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      tick();
    }
  });

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    const max = Math.max(1, document.documentElement.scrollHeight - H);
    const p = Math.min(1, Math.max(0, scrollY / max));
    const k = sampleKeys(p);

    // Suavizado (lerp) hacia el objetivo
    const ease = 1 - Math.pow(0.0015, dt);
    const mobileShift = aspect < 0.9 ? 0.5 : 1;
    const baseScale = THREE.MathUtils.clamp(aspect / 1.5, 0.62, 1);
    view.p += (p - view.p) * ease;
    view.x += (k.x * mobileShift - view.x) * ease;
    view.y += (k.y - view.y) * ease;
    view.s += (k.s * baseScale - view.s) * ease;
    view.o += (k.o - view.o) * ease;

    // Impulso por velocidad de scroll
    const dv = scrollY - lastScrollY;
    lastScrollY = scrollY;
    spin += dv * 0.0035;
    spin *= Math.pow(0.04, dt);
    spin = THREE.MathUtils.clamp(spin, -4, 4);

    pointer.x += (pointer.tx - pointer.x) * ease;
    pointer.y += (pointer.ty - pointer.y) * ease;

    const slow = reduce ? 0.15 : 1;

    // Cubo principal
    hero.position.set(view.x * halfW + pointer.x * 0.18, view.y * halfH - pointer.y * 0.12, 0);
    hero.scale.setScalar(view.s);
    hero.rotation.y = t * 0.22 * slow + view.p * Math.PI * 7 + spin + pointer.x * 0.35;
    hero.rotation.x = 0.5 + Math.sin(t * 0.4) * 0.12 * slow + view.p * 2.2 + pointer.y * 0.25;
    hero.rotation.z = Math.sin(t * 0.3) * 0.06 * slow;

    // Haz de luz: sigue al cubo y se atenúa al alejarse del hero
    beam.position.x = hero.position.x;
    beam.position.y = hero.position.y;
    beam.scale.setScalar(view.s);
    beam.material.opacity = 0.35 + 0.55 * Math.max(0, 1 - view.p * 5);
    beam.rotation.z = -0.14 + Math.sin(t * 0.35) * 0.05 * slow;

    // Cubos pequeños con paralaje
    const span = halfH * 2.7;
    for (const m of minis) {
      let y = m.fy * halfH * 1.35 + scrollY * m.par * halfH * 1.4;
      y = ((((y + span / 2) % span) + span) % span) - span / 2;
      const edge = 1 - Math.min(1, Math.abs(y) / (span / 2));
      const fade = Math.min(1, edge * 4);
      m.mesh.position.set(
        m.fx * halfW + Math.sin(t * 0.3 + m.phase) * 0.15 * slow + pointer.x * m.depth * 0.04,
        y + Math.cos(t * 0.35 + m.phase) * 0.12 * slow,
        m.depth
      );
      m.mesh.scale.setScalar(Math.max(0.0001, fade * (0.85 + view.o * 0.15)));
      m.mesh.rotation.x += m.spin.x * dt * slow + spin * 0.004;
      m.mesh.rotation.y += m.spin.y * dt * slow + spin * 0.006;
      m.mesh.rotation.z += m.spin.z * dt * slow;
    }

    canvas.style.opacity = view.o.toFixed(3);
    renderer.render(scene, camera);
  }
  tick();
}

function makeBeamTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, c.width, 0);
  const stops = ['#ff3b3b', '#ff9f43', '#ffe66d', '#43e6a0', '#3d9bff', '#9b6bff'];
  stops.forEach((col, i) => grad.addColorStop(i / (stops.length - 1), col));
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  // Máscara vertical y lateral para suavizar los bordes
  g.globalCompositeOperation = 'destination-in';
  const v = g.createLinearGradient(0, 0, 0, c.height);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(0.5, 'rgba(0,0,0,1)');
  v.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = v;
  g.fillRect(0, 0, c.width, c.height);
  const h = g.createLinearGradient(0, 0, c.width, 0);
  h.addColorStop(0, 'rgba(0,0,0,0)');
  h.addColorStop(0.15, 'rgba(0,0,0,1)');
  h.addColorStop(0.85, 'rgba(0,0,0,1)');
  h.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = h;
  g.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
