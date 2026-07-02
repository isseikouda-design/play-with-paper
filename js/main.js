import { objects } from "./objects.js";
import { initViewer } from "./viewer.js";

const objectGrid = document.getElementById("objectGrid");
const homeCopy = document.getElementById("homeCopy");

const floatingItems = [];

const itemSettings = [
  { width: 720, tapRadius: 0.34, mask: "./images/sample_image_1_mask.webp", area: { xMin: 0.00, xMax: 0.30, yMin: 0.05, yMax: 0.45 }, vx: 0.22, vy: 0.14, rotationSpeed: 0.12 },
  { width: 560, tapRadius: 0.32, mask: "./images/sample_image_2_mask.webp", area: { xMin: 0.30, xMax: 0.65, yMin: 0.05, yMax: 0.45 }, vx: -0.18, vy: 0.16, rotationSpeed: -0.16 },
  { width: 460, tapRadius: 0.34, mask: "./images/sample_image_3_mask.webp", area: { xMin: 0.65, xMax: 0.95, yMin: 0.05, yMax: 0.45 }, vx: 0.14, vy: -0.18, rotationSpeed: 0.18 },

  { width: 550, tapRadius: 0.33, mask: "./images/sample_image_4_mask.webp", area: { xMin: 0.00, xMax: 0.30, yMin: 0.48, yMax: 0.88 }, vx: 0.16, vy: -0.12, rotationSpeed: -0.28 },
  { width: 620, tapRadius: 0.36, mask: "./images/sample_image_5_mask.webp", area: { xMin: 0.30, xMax: 0.65, yMin: 0.48, yMax: 0.88 }, vx: -0.15, vy: -0.15, rotationSpeed: 0.14 },
  { width: 680, tapRadius: 0.27, mask: "./images/sample_image_6_mask.webp", area: { xMin: 0.65, xMax: 0.95, yMin: 0.48, yMax: 0.88 }, vx: -0.2, vy: 0.12, rotationSpeed: 0.30 }
];
const zIndexes = [1, 2, 3, 4, 5, 6];

for (let i = zIndexes.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [zIndexes[i], zIndexes[j]] = [zIndexes[j], zIndexes[i]];
}
const maskCache = {};

function loadMask(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      maskCache[src] = {
        canvas,
        ctx,
        width: canvas.width,
        height: canvas.height
      };

      resolve();
    };
  });
}

function hitTestMask(item, clientX, clientY) {
  const mask = maskCache[item.mask];
  if (!mask) return false;

  const centerX = item.x + item.width / 2;
  const centerY = item.y + item.width / 2;

  const dx = clientX - centerX;
  const dy = clientY - centerY;

  const rad = (-item.rotation * Math.PI) / 180;

  const localX =
    dx * Math.cos(rad) - dy * Math.sin(rad) + item.width / 2;

  const localY =
    dx * Math.sin(rad) + dy * Math.cos(rad) + item.width / 2;

  if (
    localX < 0 ||
    localY < 0 ||
    localX > item.width ||
    localY > item.width
  ) {
    return false;
  }

  const maskX = Math.floor((localX / item.width) * mask.width);
  const maskY = Math.floor((localY / item.width) * mask.height);

  const pixel = mask.ctx.getImageData(maskX, maskY, 1, 1).data;

  const brightness = pixel[0] + pixel[1] + pixel[2];

  return brightness > 380;
}

if (objectGrid && homeCopy) {
  Object.keys(objects).slice(0, 6).forEach((id, index) => {
    const object = objects[id];
    const setting = itemSettings[index];

    const item = document.createElement("a");
    item.className = `gallery-item item-${index + 1}`;
    item.href = `./object.html?id=${id}`;
    item.dataset.href = `./object.html?id=${id}`;
    item.style.width = `${setting.width}px`;
    item.style.zIndex = zIndexes[index];
  

    item.innerHTML = `
      <img src="${object.thumbnail}" alt="${object.title}">
    `;

    objectGrid.appendChild(item);

    const area = setting.area;

const x =
  window.innerWidth * area.xMin +
  Math.random() * (window.innerWidth * (area.xMax - area.xMin) - setting.width);

const y =
  window.innerHeight * area.yMin +
  Math.random() * (window.innerHeight * (area.yMax - area.yMin) - setting.width);
floatingItems.push({
  element: item,

  x: x,
  y: y,

  vx: setting.vx + (Math.random() - 0.5) * 0.08,
  vy: setting.vy + (Math.random() - 0.5) * 0.08,

  width: setting.width,

  rotation: Math.random() * 360,
  rotationSpeed: setting.rotationSpeed,

  href: `./object.html?id=${id}`,
  tapRadius: setting.tapRadius,
  zIndex: Number(item.style.zIndex) || 2,
  mask: setting.mask || null
});

item.style.transform = `
  translate(${x}px, ${y}px)
  rotate(${floatingItems[floatingItems.length - 1].rotation}deg)
`;
  });

  const movingGuide = document.getElementById("movingGuide");

if (movingGuide) {
  floatingItems.push({
    element: movingGuide,
    x: window.innerWidth * 0.35,
    y: window.innerHeight * 0.45,
    vx: 0.18,
    vy: -0.13,
    width: 320,
    rotation: 0,
    rotationSpeed: 0.08
  });
  movingGuide.style.transform = `
  translate(${window.innerWidth * 0.35}px, ${window.innerHeight * 0.45}px)
  rotate(0deg)
`;

}

document.querySelector(".poster-home").addEventListener("click", (e) => {

  const isSp = window.matchMedia("(max-width: 768px)").matches;

  if (!objectGrid.classList.contains("is-visible")) {
    objectGrid.classList.add("is-visible");
    homeCopy.classList.add("is-clicked");
    return;
  }

  if (!isSp) return;

  const candidates = floatingItems
    .filter((item) => item.href)
  .filter((item) => {
  if (!item.mask) return false;
  return hitTestMask(item, e.clientX, e.clientY);
});

  if (!candidates.length) return;

  candidates.sort((a, b) => b.zIndex - a.zIndex);

  window.location.href = candidates[0].href;
});

  const masks = itemSettings
  .map((setting) => setting.mask)
  .filter(Boolean);

if (sessionStorage.getItem("openGallery") === "1") {
  objectGrid.classList.add("is-visible");
  homeCopy.classList.add("is-clicked");

  sessionStorage.removeItem("openGallery");
  document.body.classList.remove("is-returning-gallery");
}


Promise.all(masks.map(loadMask))
  .catch(() => {})
  .finally(() => {
    animateFloatingItems();
  });
}

function animateFloatingItems() {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  floatingItems.forEach((item) => {
    item.x += item.vx;
    item.y += item.vy;
  item.rotation += item.rotationSpeed;

    const size = item.width;

    if (item.x <= 0 || item.x + size >= screenW) {
      item.vx *= -1;
    }

    if (item.y <= 0 || item.y + size >= screenH) {
      item.vy *= -1;
    }

  item.element.style.transform = `
  translate(${item.x}px, ${item.y}px)
  rotate(${item.rotation}deg)
`;
  });

  requestAnimationFrame(animateFloatingItems);
}

const viewer = document.getElementById("viewer");

if (viewer) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || Object.keys(objects)[0];
  const object = objects[id];

  document.title = object.title;

  document.getElementById("objectTitle").textContent = object.title;
  const templateImages = document.getElementById("templateImages");

templateImages.innerHTML = "";

object.templateImages.forEach((src) => {
  const wrapper = document.createElement("div");
  wrapper.className = "template-wrapper";

  const placeholder = document.createElement("div");
  placeholder.className = "template-placeholder";
  placeholder.textContent = "Loading";

  const img = document.createElement("img");
  img.src = src;
  img.alt = "Papercraft Template";
  img.className = "template-image";
  img.loading = "lazy";

  img.onload = () => {
    placeholder.style.display = "none";
    img.classList.add("is-loaded");
  };

  wrapper.appendChild(placeholder);
  wrapper.appendChild(img);
  templateImages.appendChild(wrapper);
});
  document.getElementById("objectDescription").textContent = object.description;
  document.getElementById("objectMaterial").textContent = object.material;
  document.getElementById("objectSize").textContent = object.size;
  document.getElementById("downloadButton").href = object.templateFile;

  initViewer(object.model, object.viewer);
}
const backButton = document.getElementById("backButton");

if (backButton) {
  backButton.addEventListener("click", () => {
    sessionStorage.setItem("openGallery", "1");
  });
}