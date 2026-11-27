// ============================================================================
// 国际化 (i18n)
// ----------------------------------------------------------------------------
// 默认语言由 game.config.js 的 defaultLocale 控制（英文）。游戏内无切换按钮，
// 同一页面只渲染单一语言。
// ============================================================================

import { LOCALES } from '../../config/locales.js';
import { GAME_CONFIG } from '../../config/game.config.js';
import { SHARE_COPY } from '../../config/locales.js';

let code = GAME_CONFIG.defaultLocale;
let current = LOCALES[code] || LOCALES.en;

export function setLocale(c) {
  if (LOCALES[c]) { code = c; current = LOCALES[c]; }
}
export function getLocaleCode() { return code; }
export function t(key) { return current[key] != null ? current[key] : key; }

export function shareCopy() {
  return SHARE_COPY[code] || SHARE_COPY.en;
}
