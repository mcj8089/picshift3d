// ============================================================================
// 游戏总配置 (Game Config)
// ----------------------------------------------------------------------------
// 所有可调参数集中在此，方便统一修改。其余模块从这里读取。
// ============================================================================

export const GAME_CONFIG = {
  // 游戏名称（原创，不沿用原作命名）
  title: 'Prism Shift 3D',
  titleZh: '棱镜拼图 3D',

  // 默认语言：'en' | 'zh'（默认英文，与需求一致）
  defaultLocale: 'en',

  // 逻辑分辨率（实际渲染会按窗口等比缩放，保持该比例）
  baseWidth: 360,
  baseHeight: 640,

  // 拼图棋盘：3x3
  boardCols: 3,
  boardRows: 3,

  // 滑动动画时长（毫秒），与原作一致
  swipeSpeed: 500,
  // 标签动画/过场时长
  showHideDelay: 800,
  // 通关后停顿再进入下一关
  nextLevelDelay: 900,

  // 配色（精致扁平现代风：干净、对比柔和、带投影层次）
  palette: {
    bgTop: '#2b2150',
    bgBottom: '#100a26',
    panel: 'rgba(255,255,255,0.10)',
    panelBorder: 'rgba(255,255,255,0.22)',
    accent: '#7c5cff',
    accent2: '#28e0c8',
    textLight: '#ffffff',
    textDim: 'rgba(255,255,255,0.65)',
    shadow: 'rgba(0,0,0,0.35)',
  },

  // 社交分享卡片落款网址
  shareUrl: 'https://pipygames.com',
  siteName: 'pipygames.com',
};

export default GAME_CONFIG;
