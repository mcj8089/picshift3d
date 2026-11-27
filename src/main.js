// ============================================================================
// 入口 (main.js)
// ----------------------------------------------------------------------------
// 装配引擎、场景、SDK，预加载资源，执行域名锁校验，启动主循环。
// ============================================================================

import { game } from './core/game.js';
import { assets } from './core/assetManager.js';
import { StartScene } from './game/startScene.js';
import { SelectScene } from './game/selectScene.js';
import { BoardScene } from './game/boardScene.js';
import { PipySDK } from './sdk/pipysdk.src.js';
import { setLocale } from './core/i18n.js';
import { GAME_CONFIG } from '../config/game.config.js';
import { LEVELS } from '../config/levels.js';

setLocale(GAME_CONFIG.defaultLocale);

// 预加载全部图片（12 关主图 + 背景 + 分享卡）
const queued = new Set();
LEVELS.forEach((l) => {
  if (!queued.has(l.image)) { assets.queueDownload(l.image); queued.add(l.image); }
  if (!queued.has(l.bg)) { assets.queueDownload(l.bg); queued.add(l.bg); }
});
if (!queued.has('assets/images/ui_share_card.png')) assets.queueDownload('assets/images/ui_share_card.png');

function boot() {
  const canvas = document.getElementById('game');
  game.init(canvas, GAME_CONFIG);

  game.registerScene('start', new StartScene());
  game.registerScene('select', new SelectScene());
  game.registerScene('board', new BoardScene());

  // SDK 初始化 + 域名锁校验
  PipySDK.init({ game: GAME_CONFIG.title });
  const dchk = PipySDK.domainCheck();
  if (!dchk.allowed) {
    const note = document.getElementById('domain-note');
    if (note) note.classList.add('show');
  }

  // 分享面板昵称键盘输入
  window.addEventListener('keydown', (e) => {
    if (game.sharePanel && game.sharePanel.open) game.sharePanel.onKey(e);
  });

  // 资源加载完成后启动
  assets.downloadAll(() => {
    const splash = document.getElementById('splash');
    if (splash) splash.classList.add('hidden');
    game.showScene('start');
    game.run();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
