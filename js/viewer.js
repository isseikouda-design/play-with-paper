import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from "OrbitControls";

export function initViewer(modelPath) {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(
    35,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 1.2, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewer.appendChild(renderer.domElement);

 const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ページスクロールを優先するため、ホイールズームを無効化 */
controls.enableZoom = false;

  const light = new THREE.HemisphereLight(0xffffff, 0x888888, 3);
  scene.add(light);

  const loader = new GLTFLoader();

 loader.load(
  modelPath,
  (gltf) => {
    const loading = document.getElementById("viewerLoading");
    if (loading) loading.style.display = "none";

    const model = gltf.scene;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxSize = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(2 / maxSize);

    function animate() {
      requestAnimationFrame(animate);
      model.rotation.y += 0.003;
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  },
  (xhr) => {
    const loading = document.getElementById("viewerLoading");

    if (loading && xhr.total) {
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      loading.textContent = `${percent}%`;
    }
  }
);

  window.addEventListener("resize", () => {
    const width = viewer.clientWidth;
    const height = viewer.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}