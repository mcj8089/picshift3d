// ============================================================================
// 多语言文案 (i18n)
// ----------------------------------------------------------------------------
// 支持 English(en) / 中文(zh)。默认语言为英文（由 game.config.js 控制）。
// 游戏内不显示语言切换按钮；同一页面只渲染单一语言，禁止中英文混排。
// 切换语言只改 config/game.config.js 里的 defaultLocale 即可。
// ============================================================================

export const LOCALES = {
  en: {
    title: 'Prism Shift 3D',
    subtitle: 'Slide · Match · Solve',
    play: 'PLAY',
    share: 'SHARE',
    back: 'BACK',
    more: 'ABOUT',
    selectTitle: 'Select Level',
    levelPrefix: 'Level',
    mixing: 'Mixing...',
    super: 'Super!',
    congratulations: 'Congratulations!',
    youWin: 'You Win!',
    locked: 'Locked',
    allClear: 'All levels cleared!',
    nicknameTitle: 'Pick a nickname',
    nicknamePlaceholder: 'Your nickname',
    shareInvite: '@{nick} invites you to play {game}!',
    shareText: 'This 3D slide puzzle is addictive. Can you solve it?',
    sharePageTitle: 'Prism Shift 3D - a relaxing 3D slide puzzle',
    guide: 'Swipe a row or column to shift the tiles. Arrange all 9 into order to win!',
    redirectNotice: 'Unauthorized domain. Redirecting...',
    loading: 'Loading',
    tapHint: 'Tap to start',
  },
  zh: {
    title: '棱镜拼图 3D',
    subtitle: '滑动 · 拼合 · 通关',
    play: '开始',
    share: '分享',
    back: '返回',
    more: '关于',
    selectTitle: '选择关卡',
    levelPrefix: '第',
    mixing: '打乱中...',
    super: '太棒了！',
    congratulations: '恭喜通关！',
    youWin: '你赢了！',
    locked: '未解锁',
    allClear: '全部关卡已通关！',
    nicknameTitle: '取个昵称',
    nicknamePlaceholder: '你的昵称',
    shareInvite: '@{nick} 邀请你来玩 {game}！',
    shareText: '这款 3D 滑块拼图太上头了，你能解出来吗？',
    sharePageTitle: '棱镜拼图 3D - 一款轻松的 3D 滑块拼图',
    guide: '滑动某一行或某一列来平移方块，把 9 块按顺序排好即可通关！',
    redirectNotice: '非授权域名，正在跳转...',
    loading: '加载中',
    tapHint: '点击开始',
  },
};

// 社交平台分享文案（含裂变句式）
export const SHARE_COPY = {
  en: {
    pageTitle: 'Prism Shift 3D',
    invite: (nick, game) => `@${nick} invites you to play ${game}!`,
    text: 'This 3D slide puzzle is addictive. Can you solve it?',
    hashtags: ['#PrismShift3D', '#puzzle', '#gaming'],
  },
  zh: {
    pageTitle: '棱镜拼图 3D',
    invite: (nick, game) => `@${nick} 邀请你来玩 ${game}！`,
    text: '这款 3D 滑块拼图太上头了，你能解出来吗？',
    hashtags: ['#棱镜拼图3D', '#拼图', '#小游戏'],
  },
};

export default LOCALES;
