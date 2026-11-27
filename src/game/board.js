// ============================================================================
// 拼图核心逻辑 (Board / Cell)
// ----------------------------------------------------------------------------
// 与原作 1:1 对齐：3x3 网格，滑动「整行/整列循环平移」，胜利判定为拓扑判定
// （每个 tile 回到其原位 id == 位置索引），与画面内容无关。
// 9 个 tile 每帧从 3D 渲染画布按「原位切片」采样绘制（含越界环绕，和原作一致）。
// ============================================================================

export const COLS = 3;
export const ROWS = 3;

export class Cell {
  constructor(id, x, y) {
    this.id = id;       // 0..8，决定它显示「原图」的哪一块（home 切片）
    this.x = x;         // 当前所在列 0..2
    this.y = y;         // 当前所在行 0..2
    this.onPositionChange();
  }
  onPositionChange() {
    if (this.x < 0) this.x = COLS - 1;
    if (this.x > COLS - 1) this.x = 0;
    if (this.y < 0) this.y = ROWS - 1;
    if (this.y > ROWS - 1) this.y = 0;
  }
  // 在原图上的 home 切片左上角（源画布坐标）
  get srcX() { return (this.id % COLS) * (1 / COLS); }
  get srcY() { return Math.floor(this.id / COLS) * (1 / ROWS); }

  // 绘制该 tile：从 artCanvas 的 home 切片，绘制到棋盘目标位置，并做越界环绕
  drawCell(ctx, artCanvas, S, destX, destY, B, px, py) {
    const cellS = S / 3;
    const cellB = B / 3;
    const sx = this.srcX * S;
    const sy = this.srcY * S;
    // 主体
    ctx.drawImage(artCanvas, sx, sy, cellS, cellS, px, py, cellB, cellB);
    // 顶部溢出 → 环绕到底部
    if (py < destY) {
      const over = destY - py;
      ctx.drawImage(artCanvas, sx, sy, cellS, over, px, destY + cellB - over, cellB, over);
    } else if (py + cellB > destY + B) {
      const over = py + cellB - (destY + B);
      ctx.drawImage(artCanvas, sx, sy + cellS - over, cellS, over, px, destY, cellB, over);
    }
    // 左侧溢出 → 环绕到右侧
    if (px < destX) {
      const over = destX - px;
      ctx.drawImage(artCanvas, sx + cellS - over, sy, over, cellS, destX + cellB - over, py, over, cellB);
    } else if (px + cellB > destX + B) {
      const over = px + cellB - (destX + B);
      ctx.drawImage(artCanvas, sx, sy, over, cellS, destX, py, over, cellB);
    }
  }
}

export class Board {
  constructor() {
    this.cells = [];
    this.dx = [0, 0, 0]; // 每行 X 偏移（用于左右滑动）
    this.dy = [0, 0, 0]; // 每列 Y 偏移（用于上下滑动）
  }

  // 创建「已解」初始状态（id 与位置一一对应）
  reset() {
    this.cells = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        this.cells[r * COLS + c] = new Cell(c + COLS * r, c, r);
    this.dx = [0, 0, 0];
    this.dy = [0, 0, 0];
  }

  // —— 整列向上循环平移（顶部环绕到底部）——
  moveUp(col) {
    for (let r = 0; r < ROWS; r++) this.cells[r * COLS + col].y--;
    const top = this.cells[0 * COLS + col];
    for (let r = 1; r < ROWS; r++) this.cells[(r - 1) * COLS + col] = this.cells[r * COLS + col];
    this.cells[(ROWS - 1) * COLS + col] = top;
    this._refresh();
  }
  moveDown(col) {
    for (let r = 0; r < ROWS; r++) this.cells[r * COLS + col].y++;
    const bottom = this.cells[(ROWS - 1) * COLS + col];
    for (let r = ROWS - 1; r > 0; r--) this.cells[r * COLS + col] = this.cells[(r - 1) * COLS + col];
    this.cells[0 * COLS + col] = bottom;
    this._refresh();
  }
  // —— 整行向左循环平移（左端环绕到右端）——
  moveLeft(row) {
    for (let c = 0; c < COLS; c++) this.cells[c + ROWS * row].x--;
    const left = this.cells[0 + ROWS * row];
    for (let c = 1; c < COLS; c++) this.cells[c - 1 + ROWS * row] = this.cells[c + ROWS * row];
    this.cells[(COLS - 1) + ROWS * row] = left;
    this._refresh();
  }
  moveRight(row) {
    for (let c = 0; c < COLS; c++) this.cells[c + ROWS * row].x++;
    const right = this.cells[(COLS - 1) + ROWS * row];
    for (let c = COLS - 1; c > 0; c--) this.cells[c + ROWS * row] = this.cells[c - 1 + ROWS * row];
    this.cells[0 + ROWS * row] = right;
    this._refresh();
  }

  _refresh() {
    for (const cell of this.cells) cell.onPositionChange();
  }

  // 拓扑胜利判定：每个位置上的 tile 的 id 等于其位置索引
  checkSolved() {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].id !== i) return false;
    }
    return true;
  }

  // 绘制整盘（artCanvas 为 3D 渲染画布，S 为其像素尺寸）
  draw(ctx, artCanvas, S, destX, destY, B) {
    const cellB = B / 3;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = this.cells[r * COLS + c];
        const px = destX + c * cellB + (this.dx[r] || 0);
        const py = destY + r * cellB + (this.dy[c] || 0);
        cell.drawCell(ctx, artCanvas, S, destX, destY, B, px, py);
      }
    }
  }
}

export default Board;
