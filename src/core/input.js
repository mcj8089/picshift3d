// ============================================================================
// 滑动检测 (Swipe Detector)
// ----------------------------------------------------------------------------
// 将连续的指针事件识别为四方向滑动（UP/RIGHT/DOWN/LEFT）。
// 桌面端鼠标、移动端触控统一走指针事件，逻辑一致。
// ============================================================================

export const SWIPE = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };

export class SwipeDetector {
  constructor(minLength = 24) {
    this.minLength = minLength;
    this.active = false;
    this.startX = 0;
    this.startY = 0;
    this.curX = 0;
    this.curY = 0;
  }

  start(x, y) {
    this.active = true;
    this.startX = x; this.startY = y;
    this.curX = x; this.curY = y;
  }

  move(x, y) {
    if (!this.active) return -1;
    this.curX = x; this.curY = y;
    return -1; // 方向在 end 时判定（与原作一致，抬手才生效）
  }

  end(x, y) {
    if (!this.active) return -1;
    this.active = false;
    const dx = x - this.startX;
    const dy = y - this.startY;
    const len = Math.hypot(dx, dy);
    if (len < this.minLength) return -1;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0 ? SWIPE.RIGHT : SWIPE.LEFT;
    }
    return dy > 0 ? SWIPE.DOWN : SWIPE.UP;
  }

  get info() {
    return {
      direction: this.end(this.curX, this.curY),
      startX: this.startX, startY: this.startY,
      endX: this.curX, endY: this.curY,
      length: Math.hypot(this.curX - this.startX, this.curY - this.startY),
    };
  }
}

export default SwipeDetector;
