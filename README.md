# 🧪 Falling Sand Game Simulator

> Play free online 2D physics particle sandbox simulator in browser. Real-time fluid dynamics, powders, chemical reactions, thermodynamics, and cellular automata at 60 FPS.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-success)](https://falling-sand-game.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Core Web Vitals](https://img.shields.io/badge/Lighthouse-100%2F100-brightgreen.svg)]()

---

## 🌟 Features

- **⚡ Instant Play on First Fold (0s Lag):** Built strictly following 哥飞's SEO Game playbook. Zero bloat, zero intrusive ads or loaders above the fold.
- **🔬 12+ Interactive Elements:**
  - ⏳ **Sand:** Granular powder physics with natural angle of repose.
  - 💧 **Water:** Fluid dynamics, cooling lava, putting out fire, nourishing plants.
  - 🔥 **Fire:** Upward thermal draft, burning flammables into smoke.
  - 🌋 **Lava:** High-viscosity molten rock, triggering steam explosions with water.
  - 🧪 **Acid:** Aggressively dissolves organic matter, stone, and sand with bubbling fizz.
  - 🌿 **Plant:** Climbs and sprouts vines upon absorbing water.
  - 🛢️ **Oil:** Floats on water, highly flammable petroleum slick.
  - 💣 **Gunpowder:** Volatile explosive powder triggering intense blast waves.
  - 🪨 **Stone:** Solid foundational walls and barriers.
  - 🪟 **Glass:** Acid-proof, explosion-resistant transparent laboratory container.
  - 💨 **Smoke & Steam:** Upward buoyancy gas physics.
  - 🧼 **Eraser:** Precision particle clearing brush.
- **🎯 4 Interactive Presets:**
  - 🌋 *Volcano Eruption:* Deep magma chamber with hidden gunpowder charge.
  - 🌊 *Hydro Dam:* Stone reservoir holding back water over fertile plant banks.
  - 🧪 *Acid Lab:* Glass test beakers eroding multi-layer chemical strata.
  - ⏳ *Hourglass:* Funneled glass vessel with flowing golden sand grains.
- **🔄 Physics Controls:** Normal gravity, Inverted gravity (upward rain!), Zero-G floating, Pause/Resume, Step 1 frame.
- **📸 Snapshot Camera:** One-click instant PNG screenshot export of your sand artwork.
- **🔊 Web Audio API Synthesizer:** Pure procedural sound effects for pouring, sizzling, and explosions with 0kb external audio file downloads.
- **🚀 Ultra Lightweight (~15KB gzipped):** 100/100 Core Web Vitals score, instant mobile and desktop performance.
- **🔍 Full On-Page SEO & Structured Data:** Semantic HTML5 (`h1`, `h2`, table, FAQ), OpenGraph social card, Schema.org `WebApplication`, `FAQPage`, and `BreadcrumbList` JSON-LD markup.

---

## 🛠️ Tech Stack

- **Framework:** Vanilla JavaScript / HTML5 Canvas / Modern CSS
- **Bundler:** Vite 6
- **Simulation:** Cellular Automata direct TypedArray pixel manipulation (`Uint8Array`)
- **Audio:** Native Web Audio API
- **Deployment:** Vercel Static Hosting

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/ilyaqudx/falling-sand-game.git
cd falling-sand-game

# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License

MIT &copy; 2026 [ilyaqudx](https://github.com/ilyaqudx)
