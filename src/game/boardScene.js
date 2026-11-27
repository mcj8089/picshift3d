// ============================================================================
// 游戏场景 (Board Scene) —— 3x3 循环平移拼图
// ----------------------------------------------------------------------------
// 玩法 / 操作手感 / 判定逻辑与原作 1:1 对齐：
//  - 滑动某一行或某一列 → 整行/整列循环平移
//  - 胜利判定为拓扑判定（9 块回到原位）
//  - 进关先播「演示/打乱」序列（replaySeq），玩家随后还原
//  - 12 关，replay 速度逐关加快；通关解锁下一关并持久化
// 视觉为全新原创 3D 插画（Three.js 渲染），非原作换皮。
// ============================================================================

import { game } from '../core/game.js';
import { assets } from '../core/assetManager.js';
import { sound } from '../core/sound.js';
import { ArtRenderer } from '../art/renderer3d.js';
import { Board } from './board.js';
import { Button, drawCover, drawPanel, drawText, drawLabel } from '../ui/ui.js';
import { t } from '../core/i18n.js';
import { LEVELS } from '../../config/levels.js';
import { GAME_CONFIG } from '../../config/game.config.js';
import { PipySDK } from '../sdk/pipysdk.src.js';
import { gameState } from './state.js';
import { SWIPE } from '../core/input.js';
import { TWEEN } from '../core/tween.js';

const S = 420, B = 300;
const BOARD_X = (GAME_CONFIG.baseWidth - B) / 2; // 30
const BOARD_Y = 162;

export class BoardScene {
  constructor() {
    this.id = 'board';
    this.W = GAME_CONFIG.baseWidth;
    this.H = GAME_CONFIG.baseHeight;
    this.art = null;
    this.board = new Board();
    this.state = 'WAITING';
    this.isSwipeable = false;
    this._token = 0;
    this.replayIndex = 0;
    this.swipe = null;
    this._swipeStartInBoard = false;
    this._swipeStartX = 0; this._swipeStartY = 0;
    this.labelText = ''; this.labelAlpha = 0; this._labelTimer = 0; this._labelFading = false;
  }

  onEnter() {
    const idx = gameState.currentLevel;
    const level = LEVELS[idx];
    this.level = level;

    if (this.art) this.art.dispose();
    const img = assets.get(level.image);
    this.art = new ArtRenderer(img, { size: S, accent: '#7c5cff' });

    this.board.reset();
    this.state = 'WAITING';
    this.isSwipeable = false;
    this._token++;

    this.backBtn = new Button((this.W - 160) / 2, this.H - 84, 160, 50, t('back'), () => {
      sound.play('ui');
      game.showScene('select');
    }, { icon: 'back', accent: '#7c5cff', accent2: '#28e0c8', radius: 25 });

    window.__shareThumb = () => assets.get(level.image);
    window.__shareCard = assets.get('assets/images/ui_share_card.png');

    // 开场：展示关卡名 → 演示/打乱 → 可操作
    this.showTransient(`${t('levelPrefix')} ${idx + 1}`, 1400);
    this.startReplay();
  }

  onExit() {
    if (this.art) { this.art.dispose(); this.art = null; }
    this._token++;
  }

  // —— 演示 / 打乱序列 ——
  startReplay() {
    this.state = 'REPLAYING';
    this.backBtn.setDisabled(true);
    const token = this._token;
    const seq = this.level.replaySeq;
    const speed = this.level.replaySpeed;
    // 先停留展示关卡名，再开始打乱
    setTimeout(() => {
      if (token !== this._token) return;
      this.showTransient(t('mixing'), seq.length * speed + 200);
      this.replayIndex = 0;
      const step = () => {
        if (token !== this._token) return;
        if (this.replayIndex >= seq.length) { this.finishReplay(token); return; }
        const s = seq[this.replayIndex];
        this.animateMove(s.d, s.r, speed, () => {
          if (token !== this._token) return;
          this.replayIndex++;
          step();
        });
      };
      step();
    }, 1500);
  }

  finishReplay(token) {
    if (token !== this._token) return;
    this.isSwipeable = true;
    this.state = 'WAITING';
    this.backBtn.setDisabled(false);
  }

  // —— 通用移动动画（玩家滑动 / 演示共用）——
  // direction: SWIPE.UP/DOWN -> index 为列；LEFT/RIGHT -> index 为行
  animateMove(direction, index, duration, onComplete) {
    const cellB = B / 3;
    const obj = { v: 0 };
    const done = () => { onComplete && onComplete(); };
    if (direction === SWIPE.UP) {
      // 注意：这里绝不能 TWEEN.removeAll() —— 打乱序列是链式回调，
      // 上一步 onComplete 在 TWEEN.update 循环内触发本函数，
      // removeAll 会清空数组后让循环按旧索引把刚 start 的新 tween 误删，
      // 导致打乱链断死（isSwipeable 永远 false，棋盘无法拖动）。
      // 移动本身严格串行（上一步完成后才开始下一步），无叠加风险。
      this.board.dy[index] = 0;
      new TWEEN.Tween(obj).to({ v: -cellB }, duration).easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => { this.board.dy[index] = obj.v; })
        .onComplete(() => { this.board.moveUp(index); this.board.dy[index] = 0; done(); })
        .start();
    } else if (direction === SWIPE.DOWN) {
      const o = { v: 0 };
      new TWEEN.Tween(o).to({ v: cellB }, duration).easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => { this.board.dy[index] = o.v; })
        .onComplete(() => { this.board.moveDown(index); this.board.dy[index] = 0; done(); })
        .start();
    } else if (direction === SWIPE.LEFT) {
      const o = { v: 0 };
      new TWEEN.Tween(o).to({ v: -cellB }, duration).easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => { this.board.dx[index] = o.v; })
        .onComplete(() => { this.board.moveLeft(index); this.board.dx[index] = 0; done(); })
        .start();
    } else if (direction === SWIPE.RIGHT) {
      const o = { v: 0 };
      new TWEEN.Tween(o).to({ v: cellB }, duration).easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => { this.board.dx[index] = o.v; })
        .onComplete(() => { this.board.moveRight(index); this.board.dx[index] = 0; done(); })
        .start();
    }
  }

  // —— 玩家输入 ——
  onPointerDown(x, y) {
    this.backBtn.onDown(x, y);
    if (this.state === 'WAITING' && this.isSwipeable) {
      if (x >= BOARD_X && x <= BOARD_X + B && y >= BOARD_Y && y <= BOARD_Y + B) {
        this._swipeStartInBoard = true;
        this._swipeStartX = x; this._swipeStartY = y;
        this.swipe = { startX: x, startY: y, curX: x, curY: y, active: true };
      }
    }
  }
  onPointerMove(x, y) {
    if (this.swipe && this.swipe.active) { this.swipe.curX = x; this.swipe.curY = y; }
  }
  onPointerUp(x, y) {
    if (this.backBtn.onUp(x, y)) return;
    if (this.swipe && this.swipe.active) {
      this.swipe.active = false;
      const dx = x - this.swipe.startX, dy = y - this.swipe.startY;
      const len = Math.hypot(dx, dy);
      if (len >= 24 && this._swipeStartInBoard && this.state === 'WAITING' && this.isSwipeable) {
        let dir;
        if (Math.abs(dx) >= Math.abs(dy)) dir = dx > 0 ? SWIPE.RIGHT : SWIPE.LEFT;
        else dir = dy > 0 ? SWIPE.DOWN : SWIPE.UP;
        this._doPlayerMove(dir);
      }
      this.swipe = null;
    }
  }

  _doPlayerMove(dir) {
    const cellB = B / 3;
    const token = this._token;
    this.isSwipeable = false;
    this.state = 'PROCESSING';
    sound.play('swipe');
    if (dir === SWIPE.UP || dir === SWIPE.DOWN) {
      const col = Math.max(0, Math.min(2, Math.floor((this._swipeStartX - BOARD_X) / cellB)));
      this.animateMove(dir, col, GAME_CONFIG.swipeSpeed, () => this._afterMove(token));
    } else {
      const row = Math.max(0, Math.min(2, Math.floor((this._swipeStartY - BOARD_Y) / cellB)));
      this.animateMove(dir, row, GAME_CONFIG.swipeSpeed, () => this._afterMove(token));
    }
  }

  _afterMove(token) {
    if (token !== this._token) return;
    if (this.board.checkSolved()) { this._win(); return; }
    this.isSwipeable = true;
    this.state = 'WAITING';
  }

  _win() {
    const token = this._token;
    this.isSwipeable = false;
    this.state = 'WON';
    this.backBtn.setDisabled(true);
    sound.play('win');

    // 解锁下一关并持久化
    const next = gameState.currentLevel + 1;
    const newUnlocked = Math.min(LEVELS.length, gameState.currentLevel + 2);
    const cur = PipySDK.get('unlockedLevels', 1);
    PipySDK.set('unlockedLevels', Math.max(cur, newUnlocked));
    gameState.unlocked = Math.max(cur, newUnlocked);

    // 广告（若配置开启）
    PipySDK.showAd('interstitial').catch(() => {});

    const isLast = next >= LEVELS.length;
    if (isLast) {
      this.showTransient(t('congratulations'), 1600);
    } else {
      this.showTransient(t('super'), 1200);
    }
    setTimeout(() => {
      if (token !== this._token) return;
      if (isLast) { game.showScene('select'); }
      else { gameState.currentLevel = next; game.showScene('board'); }
    }, GAME_CONFIG.nextLevelDelay);
  }

  // —— 标签（开场 / 打乱 / 胜利）——
  showTransient(text, ms) {
    this.labelText = text;
    this.labelAlpha = 1;
    this._labelTimer = ms;
    this._labelFading = false;
  }

  updateLabel(dt) {
    if (this._labelTimer > 0) {
      this._labelTimer -= dt;
      if (this._labelTimer <= 0) this._labelFading = true;
    }
    if (this._labelFading) {
      this.labelAlpha = Math.max(0, this.labelAlpha - dt / 250);
      if (this.labelAlpha <= 0) { this._labelFading = false; this.labelText = ''; }
    }
  }

  update(ctx, dt) {
    // 背景
    drawCover(ctx, assets.get(this.level.bg), 0, 0, this.W, this.H);

    // 3D 棋盘画面
    this.art.renderFrame(dt);

    // 棋盘底板（玻璃质感面板）
    drawPanel(ctx, BOARD_X - 14, BOARD_Y - 14, B + 28, B + 28, {
      radius: 24, fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.28)',
    });
    // 拼图
    this.board.draw(ctx, this.art.getCanvas(), S, BOARD_X, BOARD_Y, B);
    // 棋盘内描边
    ctx.save();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.strokeRect(BOARD_X, BOARD_Y, B, B);
    ctx.restore();

    // 顶部信息
    drawText(ctx, `${t('levelPrefix')} ${gameState.currentLevel + 1} / ${LEVELS.length}`, this.W / 2, 120, {
      size: 22, weight: 800, color: '#fff',
    });

    // 标签
    this.updateLabel(dt);
    if (this.labelAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.labelAlpha;
      drawLabel(ctx, this.labelText, this.W / 2, BOARD_Y - 44, {
        fill: 'rgba(124,92,255,0.9)',
      });
      ctx.restore();
    }

    // 返回按钮
    this.backBtn.draw(ctx);
  }
}

export default BoardScene;
