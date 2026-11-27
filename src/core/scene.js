// ============================================================================
// 场景基类 (Scene)
// ----------------------------------------------------------------------------
// 每个场景实现 onEnter / onExit / update(ctx, dt) 与指针回调。
// 场景通过 game.showScene(id) 切换。
// ============================================================================

export class Scene {
  constructor(id) {
    this.id = id;
  }
  onEnter() {}
  onExit() {}
  update(/* ctx, dt */) {}
  onPointerDown(/* x, y */) {}
  onPointerMove(/* x, y */) {}
  onPointerUp(/* x, y */) {}
}

export default Scene;
