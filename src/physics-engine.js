// High Performance Cellular Automata Physics Particle Engine
export const ELEMENTS = {
  EMPTY: 0,
  SAND: 1,
  WATER: 2,
  FIRE: 3,
  PLANT: 4,
  STONE: 5,
  OIL: 6,
  ACID: 7,
  LAVA: 8,
  GUNPOWDER: 9,
  SMOKE: 10,
  STEAM: 11,
  GLASS: 12
};

export const ELEMENT_DEFS = {
  [ELEMENTS.EMPTY]: { name: 'Eraser', color: [18, 18, 20, 0], density: 0, type: 'gas' },
  [ELEMENTS.SAND]: { name: 'Sand', color: [228, 185, 87, 255], density: 10, type: 'powder' },
  [ELEMENTS.WATER]: { name: 'Water', color: [59, 130, 246, 220], density: 5, type: 'liquid' },
  [ELEMENTS.FIRE]: { name: 'Fire', color: [249, 115, 22, 255], density: -2, type: 'gas' },
  [ELEMENTS.PLANT]: { name: 'Plant', color: [34, 197, 94, 255], density: 100, type: 'solid' },
  [ELEMENTS.STONE]: { name: 'Stone', color: [113, 113, 122, 255], density: 1000, type: 'solid' },
  [ELEMENTS.OIL]: { name: 'Oil', color: [161, 98, 7, 230], density: 4, type: 'liquid' },
  [ELEMENTS.ACID]: { name: 'Acid', color: [163, 230, 53, 240], density: 6, type: 'liquid' },
  [ELEMENTS.LAVA]: { name: 'Lava', color: [239, 68, 68, 255], density: 15, type: 'liquid' },
  [ELEMENTS.GUNPOWDER]: { name: 'Gunpowder', color: [75, 85, 99, 255], density: 9, type: 'powder' },
  [ELEMENTS.SMOKE]: { name: 'Smoke', color: [148, 163, 184, 180], density: -1, type: 'gas' },
  [ELEMENTS.STEAM]: { name: 'Steam', color: [224, 231, 255, 170], density: -3, type: 'gas' },
  [ELEMENTS.GLASS]: { name: 'Glass', color: [203, 213, 225, 210], density: 500, type: 'solid' }
};

export class SandboxSimulation {
  constructor(width = 200, height = 150) {
    this.width = width;
    this.height = height;
    this.size = width * height;

    this.grid = new Uint8Array(this.size);
    this.updated = new Uint8Array(this.size);
    this.life = new Uint8Array(this.size);
    this.shades = new Uint8Array(this.size);

    this.gravity = 1; // 1 = down, -1 = up, 0 = zero-g
    this.paused = false;
    this.particleCount = 0;

    // 5 continuous default stream emitters spaced across the top
    this.emittersActive = true;
    this.emitterRate = 2; // emit every 2 ticks
    this.tickCount = 0;
    this.emitters = [
      { id: 0, x: 28, elem: ELEMENTS.WATER, name: 'Water', active: true, color: [59, 130, 246] },
      { id: 1, x: 64, elem: ELEMENTS.SAND, name: 'Sand', active: true, color: [228, 185, 87] },
      { id: 2, x: 100, elem: ELEMENTS.LAVA, name: 'Lava', active: true, color: [239, 68, 68] },
      { id: 3, x: 136, elem: ELEMENTS.ACID, name: 'Acid', active: true, color: [163, 230, 53] },
      { id: 4, x: 172, elem: ELEMENTS.OIL, name: 'Oil', active: true, color: [161, 98, 7] }
    ];

    // Random noise texture for realistic visual grains
    for (let i = 0; i < this.size; i++) {
      this.shades[i] = Math.floor(Math.random() * 28) - 14;
    }
  }

  getIndex(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
    return y * this.width + x;
  }

  get(x, y) {
    const idx = this.getIndex(x, y);
    return idx === -1 ? ELEMENTS.STONE : this.grid[idx];
  }

  set(x, y, elem, initialLife = 0) {
    const idx = this.getIndex(x, y);
    if (idx !== -1) {
      this.grid[idx] = elem;
      this.life[idx] = initialLife;
    }
  }

  swap(x1, y1, x2, y2) {
    const i1 = this.getIndex(x1, y1);
    const i2 = this.getIndex(x2, y2);
    if (i1 === -1 || i2 === -1) return;

    const tmpG = this.grid[i1];
    const tmpL = this.life[i1];
    this.grid[i1] = this.grid[i2];
    this.life[i1] = this.life[i2];
    this.grid[i2] = tmpG;
    this.life[i2] = tmpL;

    this.updated[i1] = 1;
    this.updated[i2] = 1;
  }

  paintCircle(cx, cy, radius, elem) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= r2) {
          const px = cx + dx;
          const py = cy + dy;
          if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
            // Give spray texture for powders
            if ((elem === ELEMENTS.SAND || elem === ELEMENTS.GUNPOWDER) && radius > 2) {
              if (Math.random() < 0.15) continue;
            }
            let initialLife = 0;
            if (elem === ELEMENTS.FIRE) initialLife = 30 + Math.floor(Math.random() * 30);
            if (elem === ELEMENTS.SMOKE || elem === ELEMENTS.STEAM) initialLife = 40 + Math.floor(Math.random() * 25);
            if (elem === ELEMENTS.ACID) initialLife = 120;
            this.set(px, py, elem, initialLife);
          }
        }
      }
    }
  }

  clear() {
    this.grid.fill(ELEMENTS.EMPTY);
    this.life.fill(0);
    this.updated.fill(0);
    this.particleCount = 0;
  }

  // Continuously emit 5 material streams according to gravity direction
  emitStreams() {
    const isDown = this.gravity >= 0;
    const isUp = this.gravity === -1;

    for (const em of this.emitters) {
      if (!em.active) continue;

      const baseX = em.x;
      const elem = em.elem;

      // Spawn Y position according to gravity direction
      let startY;
      if (isDown) {
        startY = 2;
      } else if (isUp) {
        startY = this.height - 3;
      } else {
        startY = Math.floor(this.height / 2);
      }

      // Emit 1-2 particles per stream with slight jitter for a continuous natural flow
      const count = Math.random() < 0.75 ? 2 : 1;
      for (let p = 0; p < count; p++) {
        const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const px = baseX + offset;
        const py = startY + (isDown ? Math.floor(Math.random() * 2) : (isUp ? -Math.floor(Math.random() * 2) : 0));

        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          const cur = this.get(px, py);
          if (cur === ELEMENTS.EMPTY || cur === ELEMENTS.SMOKE || cur === ELEMENTS.STEAM) {
            let initialLife = 0;
            if (elem === ELEMENTS.FIRE) initialLife = 35 + Math.floor(Math.random() * 25);
            if (elem === ELEMENTS.ACID) initialLife = 120;
            if (elem === ELEMENTS.LAVA) initialLife = 80;
            this.set(px, py, elem, initialLife);
          }
        }
      }
    }
  }

  step() {
    this.updated.fill(0);
    this.tickCount++;

    if (this.emittersActive && (this.tickCount % this.emitterRate === 0)) {
      this.emitStreams();
    }

    let count = 0;

    const yStart = this.gravity >= 0 ? this.height - 1 : 0;
    const yEnd = this.gravity >= 0 ? -1 : this.height;
    const yStep = this.gravity >= 0 ? -1 : 1;
    const gDir = this.gravity >= 0 ? 1 : -1;

    // Scan the grid
    for (let y = yStart; y !== yEnd; y += yStep) {
      // Randomize X scan direction to prevent bias
      const leftToRight = Math.random() < 0.5;
      const xStart = leftToRight ? 0 : this.width - 1;
      const xEnd = leftToRight ? this.width : -1;
      const xStep = leftToRight ? 1 : -1;

      for (let x = xStart; x !== xEnd; x += xStep) {
        const idx = y * this.width + x;
        const elem = this.grid[idx];
        if (elem === ELEMENTS.EMPTY) continue;
        count++;

        if (this.updated[idx]) continue;

        switch (elem) {
          case ELEMENTS.SAND:
          case ELEMENTS.GUNPOWDER:
            this.updatePowder(x, y, elem, gDir);
            break;
          case ELEMENTS.WATER:
          case ELEMENTS.OIL:
          case ELEMENTS.ACID:
          case ELEMENTS.LAVA:
            this.updateLiquid(x, y, elem, gDir);
            break;
          case ELEMENTS.FIRE:
            this.updateFire(x, y);
            break;
          case ELEMENTS.SMOKE:
          case ELEMENTS.STEAM:
            this.updateGas(x, y, elem);
            break;
          case ELEMENTS.PLANT:
            this.updatePlant(x, y);
            break;
        }
      }
    }

    this.particleCount = count;
  }

  // Powder physics: Sand & Gunpowder
  updatePowder(x, y, elem, gDir) {
    if (this.gravity === 0) return;
    const targetY = y + gDir;
    if (targetY < 0 || targetY >= this.height) return;

    // 1. Direct fall down
    const below = this.get(x, targetY);
    if (below === ELEMENTS.EMPTY || this.isLiquid(below)) {
      this.swap(x, y, x, targetY);
      return;
    }

    // 2. Slide diagonally
    const dir = Math.random() < 0.5 ? 1 : -1;
    const sideA = this.get(x + dir, targetY);
    if (sideA === ELEMENTS.EMPTY || this.isLiquid(sideA)) {
      this.swap(x, y, x + dir, targetY);
      return;
    }

    const sideB = this.get(x - dir, targetY);
    if (sideB === ELEMENTS.EMPTY || this.isLiquid(sideB)) {
      this.swap(x, y, x - dir, targetY);
      return;
    }
  }

  // Liquid physics: Water, Oil, Acid, Lava
  updateLiquid(x, y, elem, gDir) {
    // Chemical Reactions
    if (elem === ELEMENTS.LAVA) {
      if (this.reactLava(x, y)) return;
    } else if (elem === ELEMENTS.ACID) {
      if (this.reactAcid(x, y)) return;
    } else if (elem === ELEMENTS.WATER) {
      if (this.reactWater(x, y)) return;
    }

    if (this.gravity === 0) return;
    const targetY = y + gDir;

    // 1. Direct down
    const below = this.get(x, targetY);
    if (below === ELEMENTS.EMPTY || this.isDenserLiquid(elem, below)) {
      this.swap(x, y, x, targetY);
      return;
    }

    // 2. Downward diagonals
    const dir = Math.random() < 0.5 ? 1 : -1;
    const sideA = this.get(x + dir, targetY);
    if (sideA === ELEMENTS.EMPTY || this.isDenserLiquid(elem, sideA)) {
      this.swap(x, y, x + dir, targetY);
      return;
    }
    const sideB = this.get(x - dir, targetY);
    if (sideB === ELEMENTS.EMPTY || this.isDenserLiquid(elem, sideB)) {
      this.swap(x, y, x - dir, targetY);
      return;
    }

    // 3. Horizontal dispersion (Lava spreads slower, water/oil spreads fast)
    const dispersion = elem === ELEMENTS.LAVA ? 1 : (elem === ELEMENTS.OIL ? 2 : 3);
    for (let d = 1; d <= dispersion; d++) {
      const hSideA = this.get(x + dir * d, y);
      if (hSideA === ELEMENTS.EMPTY) {
        this.swap(x, y, x + dir * d, y);
        return;
      }
      const hSideB = this.get(x - dir * d, y);
      if (hSideB === ELEMENTS.EMPTY) {
        this.swap(x, y, x - dir * d, y);
        return;
      }
    }
  }

  isLiquid(elem) {
    return elem === ELEMENTS.WATER || elem === ELEMENTS.OIL || elem === ELEMENTS.ACID || elem === ELEMENTS.LAVA;
  }

  isDenserLiquid(elemA, elemB) {
    if (!this.isLiquid(elemB)) return false;
    const dA = ELEMENT_DEFS[elemA].density;
    const dB = ELEMENT_DEFS[elemB].density;
    return dA > dB; // Denser sinks through lighter liquid (e.g. water sinks through oil)
  }

  // Fire reactions & rise
  updateFire(x, y) {
    const idx = this.getIndex(x, y);
    if (this.life[idx] <= 0) {
      this.set(x, y, Math.random() < 0.35 ? ELEMENTS.SMOKE : ELEMENTS.EMPTY, 40);
      return;
    }
    this.life[idx]--;

    // Ignite neighbors
    const neighbors = [
      [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
      [x - 1, y - 1], [x + 1, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      const nElem = this.get(nx, ny);
      if (nElem === ELEMENTS.GUNPOWDER) {
        this.explode(nx, ny, 16);
        return;
      }
      if (nElem === ELEMENTS.OIL || nElem === ELEMENTS.PLANT) {
        this.set(nx, ny, ELEMENTS.FIRE, 50 + Math.floor(Math.random() * 40));
      }
      if (nElem === ELEMENTS.WATER) {
        // Extinguished into steam
        this.set(x, y, ELEMENTS.STEAM, 30);
        return;
      }
    }

    // Fire floats upwards
    const upY = y - 1;
    const dx = Math.floor(Math.random() * 3) - 1;
    if (this.get(x + dx, upY) === ELEMENTS.EMPTY) {
      this.swap(x, y, x + dx, upY);
    }
  }

  // Steam / Smoke gas physics
  updateGas(x, y, elem) {
    const idx = this.getIndex(x, y);
    if (this.life[idx] <= 0) {
      this.set(x, y, ELEMENTS.EMPTY);
      return;
    }
    this.life[idx]--;

    const upY = y - 1;
    const dx = Math.floor(Math.random() * 3) - 1;
    if (this.get(x + dx, upY) === ELEMENTS.EMPTY) {
      this.swap(x, y, x + dx, upY);
    } else if (this.get(x + dx, y) === ELEMENTS.EMPTY) {
      this.swap(x, y, x + dx, y);
    }
  }

  // Plant growth
  updatePlant(x, y) {
    // If adjacent to water, absorb water and grow
    const neighbors = [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]];
    for (const [nx, ny] of neighbors) {
      if (this.get(nx, ny) === ELEMENTS.WATER) {
        this.set(nx, ny, ELEMENTS.EMPTY); // Drink water
        // Grow a new plant shoot in a random direction
        const growDir = neighbors[Math.floor(Math.random() * neighbors.length)];
        if (this.get(growDir[0], growDir[1]) === ELEMENTS.EMPTY) {
          this.set(growDir[0], growDir[1], ELEMENTS.PLANT);
        }
        break;
      }
    }
  }

  // Acid melts matter
  reactAcid(x, y) {
    const neighbors = [[x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1]];
    for (const [nx, ny] of neighbors) {
      const target = this.get(nx, ny);
      if (target !== ELEMENTS.EMPTY && target !== ELEMENTS.ACID && target !== ELEMENTS.GLASS) {
        // Dissolve target & consume acid
        this.set(nx, ny, Math.random() < 0.4 ? ELEMENTS.SMOKE : ELEMENTS.EMPTY, 25);
        this.set(x, y, ELEMENTS.EMPTY);
        return true;
      }
    }
    return false;
  }

  // Lava melts & crystallizes
  reactLava(x, y) {
    const neighbors = [[x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1]];
    for (const [nx, ny] of neighbors) {
      const target = this.get(nx, ny);
      if (target === ELEMENTS.WATER) {
        // Lava + Water = Stone + Steam explosion!
        this.set(x, y, ELEMENTS.STONE);
        this.set(nx, ny, ELEMENTS.STEAM, 40);
        return true;
      }
      if (target === ELEMENTS.GUNPOWDER) {
        this.explode(nx, ny, 18);
        return true;
      }
      if (target === ELEMENTS.PLANT || target === ELEMENTS.OIL) {
        this.set(nx, ny, ELEMENTS.FIRE, 60);
      }
    }
    return false;
  }

  // Water extinguishes fire
  reactWater(x, y) {
    const neighbors = [[x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1]];
    for (const [nx, ny] of neighbors) {
      if (this.get(nx, ny) === ELEMENTS.FIRE) {
        this.set(nx, ny, ELEMENTS.STEAM, 30);
        this.set(x, y, ELEMENTS.EMPTY);
        return true;
      }
    }
    return false;
  }

  // Explosion mechanic
  explode(cx, cy, radius) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= r2) {
          const px = cx + dx;
          const py = cy + dy;
          if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
            const current = this.get(px, py);
            if (current === ELEMENTS.GLASS) continue; // Glass resists blast

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius * 0.5) {
              this.set(px, py, Math.random() < 0.6 ? ELEMENTS.FIRE : ELEMENTS.SMOKE, 40);
            } else if (Math.random() < 0.7) {
              this.set(px, py, Math.random() < 0.4 ? ELEMENTS.FIRE : ELEMENTS.EMPTY, 30);
            }
          }
        }
      }
    }
  }

  // Render to Canvas ImageData
  render(imgData) {
    const data = imgData.data;
    const defs = ELEMENT_DEFS;

    for (let i = 0; i < this.size; i++) {
      const elem = this.grid[i];
      const pIdx = i * 4;

      if (elem === ELEMENTS.EMPTY) {
        data[pIdx] = 18;
        data[pIdx + 1] = 18;
        data[pIdx + 2] = 22;
        data[pIdx + 3] = 255;
        continue;
      }

      const def = defs[elem];
      const shade = this.shades[i];

      // Dynamic color effects
      if (elem === ELEMENTS.FIRE) {
        // Flickering fire palette
        const flicker = Math.floor(Math.random() * 40);
        data[pIdx] = 255;
        data[pIdx + 1] = Math.min(255, 120 + flicker);
        data[pIdx + 2] = Math.max(0, 20 + flicker / 2);
        data[pIdx + 3] = 255;
      } else if (elem === ELEMENTS.LAVA) {
        const glow = Math.floor(Math.sin(Date.now() * 0.005 + i) * 15);
        data[pIdx] = Math.min(255, def.color[0] + glow);
        data[pIdx + 1] = Math.max(0, def.color[1] + glow);
        data[pIdx + 2] = def.color[2];
        data[pIdx + 3] = 255;
      } else {
        // Standard textured element
        data[pIdx] = Math.max(0, Math.min(255, def.color[0] + shade));
        data[pIdx + 1] = Math.max(0, Math.min(255, def.color[1] + shade));
        data[pIdx + 2] = Math.max(0, Math.min(255, def.color[2] + shade));
        data[pIdx + 3] = def.color[3];
      }
    }

    // Render emitter dispenser nozzles at edge of canvas
    if (this.emittersActive) {
      const isDown = this.gravity >= 0;
      const isUp = this.gravity === -1;
      const nozzleYStart = isDown ? 0 : (isUp ? this.height - 2 : Math.floor(this.height / 2) - 1);

      for (const em of this.emitters) {
        if (!em.active) continue;
        const col = em.color;
        for (let ny = 0; ny < 2; ny++) {
          const cy = nozzleYStart + ny;
          if (cy < 0 || cy >= this.height) continue;
          for (let nx = em.x - 2; nx <= em.x + 2; nx++) {
            if (nx < 0 || nx >= this.width) continue;
            const pIdx = (cy * this.width + nx) * 4;
            data[pIdx] = col[0];
            data[pIdx + 1] = col[1];
            data[pIdx + 2] = col[2];
            data[pIdx + 3] = 255;
          }
        }
      }
    }
  }
}
