// ============================================================================
// 社媒分享面板 (Share Panel)
// ----------------------------------------------------------------------------
// 与游戏风格统一的分享面板：昵称输入 + 9 个海外平台按钮，带展开/收起动画。
// 分享前弹出可选昵称输入框；点击平台后调用 PipySDK 分享并生成裂变文案：
//   "@{昵称} 邀请你来玩 XXX"
// 移动端走 navigator.share；桌面端打开平台分享 URL；TikTok/IG/YouTube 生成卡片+复制链接。
// 非纯文字列表：按钮带品牌色与图标，面板缩放淡入。
// ============================================================================

import { drawPanel, roundRectPath, drawText } from './ui.js';
import { t, shareCopy } from '../core/i18n.js';
import { GAME_CONFIG } from '../../config/game.config.js';

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', color: '#1877F2' },
  { key: 'x', label: 'X', color: '#0a0a0a' },
  { key: 'reddit', label: 'Reddit', color: '#FF4500' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { key: 'telegram', label: 'Telegram', color: '#229ED9' },
  { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { key: 'youtube', label: 'YouTube', color: '#FF0000' },
  { key: 'tiktok', label: 'TikTok', color: '#111111' },
  { key: 'instagram', label: 'Instagram', color: '#E1306C' },
];

export class SharePanel {
  constructor(baseW, baseH) {
    this.W = baseW; this.H = baseH;
    this.open = false;
    this.anim = 0; // 0 关 -> 1 开
    this.nick = '';
    this.active = false; // 昵称输入聚焦
    this.buttons = [];
    this.closeBtn = null;
    this._press = null;
    this._layout();
  }

  _layout() {
    const pw = 300, ph = 430;
    this.px = (this.W - pw) / 2;
    this.py = (this.H - ph) / 2;
    this.pw = pw; this.ph = ph;
    // 昵称框
    this.input = { x: this.px + 20, y: this.py + 60, w: pw - 40, h: 44 };
    // 平台按钮 3x3
    const gx = this.px + 20, gy = this.py + 130;
    const bw = (pw - 40 - 2 * 10) / 3, bh = 64, gap = 10;
    this.buttons = [];
    PLATFORMS.forEach((p, i) => {
      const r = Math.floor(i / 3), c = i % 3;
      this.buttons.push({
        ...p,
        x: gx + c * (bw + gap),
        y: gy + r * (bh + gap),
        w: bw, h: bh,
        state: 'normal',
      });
    });
    this.closeBtn = { x: this.px + pw - 40, y: this.py + 14, w: 28, h: 28 };
  }

  toggle() { this.open = !this.open; if (this.open) this.active = false; }
  setOpen(v) { this.open = v; }

  onPointerDown(x, y) {
    if (!this.open && this.anim < 0.5) return false;
    // 关闭按钮
    if (this._hit(this.closeBtn, x, y)) { this._press = 'close'; return true; }
    if (this._hit(this.input, x, y)) { this.active = true; return true; }
    else this.active = false;
    for (const b of this.buttons) {
      if (this._hit(b, x, y)) { b.state = 'pressed'; this._press = b.key; return true; }
    }
    return true; // 吞掉面板内点击
  }

  onPointerUp(x, y) {
    if (this._press === 'close') { this.open = false; this._press = null; return true; }
    if (this._press && this._press !== 'close') {
      const b = this.buttons.find((p) => p.key === this._press);
      if (b && this._hit(b, x, y)) this._share(b.key);
      this.buttons.forEach((p) => (p.state = 'normal'));
      this._press = null;
      return true;
    }
    return false;
  }

  _hit(r, x, y) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

  onKey(e) {
    if (!this.open || !this.active) return;
    if (e.key === 'Backspace') this.nick = this.nick.slice(0, -1);
    else if (e.key.length === 1 && this.nick.length < 16) this.nick += e.key;
  }

  _share(platform) {
    const copy = shareCopy();
    const nick = this.nick.trim() || 'Player';
    const invite = copy.invite(nick, GAME_CONFIG.title);
    const text = invite + ' ' + copy.text;
    const url = GAME_CONFIG.shareUrl;
    // 缩略图：当前关卡图或默认
    const thumb = (window.__shareThumb && window.__shareThumb()) || null;
    const card = window.__shareCard || null;
    if (window.PipySDK) {
      window.PipySDK.share(platform, { url, title: GAME_CONFIG.title, text, nick, thumbImage: thumb, cardImage: card });
      window.PipySDK.track('share_panel', { platform, nick });
    }
    this.open = false;
  }

  update(dt) {
    const target = this.open ? 1 : 0;
    this.anim += (target - this.anim) * Math.min(1, dt / 180);
    if (!this.open && this.anim < 0.01) this.anim = 0;
  }

  draw(ctx) {
    if (this.anim <= 0.01 && !this.open) return;
    const a = this.anim;
    ctx.save();
    // 背景遮罩
    ctx.globalAlpha = 0.55 * a;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.globalAlpha = a;
    // 面板缩放
    const cx = this.px + this.pw / 2, cy = this.py + this.ph / 2;
    const s = 0.9 + 0.1 * a;
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);

    drawPanel(ctx, this.px, this.py, this.pw, this.ph, {
      radius: 22, fill: 'rgba(36,28,72,0.96)', stroke: 'rgba(255,255,255,0.25)',
    });
    drawText(ctx, t('share'), cx, this.py + 34, { size: 22, weight: 800, color: '#fff' });
    // 关闭按钮
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '700 22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('×', this.closeBtn.x + 14, this.closeBtn.y + 14);

    // 昵称输入
    roundRectPath(ctx, this.input.x, this.input.y, this.input.w, this.input.h, 12);
    ctx.fillStyle = this.active ? 'rgba(124,92,255,0.25)' : 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
    drawText(ctx, this.nick || t('nicknamePlaceholder'), this.input.x + 14, this.input.y + this.input.h / 2, {
      size: 16, align: 'left', color: this.nick ? '#fff' : 'rgba(255,255,255,0.5)',
    });

    // 平台按钮
    for (const b of this.buttons) {
      const pressed = b.state === 'pressed';
      roundRectPath(ctx, b.x, b.y, b.w, b.h, 14);
      ctx.fillStyle = pressed ? b.color : b.color;
      ctx.fill();
      ctx.globalAlpha = 0.18;
      roundRectPath(ctx, b.x + 2, b.y + 2, b.w - 4, b.h * 0.5, 12); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.globalAlpha = a;
      drawText(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, { size: 13, weight: 700, color: '#fff' });
    }
    ctx.restore();
  }
}

export default SharePanel;
