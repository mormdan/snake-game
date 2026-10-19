# create a web based snake game that can be played with arrows

> create a web based snake game that can be played with arrows

Project: snake-game

# Snake game (arrow keys)

This is a browser Snake game built from plain HTML, CSS and JavaScript. It has no libraries and no build step. You can open `index.html` directly from disk or deploy it to GitHub Pages using the workflow below.

**Not tested in a browser.** I checked the main parts by reading the code: key handling, the input queue, the game loop, collision checks, food placement, the start/pause/game-over states and canvas sizing. The behaviours that still need a real browser check are listed at the end.

## Features
- **Arrow keys** move the snake. WASD also works. The page doesn't scroll when you press an arrow.
- **Space** pauses and resumes. **Enter** starts a game, or restarts after game over.
- **Reverse-turn guard:** pressing the opposite direction is ignored, so the snake can't turn back into itself and die. A 2-key input queue keeps quick turns, like Up then Left, within one move.
- **Speed:** a fixed-step loop keeps the speed the same on 60 Hz and 144 Hz screens. The game gets faster every 5 foods.
- **Best score** is saved in `localStorage`.
- **Win state:** you win if the snake fills the whole board.
- **Optional wrap-around walls:** off by default.
- **Auto-pause** when you switch to another tab.
- **Touch screens:** swipe on the board or use the on-screen arrow pad, which only shows on touch devices.

File: index.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Snake</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="app">
    <header class="top">
      <h1>Snake</h1>
      <div class="hud" aria-live="polite">
        <div class="stat"><span class="label">Score</span><span id="score">0</span></div>
        <div class="stat"><span class="label">Best</span><span id="best">0</span></div>
        <div class="stat"><span class="label">Level</span><span id="level">1</span></div>
      </div>
    </header>

    <div class="board-wrap" id="boardWrap">
      <canvas id="board" role="img" aria-label="Snake game board"></canvas>
      <div class="overlay" id="overlay" aria-live="polite">
        <h2 id="overlayTitle">Snake</h2>
        <p id="overlayText">Press an arrow key to start</p>
      </div>
    </div>

    <div class="dpad" aria-label="On-screen controls">
      <button type="button" class="up" data-dir="up" tabindex="-1" aria-label="Up">▲</button>
      <button type="button" class="left" data-dir="left" tabindex="-1" aria-label="Left">◀</button>
      <button type="button" class="right" data-dir="right" tabindex="-1" aria-label="Right">▶</button>
      <button type="button" class="down" data-dir="down" tabindex="-1" aria-label="Down">▼</button>
    </div>

    <div class="options">
      <label><input type="checkbox" id="wrap"> Wrap-around walls</label>
    </div>

    <p class="help">
      <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> move ·
      <kbd>Space</kbd> pause ·
      <kbd>Enter</kbd> start / restart
    </p>
  </main>

  <script src="game.js"></script>
</body>
</html>
```

File: style.css
```css
*,
*::before,
*::after { box-sizing: border-box; }

:root {
  --bg: #0f1420;
  --panel: #171e2e;
  --text: #e6ebf5;
  --muted: #8a96ad;
  --accent: #4ade80;
}

html, body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.top {
  width: min(92vw, 62vh, 520px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

h1 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--accent);
  letter-spacing: 0.05em;
}

.hud { display: flex; gap: 14px; }

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 1.1rem;
}

.stat .label {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
}

.board-wrap {
  position: relative;
  width: min(92vw, 62vh, 520px);
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  background: var(--panel);
}

#board {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none; /* swipes control the snake instead of scrolling */
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  background: rgba(10, 14, 22, 0.72);
  cursor: pointer;
  user-select: none;
}

.overlay.hidden { display: none; }
.overlay h2 { margin: 0 0 8px; font-size: 2rem; color: var(--accent); }
.overlay p  { margin: 0; color: var(--text); line-height: 1.5; }

.dpad {
  display: none; /* shown on touch devices only */
  grid-template-columns: repeat(3, 64px);
  grid-template-rows: repeat(3, 64px);
  gap: 6px;
}

.dpad button {
  border: none;
  border-radius: 12px;
  background: var(--panel);
  color: var(--text);
  font-size: 1.4rem;
  touch-action: manipulation;
}

.dpad button:active { background: #24304a; }
.dpad .up    { grid-column: 2; grid-row: 1; }
.dpad .left  { grid-column: 1; grid-row: 2; }
.dpad .right { grid-column: 3; grid-row: 2; }
.dpad .down  { grid-column: 2; grid-row: 3; }

@media (pointer: coarse) {
  .dpad { display: grid; }
}

.options { color: var(--muted); font-size: 0.95rem; }
.options input { accent-color: var(--accent); }

.help { margin: 0; color: var(--muted); font-size: 0.9rem; text-align: center; }

kbd {
  display: inline-block;
  min-width: 1.6em;
  padding: 1px 6px;
  margin: 0 1px;
  border: 1px solid #2b3550;
  border-bottom-width: 2px;
  border-radius: 5px;
  background: var(--panel);
  color: var(--text);
  font-family: inherit;
  font-size: 0.8rem;
  text-align: center;
}
```

File: game.js
```js
(() => {
  'use strict';

  // ---- Config ----
  const COLS = 20;
  const ROWS = 20;
  const BASE_STEP_MS = 140;     // starting time per move
  const MIN_STEP_MS = 60;       // fastest speed
  const STEP_DECREASE_MS = 8;   // speed-up per level
  const FOODS_PER_LEVEL = 5;
  const POINTS_PER_FOOD = 10;
  const MAX_QUEUE = 2;
  const SWIPE_MIN_PX = 24;
  const HS_KEY = 'snake.highScore';

  const DIRS = {
    up:    { x: 0,  y: -1 },
    down:  { x: 0,  y: 1 },
    left:  { x: -1, y: 0 },
    right: { x: 1,  y: 0 },
  };

  const KEY_TO_DIR = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right',
  };

  // ---- DOM ----
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const boardWrap = document.getElementById('boardWrap');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const levelEl = document.getElementById('level');
  const wrapEl = document.getElementById('wrap');

  // ---- State ----
  let snake = [];          // head first: [{x,y}, ...]
  let dir = 'right';
  let queue = [];          // buffered direction changes
  let food = null;
  let score = 0;
  let eaten = 0;
  let state = 'ready';     // 'ready' | 'playing' | 'paused' | 'over' | 'won'
  let acc = 0;
  let lastTime = null;
  let cssSize = 400;
  let best = loadBest();

  // ---- Storage ----
  function loadBest() {
    try { return Number(localStorage.getItem(HS_KEY)) || 0; } catch { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem(HS_KEY, String(v)); } catch { /* storage blocked: ignore */ }
  }

  // ---- Helpers ----
  const isOpposite = (a, b) =>
    DIRS[a].x === -DIRS[b].x && DIRS[a].y === -DIRS[b].y;

  const level = () => Math.floor(eaten / FOODS_PER_LEVEL) + 1;

  const stepMs = () =>
    Math.max(MIN_STEP_MS, BASE_STEP_MS - (level() - 1) * STEP_DECREASE_MS);

  function spawnFood() {
    const occupied = new Set(snake.map(c => c.x + ',' + c.y));
    const free = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!occupied.has(x + ',' + y)) free.push({ x, y });
      }
    }
    if (free.length === 0) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  function updateHud() {
    scoreEl.textContent = score;
    bestEl.textContent = best;
    levelEl.textContent = level();
  }

  function showOverlay(title, text) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  // ---- Game flow ----
  function reset() {
    const cy = Math.floor(ROWS / 2);
    snake = [{ x: 5, y: cy }, { x: 4, y: cy }, { x: 3, y: cy }];
    dir = 'right';
    queue = [];
    score = 0;
    eaten = 0;
    acc = 0;
    food = spawnFood();
    state = 'ready';
    updateHud();
    showOverlay('Snake', 'Press an arrow key (or tap) to start');
  }

  function start() {
    state = 'playing';
    acc = 0;
    hideOverlay();
  }

  function restart() {
    reset();
    start();
  }

  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    showOverlay('Paused', 'Press Space (or tap) to resume');
  }

  function resume() {
    if (state !== 'paused') return;
    state = 'playing';
    acc = 0;
    hideOverlay();
  }

  function togglePause() {
    if (state === 'playing') pause();
    else if (state === 'paused') resume();
    else if (state === 'ready') start();
    else restart(); // over / won
  }

  function gameOver() {
    state = 'over';
    showOverlay('Game over', `Score ${score} — press Enter (or tap) to play again`);
  }

  function win() {
    state = 'won';
    showOverlay('You win! 🎉', `The board is full. Score ${score} — press Enter to play again`);
  }

  function enqueue(name) {
    if (state === 'over' || state === 'won') return;
    if (state === 'ready') start();
    else if (state === 'paused') resume();

    // Compare against the last *queued* direction, so two fast presses can't reverse.
    const last = queue.length ? queue[queue.length - 1] : dir;
    if (name === last || isOpposite(name, last)) return;
    if (queue.length < MAX_QUEUE) queue.push(name);
  }

  function tick() {
    if (queue.length) dir = queue.shift();
    const d = DIRS[dir];
    let nx = snake[0].x + d.x;
    let ny = snake[0].y + d.y;

    if (wrapEl.checked) {
      nx = (nx + COLS) % COLS;
      ny = (ny + ROWS) % ROWS;
    } else if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      gameOver();
      return;
    }

    const eats = food !== null && nx === food.x && ny === food.y;
    // The tail moves away this tick unless the snake grows, so it is safe to enter.
    const checkLen = eats ? snake.length : snake.length - 1;
    for (let i = 0; i < checkLen; i++) {
      if (snake[i].x === nx && snake[i].y === ny) {
        gameOver();
        return;
      }
    }

    snake.unshift({ x: nx, y: ny });

    if (eats) {
      eaten++;
      score += POINTS_PER_FOOD;
      if (score > best) { best = score; saveBest(best); }
      food = spawnFood();
      updateHud();
      if (food === null) win();
    } else {
      snake.pop();
    }
  }

  // ---- Rendering ----
  function resize() {
    const rect = canvas.getBoundingClientRect();
    cssSize = Math.max(1, Math.round(rect.width));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function fillRoundRect(x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
  }

  function draw() {
    const cell = cssSize / COLS;

    // Background
    ctx.fillStyle = '#171e2e';
    ctx.fillRect(0, 0, cssSize, cssSize);

    // Checkerboard grid
    ctx.fillStyle = '#1b2336';
    for (let y = 0; y < ROWS; y++) {
      for (let x = (y % 2); x < COLS; x += 2) {
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    // Food
    if (food) {
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc((food.x + 0.5) * cell, (food.y + 0.5) * cell, cell * 0.36, 0, Math.PI * 2);
      ctx.fill();
    }

    // Snake (draw tail first so the head is on top)
    const pad = Math.max(1, cell * 0.08);
    for (let i = snake.length - 1; i >= 0; i--) {
      const c = snake[i];
      ctx.fillStyle = i === 0 ? '#86efac' : (i % 2 ? '#22c55e' : '#16a34a');
      fillRoundRect(c.x * cell + pad, c.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.25);
    }

    // Eyes on the head
    if (snake.length) {
      const h = snake[0];
      const d = DIRS[dir];
      const perp = { x: -d.y, y: d.x };
      const cx = (h.x + 0.5) * cell + d.x * cell * 0.18;
      const cy = (h.y + 0.5) * cell + d.y * cell * 0.18;
      ctx.fillStyle = '#0f1420';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + perp.x * cell * 0.2 * s, cy + perp.y * cell * 0.2 * s, cell * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ---- Main loop (fixed time step) ----
  function frame(t) {
    if (lastTime === null) lastTime = t;
    let dt = t - lastTime;
    lastTime = t;
    if (dt > 250) dt = 250; // avoid catch-up bursts after a stall

    if (state === 'playing') {
      acc += dt;
      let step = stepMs();
      while (acc >= step && state === 'playing') {
        tick();
        acc -= step;
        step = stepMs();
      }
    }
    draw();
    requestAnimationFrame(frame);
  }

  // ---- Input: keyboard ----
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const name = KEY_TO_DIR[e.key];
    if (name) {
      e.preventDefault(); // stop arrows from scrolling the page
      enqueue(name);
      return;
    }
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) togglePause();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (state === 'over' || state === 'won') restart();
      else if (state === 'ready') start();
      else if (state === 'paused') resume();
    }
  });

  // ---- Input: overlay click / tap ----
  overlay.addEventListener('click', () => {
    if (state === 'ready') start();
    else if (state === 'paused') resume();
    else if (state === 'over' || state === 'won') restart();
  });

  // ---- Input: swipe ----
  let touchStart = null;
  boardWrap.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  boardWrap.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return; // a tap: the overlay click handles it
    if (Math.abs(dx) > Math.abs(dy)) enqueue(dx > 0 ? 'right' : 'left');
    else enqueue(dy > 0 ? 'down' : 'up');
  });

  // ---- Input: on-screen D-pad ----
  document.querySelectorAll('.dpad button').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // keep focus off the button so Space/Enter don't press it
      enqueue(btn.dataset.dir);
    });
  });

  // Return focus to the page so Space doesn't toggle the checkbox mid-game.
  wrapEl.addEventListener('change', () => wrapEl.blur());

  // Auto-pause when the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });

  // ---- Resize ----
  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  // ---- Boot ----
  reset();
  resize();
  requestAnimationFrame(frame);
})();
```

File: .github/workflows/pages.yml
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

File: README.md
````markdown
# Snake

Classic Snake in the browser: HTML5 canvas and plain JavaScript, with no dependencies and no build step.

## Play

- **Arrow keys** (or WASD): move
- **Space**: pause / resume
- **Enter**: start / restart after game over
- **Touch screens**: swipe on the board, or use the on-screen arrow pad

You lose if you hit a wall or your own body. Each food is worth 10 points, and the snake speeds up every 5 foods. Turn on **Wrap-around walls** to go through the edges. Fill the whole 20×20 board to win. Your best score is saved in your browser's `localStorage`.

## Run locally

Open `index.html` in a browser. It works from `file://` because the game uses no modules and makes no network requests.

To serve it instead, for example:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy

`.github/workflows/pages.yml` deploys the repo root to GitHub Pages on every push to `main`.
One-time setup: in the repo, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page layout: score display, canvas, overlay, D-pad, options |
| `style.css` | Dark theme, responsive square board, touch D-pad |
| `game.js` | Game logic, fixed-step loop, input handling, rendering |

## How it works

- **Grid model:** the snake is an array of `{x, y}` cells with the head first.
- **Input queue:** holds up to 2 buffered turns. Each turn is checked against the last *queued* direction, so fast presses can't make a 180° turn.
- **Collision:** the tail cell counts as free, because the tail moves away in the same tick. The exception is when the snake is eating and growing.
- **Food:** picked at random from empty cells only. If no cell is empty, you win.
- **Loop:** `requestAnimationFrame` with a time accumulator. Moves happen every `stepMs`, whatever the display's refresh rate.
````

## What I checked by reading the code
- **Arrow keys:** the listener is on `window`, so the game gets key presses without clicking first. `preventDefault()` stops the page from scrolling, and keys pressed with Ctrl, Alt or Cmd are ignored.
- **Reversing:** at the start, pressing ← while the snake faces → is ignored and the snake keeps going right. Pressing ↑ then ← quickly within one move becomes two queued turns. Pressing ↑ then ↓ quickly drops the ↓.
- **Moving into the tail's cell:** this is allowed, because the tail moves away in the same tick. It counts as a collision when the snake is eating, since the tail stays put.
- **Focus problems:** the D-pad buttons call `preventDefault` on `pointerdown` and have `tabindex="-1"`, so Space and Enter never press a focused button. The checkbox drops focus after you change it.
- **Window resize:** the canvas is redrawn for the new size and the screen's pixel density, so it stays sharp.

## Still needs a browser test
1. How the controls feel at each level, and whether the speed numbers (140 ms down to 60 ms) feel right.
2. Swipes on a real phone. `touch-action: none` should stop the page from scrolling while you swipe on the board.
3. Whether `@media (pointer: coarse)` shows the D-pad on your devices. Some touchscreen laptops count as "fine" pointers and won't show it.
4. Rounded snake segments use `ctx.roundRect`. Older browsers fall back to square segments.
5. The win screen. To test it quickly, temporarily set `COLS`/`ROWS` to `4` in `game.js`.
6. **Embedded pages:** if the game runs inside an iframe or preview, click it once so it gets keyboard focus.
7. **GitHub Actions versions:** I'm fairly sure the action versions in `pages.yml` (`checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`) are current, but I haven't checked them today. Update them if the workflow warns about deprecated versions.
