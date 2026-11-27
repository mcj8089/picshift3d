// ============================================================================
// 游戏主控制器 (Game)
// ----------------------------------------------------------------------------
// 负责画布、自适应缩放、主循环、场景管理与指针分发。
// 逻辑坐标系固定为 baseWidth x baseHeight，按窗口等比居中缩放。
// ============================================================================

import { TWEEN } from './tween.js';
import { sound } from './sound.js';

class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.baseWidth = 360;
    this.baseHeight = 640;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = 1;
    this.scenes = {};
    this.current = null;
    this._last = 0;
    this._running = false;
    this._firstInteract = false;
  }

  init(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.baseWidth = cfg.baseWidth;
    this.baseHeight = cfg.baseHeight;
    this._onResize = this._layout.bind(this);
    window.addEventListener('resize', this._onResize);
    this._bindPointer();
    this._layout();
    return this;
  }

  registerScene(id, scene) {
    this.scenes[id] = scene;
  }

  showScene(id) {
    if (this.current && this.current.onExit) this.current.onExit();
    this.current = this.scenes[id] || null;
    TWEEN.removeAll();
    if (this.current && this.current.onEnter) this.current.onEnter();
  }

  _layout() {
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.floor(cssW * this.dpr);
    this.canvas.height = Math.floor(cssH * this.dpr);
    this.scale = Math.min(cssW / this.baseWidth, cssH / this.baseHeight);
    this.offsetX = (cssW - this.baseWidth * this.scale) / 2;
    this.offsetY = (cssH - this.baseHeight * this.scale) / 2;
  }

  _toLogical(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left - this.offsetX) / this.scale;
    const y = (clientY - rect.top - this.offsetY) / this.scale;
    return { x, y };
  }

  _bindPointer() {
    const c = this.canvas;
    const down = (e) => {
      this._ensureAudio();
      const p = this._evtPoint(e);
      this._down = p;
      if (this.current && this.current.onPointerDown) this.current.onPointerDown(p.x, p.y);
    };
    const move = (e) => {
      const p = this._evtPoint(e);
      if (this.current && this.current.onPointerMove) this.current.onPointerMove(p.x, p.y);
    };
    const up = (e) => {
      const p = this._evtPoint(e);
      if (this.current && this.current.onPointerUp) this.current.onPointerUp(p.x, p.y);
    };
    c.addEventListener('pointerdown', (e) => { e.preventDefault(); down(e); });
    c.addEventListener('pointermove', (e) => { e.preventDefault(); move(e); });
    window.addEventListener('pointerup', (e) => { up(e); });
    c.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _evtPoint(e) {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return this._toLogical(t.clientX, t.clientY);
  }

  _ensureAudio() {
    if (this._firstInteract) return;
    this._firstInteract = true;
    sound.init();
    sound.startBGM();
  }

  run() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    const loop = (now) => {
      const dt = Math.min(50, now - this._last);
      this._last = now;
      TWEEN.update(dt);
      this._render(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _render(dt) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 居中缩放的逻辑坐标系
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);
    // 裁剪到逻辑区域
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.baseWidth, this.baseHeight);
    ctx.clip();
    if (this.current && this.current.update) this.current.update(ctx, dt);
    ctx.restore();
  }
}

export const game = new Game();
export default game;
