// ============================================================================
// UI 绘制模块 (UI Kit)
// ----------------------------------------------------------------------------
// 成套「精致扁平现代风」控件：圆角面板、按钮、标签、文本。
// 全部代码绘制，带渐变/投影/高光/描边材质细节，禁止极简线条占位。
// 用法：场景创建 Button 实例管理命中与状态，draw() 时调用本模块绘制。
// ============================================================================

export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// 玻璃质感面板
export function drawPanel(ctx, x, y, w, h, opt = {}) {
  const r = opt.radius != null ? opt.radius : 18;
  const fill = opt.fill || 'rgba(255,255,255,0.10)';
  const stroke = opt.stroke || 'rgba(255,255,255,0.22)';
  ctx.save();
  if (opt.shadow !== false) {
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
  }
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  // 顶部高光
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0.18)');
  g.addColorStop(0.15, 'rgba(255,255,255,0.04)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  roundRectPath(ctx, x + 1.5, y + 1.5, w - 3, h - 3, r - 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// 通用文本
export function drawText(ctx, text, x, y, opt = {}) {
  const size = opt.size || 16;
  const font = opt.font || `'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`;
  ctx.save();
  ctx.font = `${opt.weight || 600} ${size}px ${font}`;
  ctx.textAlign = opt.align || 'center';
  ctx.textBaseline = opt.baseline || 'middle';
  if (opt.shadow !== false) {
    ctx.shadowColor = opt.shadowColor || 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = opt.shadowBlur || 6;
    ctx.shadowOffsetY = opt.shadowOffsetY || 2;
  }
  ctx.fillStyle = opt.color || '#ffffff';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// 漂浮标签（如 Mixing / Super）
export function drawLabel(ctx, text, x, y, opt = {}) {
  ctx.save();
  const padX = 22, padY = 12;
  ctx.font = `700 22px 'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2;
  const h = 46;
  drawPanel(ctx, x - w / 2, y - h / 2, w, h, {
    radius: h / 2,
    fill: opt.fill || 'rgba(124,92,255,0.85)',
    stroke: 'rgba(255,255,255,0.5)',
  });
  drawText(ctx, text, x, y + 1, { size: 22, color: '#fff', weight: 700 });
  ctx.restore();
}

// ============================================================================
// 按钮（管理命中区域与按下/禁用状态）
// ============================================================================
export class Button {
  constructor(x, y, w, h, label, onClick, opt = {}) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.label = label;
    this.onClick = onClick;
    this.opt = opt;
    this.state = 'normal'; // normal | pressed | disabled
    this.icon = opt.icon || null; // 'play' | 'share' | 'back' | 'more' | null
  }
  setDisabled(d) { this.state = d ? 'disabled' : 'normal'; }
  contains(px, py) {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }
  onDown(px, py) {
    if (this.state === 'disabled') return false;
    if (this.contains(px, py)) { this.state = 'pressed'; return true; }
    return false;
  }
  onUp(px, py) {
    if (this.state === 'disabled') return false;
    const wasPressed = this.state === 'pressed';
    this.state = 'normal';
    if (wasPressed && this.contains(px, py)) { this.onClick && this.onClick(); return true; }
    return false;
  }
  draw(ctx) {
    drawButton(ctx, this);
  }
}

export function drawButton(ctx, b) {
  const { x, y, w, h } = b;
  const r = b.opt.radius != null ? b.opt.radius : h / 2;
  const accent = b.opt.accent || '#7c5cff';
  const accent2 = b.opt.accent2 || '#28e0c8';
  const disabled = b.state === 'disabled';
  const pressed = b.state === 'pressed';

  ctx.save();
  // 投影
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = pressed ? 8 : 16;
  ctx.shadowOffsetY = pressed ? 2 : 8;

  const g = ctx.createLinearGradient(x, y, x, y + h);
  if (disabled) {
    g.addColorStop(0, '#5a5670');
    g.addColorStop(1, '#3c3950');
  } else if (pressed) {
    g.addColorStop(0, shade(accent, -22));
    g.addColorStop(1, shade(accent, -38));
  } else {
    g.addColorStop(0, accent2);
    g.addColorStop(1, accent);
  }
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 顶部高光
  const hg = ctx.createLinearGradient(x, y, x, y + h * 0.5);
  hg.addColorStop(0, 'rgba(255,255,255,0.30)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  roundRectPath(ctx, x + 2, y + 2, w - 4, h * 0.5 - 2, r - 2);
  ctx.fillStyle = hg;
  ctx.fill();

  // 描边
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  roundRectPath(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
  ctx.stroke();
  ctx.restore();

  // 图标 + 文字
  const cx = x + w / 2;
  if (b.icon && !b.label) {
    drawIcon(ctx, b.icon, cx, y + h / 2, disabled);
  } else if (b.icon && b.label) {
    // 修复对齐：先测量文字宽度，把「图标 + 间距 + 文字」作为整体水平居中，
    // 文字改用左对齐绘制（原实现文字 center 对齐画死在 x+40，与按钮宽度无关，
    // 导致长按钮上文字明显偏左且与图标重叠）。
    const size = b.opt.fontSize || 18;
    const font = b.opt.font || `'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`;
    ctx.save();
    ctx.font = `700 ${size}px ${font}`;
    const tw = ctx.measureText(b.label).width;
    ctx.restore();
    const iconW = 18, gap = 12;
    const startX = x + (w - (iconW + gap + tw)) / 2;
    drawIcon(ctx, b.icon, startX + iconW / 2, y + h / 2, disabled);
    drawText(ctx, b.label, startX + iconW + gap, y + h / 2 + 1, {
      size, font, align: 'left', color: disabled ? 'rgba(255,255,255,0.5)' : '#fff', weight: 700,
    });
  } else {
    drawText(ctx, b.label, cx, y + h / 2 + 1, {
      size: b.opt.fontSize || 18, color: disabled ? 'rgba(255,255,255,0.5)' : '#fff', weight: 700,
    });
  }
}

// 简易代码图标（UI 用，非角色美术）
function drawIcon(ctx, type, cx, cy, disabled) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = disabled ? 'rgba(255,255,255,0.5)' : '#ffffff';
  ctx.strokeStyle = disabled ? 'rgba(255,255,255,0.5)' : '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (type === 'play') {
    ctx.beginPath();
    ctx.moveTo(-7, -11); ctx.lineTo(10, 0); ctx.lineTo(-7, 11); ctx.closePath();
    ctx.fill();
  } else if (type === 'share') {
    // 节点图
    const pts = [[-9, 0], [9, -8], [9, 8]];
    ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], 3.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(pts[1][0], pts[1][1], 3.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(pts[2][0], pts[2][1], 3.5, 0, 7); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + 3, -2); ctx.lineTo(pts[1][0] - 3, -6);
    ctx.moveTo(pts[0][0] + 3, 2); ctx.lineTo(pts[2][0] - 3, 6);
    ctx.stroke();
  } else if (type === 'back') {
    ctx.beginPath();
    ctx.moveTo(8, -10); ctx.lineTo(-8, 0); ctx.lineTo(8, 10);
    ctx.stroke();
  } else if (type === 'more') {
    [[-8, 0], [0, 0], [8, 0]].forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill(); });
  }
  ctx.restore();
}

// 以 cover 方式将图片铺满目标矩形（保持比例，居中裁剪）
export function drawCover(ctx, img, x, y, w, h) {
  if (!img) return;
  const ir = img.width / img.height;
  const r = w / h;
  let dw, dh;
  if (ir > r) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

// 颜色明暗调整
export function shade(hex, percent) {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  const f = percent / 100;
  r = Math.max(0, Math.min(255, Math.round(r + r * f)));
  g = Math.max(0, Math.min(255, Math.round(g + g * f)));
  b = Math.max(0, Math.min(255, Math.round(b + b * f)));
  return `rgb(${r},${g},${b})`;
}
