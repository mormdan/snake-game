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
