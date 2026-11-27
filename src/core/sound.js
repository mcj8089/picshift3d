// ============================================================================
// 音频系统 (Sound Manager) —— 全原创程序化合成，不抓取原作资源
// ----------------------------------------------------------------------------
// 覆盖：操作音效 / 战斗(拼合)音效 / 技能(通关)音效 / UI 音效 / 循环 BGM / 结算音效。
// 使用 Web Audio 实时合成，离线可用、零外部依赖；同时 tools/gen_audio.py
// 可导出等价 WAV 至 assets/audio/ 作为交付物料。
// ============================================================================

class SoundManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this._unlocked = false;
  }

  // 必须在用户手势中调用以解锁音频
  init() {
    if (this.ctx) { this._resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this._unlocked = true;
    } catch (e) {
      this.ctx = null;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  // 通用单音合成
  _blip({ freq = 440, type = 'sine', dur = 0.12, gain = 0.3, slideTo = null, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(this.master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  // 音效映射
  play(name) {
    if (!this.ctx || this.muted) return;
    this._resume();
    switch (name) {
      case 'tap': this._blip({ freq: 520, type: 'triangle', dur: 0.08, gain: 0.25 }); break;
      case 'ui': this._blip({ freq: 680, type: 'sine', dur: 0.09, gain: 0.22 }); break;
      case 'swipe': this._blip({ freq: 320, type: 'sawtooth', dur: 0.14, gain: 0.18, slideTo: 620 }); break;
      case 'lock': this._blip({ freq: 200, type: 'square', dur: 0.12, gain: 0.18 }); break;
      case 'merge': this._blip({ freq: 440, type: 'triangle', dur: 0.10, gain: 0.22, slideTo: 660 }); break;
      case 'super':
        this._blip({ freq: 523, type: 'triangle', dur: 0.12, gain: 0.3 });
        this._blip({ freq: 659, type: 'triangle', dur: 0.14, gain: 0.3, delay: 0.1 });
        this._blip({ freq: 784, type: 'triangle', dur: 0.18, gain: 0.3, delay: 0.2 });
        break;
      case 'win':
        [523, 659, 784, 1046].forEach((f, i) =>
          this._blip({ freq: f, type: 'triangle', dur: 0.22, gain: 0.32, delay: i * 0.12 }));
        break;
      case 'fail': this._blip({ freq: 300, type: 'sawtooth', dur: 0.25, gain: 0.2, slideTo: 120 }); break;
      default: break;
    }
  }

  // 循环 BGM：轻快琶音
  startBGM() {
    if (!this.ctx || this.bgmTimer) return;
    const scale = [261.6, 329.6, 392.0, 523.2, 392.0, 329.6];
    this.bgmTimer = setInterval(() => {
      if (this.muted) return;
      const f = scale[this.bgmStep % scale.length];
      this._blip({ freq: f, type: 'sine', dur: 0.35, gain: 0.08 });
      if (this.bgmStep % 2 === 0) this._blip({ freq: f / 2, type: 'sine', dur: 0.4, gain: 0.05 });
      this.bgmStep++;
    }, 380);
  }

  stopBGM() {
    if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
  }
}

export const sound = new SoundManager();
export default sound;
