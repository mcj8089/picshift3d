// ============================================================================
// 轻量缓动引擎 (Tween)
// ----------------------------------------------------------------------------
// 兼容原作 TWEEN 用法：new TWEEN.Tween(obj).to(props, ms).easing(fn)
//   .onUpdate(cb).onComplete(cb).start();  TWEEN.update() 每帧调用。
// 支持 .chain() 串联。TWEEN.removeAll() 清空。
// ============================================================================

const _tweens = [];

const Easing = {
  Linear: { None: (k) => k },
  Quadratic: {
    In: (k) => k * k,
    Out: (k) => k * (2 - k),
    InOut: (k) => (k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k),
  },
};

class Tween {
  constructor(obj) {
    this._obj = obj;
    this._to = {};
    this._from = {};
    this._duration = 1000;
    this._easing = Easing.Linear.None;
    this._onUpdate = null;
    this._onComplete = null;
    this._elapsed = 0;
    this._started = false;
    this._finished = false;
    this._chained = null;
  }
  to(props, duration) {
    this._to = props;
    if (duration != null) this._duration = duration;
    return this;
  }
  easing(fn) { this._easing = fn || Easing.Linear.None; return this; }
  onUpdate(cb) { this._onUpdate = cb; return this; }
  onComplete(cb) { this._onComplete = cb; return this; }
  chain(t) { this._chained = t; return t; }
  start() {
    this._from = {};
    for (const k in this._to) this._from[k] = this._obj[k];
    this._elapsed = 0;
    this._started = true;
    this._finished = false;
    _tweens.push(this);
    return this;
  }
  _update(dt) {
    if (this._finished) return;
    this._elapsed += dt;
    let t = this._duration <= 0 ? 1 : Math.min(1, this._elapsed / this._duration);
    const e = this._easing(t);
    for (const k in this._to) {
      this._obj[k] = this._from[k] + (this._to[k] - this._from[k]) * e;
    }
    this._onUpdate && this._onUpdate.call(this._obj);
    if (t >= 1) {
      this._finished = true;
      this._onComplete && this._onComplete.call(this._obj);
      if (this._chained) this._chained.start();
    }
  }
}

export const TWEEN = {
  Tween,
  Easing,
  update(dt) {
    // 防御性修复：onComplete 里可能启动新 tween（打乱序列链式回调）。
    // 若边遍历边按旧索引 splice，会把本轮新加入的 tween 误删。
    // 因此先快照遍历，结束后统一移除已完成的 tween。
    const snapshot = _tweens.slice();
    for (const tw of snapshot) tw._update(dt);
    for (let i = _tweens.length - 1; i >= 0; i--) {
      if (_tweens[i]._finished) _tweens.splice(i, 1);
    }
  },
  removeAll() { _tweens.length = 0; },
};

export default TWEEN;
