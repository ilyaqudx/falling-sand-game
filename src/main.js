import './style.css';
import { SandboxSimulation, ELEMENTS, ELEMENT_DEFS } from './physics-engine.js';
import { PRESETS } from './presets.js';
import { audio } from './audio.js';

// Simulation Configuration
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 150;

const sim = new SandboxSimulation(CANVAS_WIDTH, CANVAS_HEIGHT);

// DOM Elements
const canvas = document.getElementById('sandbox-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const cursorEl = document.getElementById('canvas-cursor');
const containerEl = document.getElementById('canvas-container');

const fpsCounterEl = document.getElementById('fps-counter');
const particleCounterEl = document.getElementById('particle-counter');

const btnPauseEl = document.getElementById('btn-pause');
const pauseIconEl = document.getElementById('pause-icon');
const pauseTextEl = document.getElementById('pause-text');
const btnStepEl = document.getElementById('btn-step');
const btnGravityEl = document.getElementById('btn-gravity');
const gravityIconEl = document.getElementById('gravity-icon');
const gravityTextEl = document.getElementById('gravity-text');
const btnClearEl = document.getElementById('btn-clear');
const selectPresetEl = document.getElementById('select-preset');

const btnSnapshotEl = document.getElementById('btn-snapshot');
const btnSoundEl = document.getElementById('btn-sound');
const soundIconEl = document.getElementById('sound-icon');
const btnHelpEl = document.getElementById('btn-help');
const modalHelpEl = document.getElementById('modal-help');

const elementsGridEl = document.getElementById('elements-grid');
const brushBtns = document.querySelectorAll('.brush-btn');

// App State
let currentElement = ELEMENTS.SAND;
let brushSize = 6;
let isPointerDown = false;
let lastPointerPos = null;

const imgData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

// Element metadata and icons
const ELEMENT_ICONS = {
  [ELEMENTS.EMPTY]: '🧼',
  [ELEMENTS.SAND]: '⏳',
  [ELEMENTS.WATER]: '💧',
  [ELEMENTS.FIRE]: '🔥',
  [ELEMENTS.PLANT]: '🌿',
  [ELEMENTS.STONE]: '🪨',
  [ELEMENTS.OIL]: '🛢️',
  [ELEMENTS.ACID]: '🧪',
  [ELEMENTS.LAVA]: '🌋',
  [ELEMENTS.GUNPOWDER]: '💣',
  [ELEMENTS.SMOKE]: '💨',
  [ELEMENTS.GLASS]: '🪟'
};

// Populate Element Selector Grid
function initElementPalette() {
  elementsGridEl.innerHTML = '';
  const order = [
    ELEMENTS.SAND, ELEMENTS.WATER, ELEMENTS.FIRE, ELEMENTS.LAVA,
    ELEMENTS.PLANT, ELEMENTS.ACID, ELEMENTS.OIL, ELEMENTS.GUNPOWDER,
    ELEMENTS.STONE, ELEMENTS.GLASS, ELEMENTS.SMOKE, ELEMENTS.EMPTY
  ];

  for (const elemId of order) {
    const def = ELEMENT_DEFS[elemId];
    const chip = document.createElement('button');
    chip.className = 'elem-chip';
    chip.dataset.elem = elemId;
    if (elemId === currentElement) chip.classList.add('active');

    const icon = ELEMENT_ICONS[elemId] || '✨';
    const color = `rgb(${def.color[0]}, ${def.color[1]}, ${def.color[2]})`;

    chip.innerHTML = `
      <span class="elem-dot" style="background-color: ${color}"></span>
      <span class="elem-icon">${icon}</span>
      <span class="elem-name">${def.name}</span>
    `;

    chip.addEventListener('click', () => {
      currentElement = elemId;
      document.querySelectorAll('.elem-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });

    elementsGridEl.appendChild(chip);
  }
}

// Brush Size Controls
brushBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    brushSize = parseInt(btn.dataset.size, 10);
    brushBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateCursorSize();
  });
});

function updateCursorSize() {
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / CANVAS_WIDTH;
  const pixelRadius = brushSize * scale;
  cursorEl.style.width = `${pixelRadius * 2}px`;
  cursorEl.style.height = `${pixelRadius * 2}px`;
}

// Canvas Coordinate Mapping
function getCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  const x = Math.floor((clientX - rect.left) * scaleX);
  const y = Math.floor((clientY - rect.top) * scaleY);
  return { x, y };
}

// Bresenham interpolation to avoid gaps on fast mouse drag
function paintLine(x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;

  while (true) {
    sim.paintCircle(cx, cy, brushSize, currentElement);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

// Pointer Events (Mouse & Touch)
containerEl.addEventListener('pointerdown', (e) => {
  isPointerDown = true;
  const pos = getCanvasCoords(e.clientX, e.clientY);
  sim.paintCircle(pos.x, pos.y, brushSize, currentElement);
  lastPointerPos = pos;
  audio.playPour();
  cursorEl.style.display = 'block';
  updateCursorPos(e.clientX, e.clientY);
});

window.addEventListener('pointerup', () => {
  isPointerDown = false;
  lastPointerPos = null;
});

containerEl.addEventListener('pointermove', (e) => {
  updateCursorPos(e.clientX, e.clientY);
  cursorEl.style.display = 'block';

  if (!isPointerDown) return;
  const pos = getCanvasCoords(e.clientX, e.clientY);
  if (lastPointerPos) {
    paintLine(lastPointerPos.x, lastPointerPos.y, pos.x, pos.y);
  } else {
    sim.paintCircle(pos.x, pos.y, brushSize, currentElement);
  }
  lastPointerPos = pos;
  audio.playPour();
});

containerEl.addEventListener('pointerleave', () => {
  cursorEl.style.display = 'none';
});

function updateCursorPos(clientX, clientY) {
  const rect = containerEl.getBoundingClientRect();
  cursorEl.style.left = `${clientX - rect.left}px`;
  cursorEl.style.top = `${clientY - rect.top}px`;
}

// Simulation Controls Listeners
btnPauseEl.addEventListener('click', togglePause);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
    e.preventDefault();
    togglePause();
  }
});

function togglePause() {
  sim.paused = !sim.paused;
  pauseIconEl.textContent = sim.paused ? '▶️' : '⏸️';
  pauseTextEl.textContent = sim.paused ? 'Resume' : 'Pause';
}

btnStepEl.addEventListener('click', () => {
  sim.paused = true;
  pauseIconEl.textContent = '▶️';
  pauseTextEl.textContent = 'Resume';
  sim.step();
});

// Gravity Cycle: Down (1) -> Up (-1) -> Zero (0)
btnGravityEl.addEventListener('click', () => {
  if (sim.gravity === 1) {
    sim.gravity = -1;
    gravityIconEl.textContent = '⬆️';
    gravityTextEl.textContent = 'Inverted';
  } else if (sim.gravity === -1) {
    sim.gravity = 0;
    gravityIconEl.textContent = '⏹️';
    gravityTextEl.textContent = 'Zero-G';
  } else {
    sim.gravity = 1;
    gravityIconEl.textContent = '⬇️';
    gravityTextEl.textContent = 'Normal';
  }
});

btnClearEl.addEventListener('click', () => {
  sim.clear();
});

// Presets Loader
selectPresetEl.addEventListener('change', (e) => {
  const key = e.target.value;
  if (key && PRESETS[key]) {
    PRESETS[key].load(sim);
  }
});

// Snapshot Camera (PNG Download)
btnSnapshotEl.addEventListener('click', () => {
  // Render high-res export
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = CANVAS_WIDTH * 4;
  exportCanvas.height = CANVAS_HEIGHT * 4;
  const expCtx = exportCanvas.getContext('2d');
  expCtx.imageSmoothingEnabled = false;
  expCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

  const link = document.createElement('a');
  link.download = `falling-sand-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
});

// Sound Toggle
btnSoundEl.addEventListener('click', () => {
  const isMuted = audio.toggleMute();
  soundIconEl.textContent = isMuted ? '🔇' : '🔊';
});
soundIconEl.textContent = audio.isMuted() ? '🔇' : '🔊';

// Help Modal
btnHelpEl.addEventListener('click', () => modalHelpEl.hidden = false);
document.querySelectorAll('.modal-close-btn').forEach(btn => {
  btn.addEventListener('click', () => modalHelpEl.hidden = true);
});
modalHelpEl.addEventListener('click', (e) => {
  if (e.target === modalHelpEl) modalHelpEl.hidden = true;
});

// Performance & Animation Loop
let lastTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = lastTime;

function loop(currentTime) {
  frameCount++;
  if (currentTime - lastFpsUpdate >= 500) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
    fpsCounterEl.textContent = fps;
    frameCount = 0;
    lastFpsUpdate = currentTime;
  }

  if (!sim.paused) {
    sim.step();
  }

  sim.render(imgData);
  ctx.putImageData(imgData, 0, 0);

  particleCounterEl.textContent = sim.particleCount.toLocaleString();

  requestAnimationFrame(loop);
}

// Window resize listener to keep cursor scaled
window.addEventListener('resize', updateCursorSize);

// Start with Volcano preset
initElementPalette();
updateCursorSize();
PRESETS.volcano.load(sim);
requestAnimationFrame(loop);
