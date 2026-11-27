// 跨场景共享状态（当前关卡、解锁进度等）
export const gameState = {
  currentLevel: 0, // 0-based 索引
  unlocked: 1,     // 已解锁关卡数（1..12）
};
export default gameState;
