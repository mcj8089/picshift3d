// ============================================================================
// 关卡配置 (Levels)
// ----------------------------------------------------------------------------
// 12 关，玩法/判定与原作 1:1 对齐：3x3 循环平移拼图，滑动整行/整列。
// replaySeq 为"演示/打乱"序列（d=方向, r=行/列索引），与原作一致。
// 方向编码：UP=0, RIGHT=1, DOWN=2, LEFT=3
//   - UP / DOWN 时 r 为「列」索引
//   - LEFT / RIGHT 时 r 为「行」索引
// 每关 replaySpeed 逐关加快（玩家反应窗口变短），与原作节奏一致。
// 各关主图与背景使用全新原创 AI 插画（assets/images/）。
// ============================================================================

export const DIR = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };

export const LEVELS = [
  { id: 1,  name: 'Cosmic Launch',   image: 'assets/images/level_01.png', bg: 'assets/images/ui_bg_start.png',  replaySpeed: 1000, replaySeq: [{ d: 0, r: 1 }, { d: 1, r: 0 }] },
  { id: 2,  name: 'Coral Reef',      image: 'assets/images/level_02.png', bg: 'assets/images/ui_bg_select.png', replaySpeed: 1000, replaySeq: [{ d: 0, r: 1 }, { d: 2, r: 0 }, { d: 2, r: 2 }] },
  { id: 3,  name: 'Enchanted Forest',image: 'assets/images/level_03.png', bg: 'assets/images/ui_bg_board.png',  replaySpeed: 1000, replaySeq: [{ d: 2, r: 2 }, { d: 2, r: 0 }, { d: 0, r: 1 }, { d: 1, r: 1 }] },
  { id: 4,  name: 'Candy Land',      image: 'assets/images/level_04.png', bg: 'assets/images/ui_bg_start.png',  replaySpeed: 1000, replaySeq: [{ d: 0, r: 0 }, { d: 0, r: 2 }, { d: 2, r: 1 }] },
  { id: 5,  name: 'Neon City',       image: 'assets/images/level_05.png', bg: 'assets/images/ui_bg_select.png', replaySpeed: 800,  replaySeq: [{ d: 3, r: 1 }, { d: 1, r: 0 }, { d: 1, r: 2 }, { d: 1, r: 2 }, { d: 3, r: 1 }, { d: 1, r: 0 }] },
  { id: 6,  name: 'Desert Oasis',    image: 'assets/images/level_06.png', bg: 'assets/images/ui_bg_board.png',  replaySpeed: 800,  replaySeq: [{ d: 3, r: 1 }, { d: 1, r: 0 }, { d: 0, r: 2 }, { d: 1, r: 2 }, { d: 3, r: 1 }, { d: 0, r: 0 }] },
  { id: 7,  name: 'Arctic Aurora',   image: 'assets/images/level_07.png', bg: 'assets/images/ui_bg_start.png',  replaySpeed: 800,  replaySeq: [{ d: 3, r: 1 }, { d: 1, r: 0 }, { d: 1, r: 2 }, { d: 1, r: 2 }, { d: 3, r: 1 }, { d: 0, r: 2 }, { d: 2, r: 1 }, { d: 1, r: 0 }] },
  { id: 8,  name: 'Lava Forge',      image: 'assets/images/level_08.png', bg: 'assets/images/ui_bg_select.png', replaySpeed: 700,  replaySeq: [{ d: 3, r: 1 }, { d: 0, r: 1 }, { d: 1, r: 2 }, { d: 1, r: 2 }] },
  { id: 9,  name: 'Star Whale',      image: 'assets/images/level_09.png', bg: 'assets/images/ui_bg_board.png',  replaySpeed: 700,  replaySeq: [{ d: 3, r: 1 }, { d: 0, r: 1 }, { d: 1, r: 2 }, { d: 1, r: 2 }, { d: 3, r: 1 }, { d: 1, r: 0 }] },
  { id: 10, name: 'Brass Skies',     image: 'assets/images/level_10.png', bg: 'assets/images/ui_bg_start.png',  replaySpeed: 600,  replaySeq: [{ d: 3, r: 1 }, { d: 0, r: 0 }, { d: 3, r: 1 }, { d: 2, r: 2 }, { d: 1, r: 0 }] },
  { id: 11, name: 'Bloom Garden',    image: 'assets/images/level_11.png', bg: 'assets/images/ui_bg_select.png', replaySpeed: 500,  replaySeq: [{ d: 3, r: 1 }, { d: 0, r: 0 }, { d: 3, r: 1 }, { d: 2, r: 2 }, { d: 0, r: 0 }, { d: 1, r: 0 }, { d: 3, r: 1 }, { d: 3, r: 2 }, { d: 2, r: 2 }, { d: 1, r: 0 }] },
  { id: 12, name: 'Treasure Cove',   image: 'assets/images/level_12.png', bg: 'assets/images/ui_bg_board.png',  replaySpeed: 300,  replaySeq: [{ d: 3, r: 1 }, { d: 0, r: 0 }, { d: 3, r: 1 }, { d: 2, r: 2 }, { d: 0, r: 0 }, { d: 1, r: 0 }, { d: 3, r: 1 }, { d: 3, r: 2 }, { d: 0, r: 0 }, { d: 3, r: 1 }, { d: 2, r: 2 }, { d: 0, r: 0 }, { d: 1, r: 0 }, { d: 3, r: 1 }, { d: 3, r: 2 }, { d: 2, r: 2 }, { d: 1, r: 0 }] },
];

export default LEVELS;
