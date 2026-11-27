// ============================================================================
// 3D 美术渲染器 (Art Renderer) —— Three.js 全 3D 还原
// ----------------------------------------------------------------------------
// 将原作「线框彩色立方体」替换为：承载全新原创插画的 3D 漂浮面板，
// 在透视相机下轻微旋转 + 呼吸缩放 + 背景辉光 + 漂浮粒子，呈现精致的 3D 体量感。
// 棋盘的 9 个 tile 每帧从该渲染画布按原位切片采样（与原作从 3D 画布采样的逻辑一致）。
// 规避「几何方块/线框」红线：画面主体为原创插画，几何体仅作背景辉光与粒子特效。
// ============================================================================

import * as THREE from 'three';

export class ArtRenderer {
  constructor(image, opts = {}) {
    this.size = opts.size || 300;
    this.accent = opts.accent || '#7c5cff';
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this._use2d = false;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true, // 保证 drawImage 采样稳定
      });
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(this.size, this.size, false);
    } catch (e) {
      // WebGL 不可用：降级为 2D 绘制（仍保留旋转观感）
      this._use2d = true;
      this._ctx2d = this.canvas.getContext('2d');
      this._img = image;
    }

    if (!this._use2d) {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      this.camera.position.z = 3.3;

      // 背景辉光（径向渐变，主题色 → 透明），提供纵深与质感
      this._bg = new THREE.Mesh(
        new THREE.PlaneGeometry(9, 9),
        new THREE.MeshBasicMaterial({
          map: this._makeGlowTexture(this.accent),
          transparent: true,
          depthWrite: false,
        })
      );
      this._bg.position.z = -1.5;
      this.scene.add(this._bg);

      // 主面板：承载插画
      // 尺寸说明：相机 FOV45/z=3.3 下视口高 2.73；面板 2.9 在最大旋转
      // (ry=0.28, rx=0.16) + 呼吸缩放最低点时投影宽度会小于视口，
      // 画布边缘露出透明边距，被拼图切片采样后呈现紫色竖条。
      // 加大到 3.2 保证任意姿态下完全覆盖视口（画面轻微裁切放大，无碍）。
      this.texture = this._makeTexture(image);
      this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 3.2, 1, 1),
        new THREE.MeshBasicMaterial({ map: this.texture, transparent: true })
      );
      this.scene.add(this.plane);

      this._addParticles();
      this._tmpColor = new THREE.Color();
    }
    this.time = 0;
  }

  _makeTexture(image) {
    const tex = new THREE.Texture(image);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  _makeGlowTexture(color) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    const col = new THREE.Color(color);
    const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
    grad.addColorStop(0, `rgba(${rgb},0.55)`);
    grad.addColorStop(0.5, `rgba(${rgb},0.18)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _addParticles() {
    const N = 60;
    const positions = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2 - 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  setImage(image) {
    if (this.texture) this.texture.dispose();
    this.texture = this._makeTexture(image);
    this.plane.material.map = this.texture;
    this.plane.material.needsUpdate = true;
  }

  renderFrame(dt) {
    this.time += dt;
    const t = this.time;
    if (this._use2d) { this._render2d(t); return; }
    // 轻微 3D 旋转 + 呼吸缩放，营造体量感而不暴露透明边缘
    this.plane.rotation.y = Math.sin(t * 0.0006) * 0.28;
    this.plane.rotation.x = Math.cos(t * 0.0005) * 0.16;
    const s = 1 + Math.sin(t * 0.0011) * 0.015;
    this.plane.scale.set(s, s, s);
    // 粒子缓慢自转 + 漂浮
    if (this.particles) {
      this.particles.rotation.z = t * 0.0001;
      this.particles.rotation.y = t * 0.00008;
    }
    this.renderer.render(this.scene, this.camera);
  }

  // WebGL 不可用时的 2D 降级：带轻微旋转/缩放的插画
  _render2d(t) {
    const g = this._ctx2d;
    const S = this.size;
    g.clearRect(0, 0, S, S);
    // 背景辉光
    const grad = g.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S * 0.7);
    const col = this._tmpColor || (this._tmpColor = { r: 124, g: 92, b: 255 });
    grad.addColorStop(0, `rgba(124,92,255,0.35)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    g.save();
    g.translate(S / 2, S / 2);
    g.rotate(Math.sin(t * 0.0006) * 0.12);
    const sc = 0.92 + Math.sin(t * 0.0011) * 0.02;
    g.scale(sc, sc);
    g.drawImage(this._img, -S / 2, -S / 2, S, S);
    g.restore();
  }

  getCanvas() {
    return this.canvas;
  }

  resize(size) {
    this.size = size;
    this.canvas.width = size;
    this.canvas.height = size;
    if (this.renderer) this.renderer.setSize(size, size, false);
  }

  dispose() {
    if (this.renderer) this.renderer.dispose();
    if (this.texture) this.texture.dispose();
    if (this.plane) { this.plane.geometry.dispose(); this.plane.material.dispose(); }
  }
}

export default ArtRenderer;
