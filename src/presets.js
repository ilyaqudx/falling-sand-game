import { ELEMENTS } from './physics-engine.js';

export const PRESETS = {
  streams: {
    name: '🔀 5 Flowing Streams (Default)',
    desc: '5 continuous flowing materials deflected by angled stone slides and funnels',
    load(sim) {
      sim.clear();
      sim.emittersActive = true;
      const W = sim.width;
      const H = sim.height;

      // 1. Deflector ramp beneath Stream 1 (Water, x=28)
      // Slanted stone slide guiding water rightwards toward Sand stream
      for (let i = 0; i < 32; i++) {
        const x = 18 + i;
        const y = 32 + Math.floor(i * 0.7);
        sim.set(x, y, ELEMENTS.STONE);
        sim.set(x, y + 1, ELEMENTS.STONE);
      }

      // 2. Deflector ramp beneath Stream 2 (Sand, x=64)
      // Angled slide catching sand & deflecting left into a chute
      for (let i = 0; i < 28; i++) {
        const x = 76 - i;
        const y = 62 + Math.floor(i * 0.6);
        sim.set(x, y, ELEMENTS.STONE);
        sim.set(x, y + 1, ELEMENTS.STONE);
      }

      // 3. V-Funnel beneath Stream 3 (Lava, x=100)
      // Funnel guiding molten lava into a narrow cascade
      for (let i = 0; i < 18; i++) {
        sim.set(90 + i, 36 + i, ELEMENTS.STONE);
        sim.set(90 + i, 37 + i, ELEMENTS.STONE);
        sim.set(110 - i, 36 + i, ELEMENTS.STONE);
        sim.set(110 - i, 37 + i, ELEMENTS.STONE);
      }

      // 4. Glass ramp beneath Stream 4 (Acid, x=136)
      // Smooth transparent ramp redirecting acid towards a stone block to show chemical corrosion!
      for (let i = 0; i < 26; i++) {
        const x = 124 + i;
        const y = 48 + Math.floor(i * 0.6);
        sim.set(x, y, ELEMENTS.GLASS);
        sim.set(x, y + 1, ELEMENTS.GLASS);
      }
      // Target stone block to demonstrate dissolution
      for (let y = 70; y < 86; y++) {
        for (let x = 142; x < 158; x++) {
          sim.set(x, y, ELEMENTS.STONE);
        }
      }

      // 5. Plant terrace beneath Stream 5 (Oil, x=172)
      // Catch oil on a plant shelf
      for (let x = 158; x < 188; x++) {
        sim.set(x, 58, ELEMENTS.PLANT);
        sim.set(x, 59, ELEMENTS.PLANT);
      }
      sim.set(188, 56, ELEMENTS.PLANT);
      sim.set(188, 57, ELEMENTS.PLANT);
    }
  },

  volcano: {
    name: '🌋 Volcano Eruption',
    desc: 'Lava chamber trapped beneath stone peak with gunpowder fuse',
    load(sim) {
      sim.clear();
      const W = sim.width;
      const H = sim.height;

      // Draw volcano cone
      for (let y = H - 60; y < H; y++) {
        const leftWall = Math.floor((y - (H - 60)) * 0.7) + 30;
        const rightWall = W - leftWall;
        for (let x = 0; x < leftWall; x++) sim.set(x, y, ELEMENTS.STONE);
        for (let x = rightWall; x < W; x++) sim.set(x, y, ELEMENTS.STONE);
      }

      // Fill magma chamber
      for (let y = H - 35; y < H - 5; y++) {
        for (let x = 60; x < W - 60; x++) {
          sim.set(x, y, Math.random() < 0.85 ? ELEMENTS.LAVA : ELEMENTS.FIRE, 60);
        }
      }

      // Gunpowder charge
      for (let y = H - 45; y < H - 38; y++) {
        for (let x = 75; x < W - 75; x++) {
          sim.set(x, y, ELEMENTS.GUNPOWDER);
        }
      }

      // Stone cap on top with oil layer
      for (let y = H - 58; y < H - 52; y++) {
        for (let x = 80; x < W - 80; x++) {
          sim.set(x, y, ELEMENTS.STONE);
        }
      }
      for (let y = H - 65; y < H - 59; y++) {
        for (let x = 85; x < W - 85; x++) {
          sim.set(x, y, ELEMENTS.OIL);
        }
      }
    }
  },

  dam: {
    name: '🌊 Hydro Dam & River',
    desc: 'Deep water reservoir contained behind a stone dam',
    load(sim) {
      sim.clear();
      const W = sim.width;
      const H = sim.height;

      // Mountain left side & Dam wall
      for (let y = 30; y < H; y++) {
        for (let x = 0; x < 25; x++) sim.set(x, y, ELEMENTS.STONE);
      }
      // Dam wall in center
      for (let y = 50; y < H; y++) {
        for (let x = 95; x < 105; x++) sim.set(x, y, ELEMENTS.STONE);
      }
      // Ground on right side
      for (let y = H - 25; y < H; y++) {
        for (let x = 105; x < W; x++) sim.set(x, y, ELEMENTS.STONE);
      }
      // Plant banks
      for (let y = H - 28; y < H - 25; y++) {
        for (let x = 115; x < W - 15; x++) sim.set(x, y, ELEMENTS.PLANT);
      }

      // Fill reservoir with water
      for (let y = 55; y < H - 5; y++) {
        for (let x = 27; x < 93; x++) {
          sim.set(x, y, ELEMENTS.WATER);
        }
      }
    }
  },

  acidLab: {
    name: '🧪 Acid Reaction Lab',
    desc: 'Glass test beakers dissolving stacked organic and mineral layers',
    load(sim) {
      sim.clear();
      const W = sim.width;
      const H = sim.height;

      // Three glass beakers
      const beakers = [
        { x: 25, w: 40 },
        { x: 80, w: 40 },
        { x: 135, w: 40 }
      ];

      for (const b of beakers) {
        // Left wall, right wall, bottom wall
        for (let y = 30; y < H - 15; y++) {
          sim.set(b.x, y, ELEMENTS.GLASS);
          sim.set(b.x + b.w, y, ELEMENTS.GLASS);
        }
        for (let x = b.x; x <= b.x + b.w; x++) {
          sim.set(x, H - 15, ELEMENTS.GLASS);
        }

        // Fill beaker 1 with Sand + Wood
        if (b.x === 25) {
          for (let y = H - 35; y < H - 15; y++) {
            for (let x = b.x + 2; x < b.x + b.w - 1; x++) {
              sim.set(x, y, ELEMENTS.SAND);
            }
          }
          for (let y = H - 55; y < H - 35; y++) {
            for (let x = b.x + 2; x < b.x + b.w - 1; x++) {
              sim.set(x, y, ELEMENTS.PLANT);
            }
          }
        }
        // Beaker 2 with Stone + Oil
        if (b.x === 80) {
          for (let y = H - 35; y < H - 15; y++) {
            for (let x = b.x + 2; x < b.x + b.w - 1; x++) {
              sim.set(x, y, ELEMENTS.STONE);
            }
          }
          for (let y = H - 55; y < H - 35; y++) {
            for (let x = b.x + 2; x < b.x + b.w - 1; x++) {
              sim.set(x, y, ELEMENTS.OIL);
            }
          }
        }
        // Beaker 3 with Gunpowder
        if (b.x === 135) {
          for (let y = H - 45; y < H - 15; y++) {
            for (let x = b.x + 2; x < b.x + b.w - 1; x++) {
              sim.set(x, y, ELEMENTS.GUNPOWDER);
            }
          }
        }
      }

      // Acid dripping droppers above
      for (let x = 40; x < 50; x++) {
        for (let y = 10; y < 18; y++) sim.set(x, y, ELEMENTS.ACID, 120);
      }
      for (let x = 95; x < 105; x++) {
        for (let y = 10; y < 18; y++) sim.set(x, y, ELEMENTS.ACID, 120);
      }
    }
  },

  hourglass: {
    name: '⏳ Classic Hourglass',
    desc: 'Funneled glass vessel with golden sand grains',
    load(sim) {
      sim.clear();
      const W = sim.width;
      const H = sim.height;
      const midX = Math.floor(W / 2);
      const midY = Math.floor(H / 2);

      // Draw hourglass shape
      for (let y = 20; y <= H - 20; y++) {
        const distFromCenter = Math.abs(y - midY);
        const radius = Math.floor((distFromCenter / (midY - 20)) * 45) + 3;

        sim.set(midX - radius, y, ELEMENTS.GLASS);
        sim.set(midX + radius, y, ELEMENTS.GLASS);
      }
      for (let x = midX - 48; x <= midX + 48; x++) {
        sim.set(x, 20, ELEMENTS.GLASS);
        sim.set(x, H - 20, ELEMENTS.GLASS);
      }

      // Fill top bulb with Sand
      for (let y = 25; y < midY - 6; y++) {
        const distFromCenter = Math.abs(y - midY);
        const radius = Math.floor((distFromCenter / (midY - 20)) * 45);
        for (let x = midX - radius + 2; x < midX + radius - 1; x++) {
          sim.set(x, y, ELEMENTS.SAND);
        }
      }
    }
  }
};
