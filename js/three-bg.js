/**
 * Vote-X 3D WebGL Torus Knot & Vault Mesh
 * Uses Three.js with dynamic specular lighting and interactive rotation
 */

function initThreeBackground(containerId = 'threejs-container-ANIMATION_5') {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 500;
  const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Group for multi-layered rotation
  const group = new THREE.Group();
  scene.add(group);

  // Primary Torus Knot
  const knotGeo = new THREE.TorusKnotGeometry(1.3, 0.38, 128, 24, 2, 3);
  const knotMat = new THREE.MeshPhongMaterial({
    color: 0x7C3AED,
    emissive: 0x25005a,
    shininess: 90,
    specular: 0xd2bbff,
    transparent: true,
    opacity: 0.92
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  group.add(knot);

  // Outer Glowing Ring
  const ringGeo = new THREE.TorusGeometry(2.3, 0.04, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x9333ea,
    transparent: true,
    opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  // Second Ring
  const ring2Geo = new THREE.TorusGeometry(2.6, 0.03, 16, 100);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.3
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  // Lighting
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight1.position.set(5, 7, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.9);
  dirLight2.position.set(-5, -5, -3);
  scene.add(dirLight2);

  scene.add(new THREE.AmbientLight(0x221133));

  camera.position.z = 4.8;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    const halfX = window.innerWidth / 2;
    const halfY = window.innerHeight / 2;
    mouseX = (e.clientX - halfX) / halfX;
    mouseY = (e.clientY - halfY) / halfY;
  });

  let animFrameId;
  function animate() {
    animFrameId = requestAnimationFrame(animate);
    
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    knot.rotation.x += 0.008;
    knot.rotation.y += 0.012;
    ring.rotation.z += 0.005;
    ring2.rotation.x += 0.006;

    group.rotation.y = targetX * 0.6;
    group.rotation.x = targetY * 0.4;

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!container) return;
    const w = container.clientWidth || 500;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', handleResize);
  animate();

  return () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', handleResize);
  };
}

window.initThreeBackground = initThreeBackground;
