// ============================================================================
// 资源管理器 (Asset Manager)
// ----------------------------------------------------------------------------
// 预加载所有图片资源，提供同步取用接口。失败时仍可继续（不阻塞主流程）。
// ============================================================================

class AssetManager {
  constructor() {
    this.cache = {};
    this.successCount = 0;
    this.errorCount = 0;
    this.queue = [];
  }

  queueDownload(url) {
    this.queue.push(url);
  }

  downloadAll(onComplete) {
    if (this.queue.length === 0) {
      onComplete && onComplete();
      return;
    }
    let pending = this.queue.length;
    const done = () => {
      pending--;
      if (pending <= 0) onComplete && onComplete();
    };
    this.queue.forEach((url) => {
      const img = new Image();
      img.onload = () => { this.successCount++; this.cache[url] = img; done(); };
      img.onerror = () => { this.errorCount++; done(); };
      img.src = url;
    });
  }

  // 同步取用（需确保已 preload 完成）
  get(url) {
    return this.cache[url] || null;
  }

  isDone() {
    return this.queue.length === this.successCount + this.errorCount;
  }
}

export const assets = new AssetManager();
export default assets;
