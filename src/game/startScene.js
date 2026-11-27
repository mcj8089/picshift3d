// ============================================================================
// 开始场景 (Start Scene)
// ----------------------------------------------------------------------------
// 展示游戏标题、3D 旋转英雄插画（原创），提供「开始 / 分享」按钮与分享面板。
// 操作：点击 PLAY 进入选关；点击 SHARE 弹出社媒分享面板（含昵称输入）。
// ============================================================================

import { game } from '../core/game.js';
import { assets } from '../core/assetManager.js';
import { sound } from '../core/sound.js';
import { ArtRenderer } from '../art/renderer3d.js';
import { Button, drawCover, drawPanel, drawText, drawLabel } from '../ui/ui.js';
import { SharePanel } from '../ui/sharePanel.js';
import { t } from '../core/i18n.js';
import { LEVELS } from '../../config/levels.js';
import { GAME_CONFIG } from '../../config/game.config.js';
import { PipySDK } from '../sdk/pipysdk.src.js';

export class StartScene {
  constructor() {
    this.id = 'start';
    this.W = GAME_CONFIG.baseWidth;
    this.H = GAME_CONFIG.baseHeight;
    this.art = null;
    this.sharePanel = null;
    this._t = 0;
  }

  onEnter() {
    if (!this.art) {
      const img = assets.get(LEVELS[0].image);
      this.art = new ArtRenderer(img, { size: 260, accent: '#7c5cff' });
    }
    // 分享面板
    if (!this.sharePanel) this.sharePanel = new SharePanel(this.W, this.H);
    game.sharePanel = this.sharePanel;

    this.playBtn = new Button((this.W - 210) / 2, 430, 210, 58, t('play'), () => {
      sound.play('ui');
      game.showScene('select');
    }, { icon: 'play', accent: '#7c5cff', accent2: '#28e0c8', radius: 29 });

    this.shareBtn = new Button((this.W - 210) / 2, 502, 210, 50, t('share'), () => {
      sound.play('ui');
      this.sharePanel.toggle();
    }, { icon: 'share', accent: '#28e0c8', accent2: '#7c5cff', radius: 25 });

    // 提供给分享面板缩略图 / 卡片底图
    window.__shareThumb = () => assets.get(LEVELS[0].image);
    window.__shareCard = assets.get('assets/images/ui_share_card.png');

    sound.startBGM();
  }

  onExit() {
    if (this.art) { this.art.dispose(); this.art = null; }
    game.sharePanel = null;
  }

  onPointerDown(x, y) {
    if (this.sharePanel && this.sharePanel.open) { this.sharePanel.onPointerDown(x, y); return; }
    this.playBtn.onDown(x, y);
    this.shareBtn.onDown(x, y);
  }
  onPointerMove(x, y) {}
  onPointerUp(x, y) {
    if (this.sharePanel && this.sharePanel.open) { this.sharePanel.onPointerUp(x, y); return; }
    this.playBtn.onUp(x, y);
    this.shareBtn.onUp(x, y);
  }

  update(ctx, dt) {
    this._t += dt;
    const bg = assets.get('assets/images/ui_bg_start.png');
    drawCover(ctx, bg, 0, 0, this.W, this.H);

    // 3D 英雄插画
    this.art.renderFrame(dt);
    const hx = (this.W - 220) / 2, hy = 150, hw = 220;
    drawPanel(ctx, hx - 14, hy - 14, hw + 28, hw + 28, { radius: 28, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.25)' });
    ctx.save();
    ctx.shadowColor = 'rgba(124,92,255,0.5)'; ctx.shadowBlur = 30;
    ctx.drawImage(this.art.getCanvas(), hx, hy, hw, hw);
    ctx.restore();

    // 标题
    drawText(ctx, t('title'), this.W / 2, 96, { size: 34, weight: 800, color: '#fff' });
    drawText(ctx, t('subtitle'), this.W / 2, 126, { size: 15, weight: 500, color: 'rgba(255,255,255,0.7)' });

    // 按钮
    this.playBtn.draw(ctx);
    this.shareBtn.draw(ctx);

    // 分享面板
    this.sharePanel.update(dt);
    this.sharePanel.draw(ctx);

    PipySDK.track && void 0; // 埋点由事件触发，这里无需每帧上报
  }
}

export default StartScene;
