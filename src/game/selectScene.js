// ============================================================================
// 选关场景 (Select Scene)
// ----------------------------------------------------------------------------
// 12 关网格，已解锁可进入，未解锁置灰。从存档读取解锁进度。
// ============================================================================

import { game } from '../core/game.js';
import { assets } from '../core/assetManager.js';
import { sound } from '../core/sound.js';
import { drawCover, drawPanel, drawText } from '../ui/ui.js';
import { Button } from '../ui/ui.js';
import { t } from '../core/i18n.js';
import { LEVELS } from '../../config/levels.js';
import { GAME_CONFIG } from '../../config/game.config.js';
import { PipySDK } from '../sdk/pipysdk.src.js';
import { gameState } from './state.js';

export class SelectScene {
  constructor() {
    this.id = 'select';
    this.W = GAME_CONFIG.baseWidth;
    this.H = GAME_CONFIG.baseHeight;
    this.levelBtns = [];
    this.backBtn = null;
  }

  onEnter() {
    const bg = assets.get('assets/images/ui_bg_select.png');
    this.bg = bg;

    const unlocked = PipySDK.get('unlockedLevels', 1);
    gameState.unlocked = unlocked;

    const cols = 3, rows = 4;
    const cell = 88, gap = 12;
    const totalW = cols * cell + (cols - 1) * gap;
    const startX = (this.W - totalW) / 2;
    const startY = 96;
    this.levelBtns = [];
    for (let i = 0; i < LEVELS.length; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      const x = startX + c * (cell + gap);
      const y = startY + r * (cell + gap);
      const isUnlocked = i < unlocked;
      const btn = new Button(x, y, cell, cell, '', () => {
        if (!isUnlocked) { sound.play('lock'); return; }
        sound.play('ui');
        gameState.currentLevel = i;
        game.showScene('board');
      }, { radius: 18 });
      btn.levelIndex = i;
      btn.isUnlocked = isUnlocked;
      this.levelBtns.push(btn);
    }

    this.backBtn = new Button((this.W - 160) / 2, this.H - 70, 160, 46, t('back'), () => {
      sound.play('ui');
      game.showScene('start');
    }, { icon: 'back', accent: '#7c5cff', accent2: '#28e0c8', radius: 23 });
  }

  onExit() {}

  onPointerDown(x, y) {
    for (const b of this.levelBtns) b.onDown(x, y);
    this.backBtn.onDown(x, y);
  }
  onPointerUp(x, y) {
    for (const b of this.levelBtns) b.onUp(x, y);
    this.backBtn.onUp(x, y);
  }

  update(ctx, dt) {
    drawCover(ctx, this.bg, 0, 0, this.W, this.H);
    drawText(ctx, t('selectTitle'), this.W / 2, 52, { size: 26, weight: 800, color: '#fff' });

    for (const b of this.levelBtns) {
      const { x, y, w, h } = b;
      const r = 18;
      ctx.save();
      if (b.isUnlocked) {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#28e0c8'); g.addColorStop(1, '#7c5cff');
        roundRect(ctx, x, y, w, h, r); ctx.fillStyle = g; ctx.fill();
        ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        roundRect(ctx, x, y, w, h, r); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
      } else {
        roundRect(ctx, x, y, w, h, r);
        ctx.fillStyle = 'rgba(40,36,60,0.7)'; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke();
      }
      // 顶部高光
      const hg = ctx.createLinearGradient(x, y, x, y + h * 0.5);
      hg.addColorStop(0, 'rgba(255,255,255,0.28)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
      roundRect(ctx, x + 2, y + 2, w - 4, h * 0.5 - 2, r - 2); ctx.fillStyle = hg; ctx.fill();

      if (b.isUnlocked) {
        drawText(ctx, String(b.levelIndex + 1), x + w / 2, y + h / 2 + 1, { size: 28, weight: 800, color: '#fff' });
      } else {
        drawLock(ctx, x + w / 2, y + h / 2);
      }
      ctx.restore();
    }

    this.backBtn.draw(ctx);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawLock(ctx, cx, cy) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  // 锁体
  roundRect(ctx, cx - 11, cy - 2, 22, 18, 4); ctx.fill();
  // 锁梁
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 8, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
}

export default SelectScene;
